#!/usr/bin/env python3
"""Knock out and normalize the Jo 3x3 turnaround sheet into game-ready cells.

The source sheet (art_source/jo_turnaround.png, 1254x1254) is RGB with the
transparency checkerboard BAKED IN as literal pixels (#FEFEFE / #F0F0F0) — it has
no alpha channel. Columns are front/side/back, rows are bag tier empty/light/heavy.

Pipeline:
  1. Build an alpha channel: a pixel is checkerboard (removed) when it is BOTH
     neutral ((max-min) < 12) AND light (min > 225).
  2. Find the 3x3 grid from alpha row/column projections.
  3. Crop each figure to its alpha bounding box.
  4. Scale all 9 by ONE shared factor, keyed so the front/empty figure is
     FIGURE_H (200) px tall — heavy tiers stay taller; figures are NOT
     normalized independently.
  5. Composite each centered horizontally onto a CELL (256) px transparent square
     with the feet locked to baseline y=FEET_Y (240), i.e. the lowest opaque
     pixel lands on row 239.
  6. Write assets/jo/jo_{front|side|back}_{empty|light|heavy}.png and verify the
     baseline on every output.

Usage: python3 tools/knockout_normalize_jo.py [--src PATH] [--out DIR]
"""

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image

COLS = ["front", "side", "back"]
ROWS = ["empty", "light", "heavy"]

# Checkerboard knockout thresholds.
NEUTRAL_SPAN = 12  # (max - min) below this = colorless
LIGHT_FLOOR = 225  # min channel above this = light

# Output geometry.
CELL = 256
FEET_Y = 240
FIGURE_H = 200

# Sanity ranges for the detected grid bands ((low, high) per band, in px).
EXPECTED_COL_BANDS = [(197, 396), (555, 756), (881, 1091)]
EXPECTED_ROW_BANDS = [(53, 406), (439, 792), (815, 1181)]
BAND_MIN_SIZE = 40  # ignore stray speck runs narrower than this
BAND_MIN_PIXELS = 3  # a row/column needs this many opaque px to count


def build_alpha(rgb: np.ndarray) -> np.ndarray:
    """Alpha mask: 255 for figure pixels, 0 for baked-in checkerboard."""
    channel_max = rgb.max(axis=2).astype(np.int16)
    channel_min = rgb.min(axis=2).astype(np.int16)
    checker = ((channel_max - channel_min) < NEUTRAL_SPAN) & (channel_min > LIGHT_FLOOR)
    return np.where(checker, 0, 255).astype(np.uint8)


def find_bands(projection: np.ndarray) -> list[tuple[int, int]]:
    """Contiguous (start, end) runs where the alpha projection is occupied."""
    occupied = projection >= BAND_MIN_PIXELS
    bands: list[tuple[int, int]] = []
    start = None
    for i, on in enumerate(occupied):
        if on and start is None:
            start = i
        elif not on and start is not None:
            if i - start >= BAND_MIN_SIZE:
                bands.append((start, i - 1))
            start = None
    if start is not None and len(occupied) - start >= BAND_MIN_SIZE:
        bands.append((start, len(occupied) - 1))
    return bands


def check_bands(
    bands: list[tuple[int, int]], expected: list[tuple[int, int]], axis: str
) -> None:
    if len(bands) != 3:
        sys.exit(f"ERROR: expected 3 {axis} bands, found {len(bands)}: {bands}")
    for (lo, hi), (exp_lo, exp_hi) in zip(bands, expected):
        if hi < exp_lo or lo > exp_hi:
            sys.exit(
                f"ERROR: {axis} band ({lo},{hi}) does not overlap expected "
                f"({exp_lo},{exp_hi}) — is this the right sheet?"
            )


def crop_figure(rgba: np.ndarray, rows: tuple[int, int], cols: tuple[int, int]) -> np.ndarray:
    region = rgba[rows[0] : rows[1] + 1, cols[0] : cols[1] + 1]
    alpha = region[:, :, 3]
    occupied_rows = np.flatnonzero(alpha.any(axis=1))
    occupied_cols = np.flatnonzero(alpha.any(axis=0))
    if occupied_rows.size == 0:
        sys.exit(f"ERROR: empty figure in grid cell rows={rows} cols={cols}")
    return region[
        occupied_rows[0] : occupied_rows[-1] + 1, occupied_cols[0] : occupied_cols[-1] + 1
    ]


def resize_premultiplied(figure: np.ndarray, scale: float) -> np.ndarray:
    """Lanczos-resize RGBA with premultiplied alpha so checkerboard-adjacent
    edges do not smear a light halo into the figure."""
    height, width = figure.shape[:2]
    new_size = (max(1, round(width * scale)), max(1, round(height * scale)))
    as_float = figure.astype(np.float64)
    premultiplied = as_float.copy()
    premultiplied[:, :, :3] *= as_float[:, :, 3:4] / 255.0
    resized = np.asarray(
        Image.fromarray(np.clip(premultiplied, 0, 255).astype(np.uint8), "RGBA").resize(
            new_size, Image.LANCZOS
        )
    ).astype(np.float64)
    alpha = resized[:, :, 3:4]
    rgb = np.divide(
        resized[:, :, :3] * 255.0, alpha, out=np.zeros_like(resized[:, :, :3]), where=alpha > 0
    )
    out = np.concatenate([np.clip(rgb, 0, 255), alpha], axis=2).astype(np.uint8)
    out[out[:, :, 3] == 0] = 0
    return out


def composite_cell(figure: np.ndarray) -> np.ndarray:
    """Center horizontally on a CELL square with feet on the FEET_Y baseline."""
    alpha = figure[:, :, 3]
    occupied_rows = np.flatnonzero(alpha.any(axis=1))
    occupied_cols = np.flatnonzero(alpha.any(axis=0))
    figure = figure[
        occupied_rows[0] : occupied_rows[-1] + 1, occupied_cols[0] : occupied_cols[-1] + 1
    ]
    height, width = figure.shape[:2]
    if height > FEET_Y or width > CELL:
        sys.exit(f"ERROR: scaled figure {width}x{height} does not fit the {CELL} cell")
    cell = np.zeros((CELL, CELL, 4), dtype=np.uint8)
    top = FEET_Y - height
    left = round((CELL - width) / 2)
    cell[top : top + height, left : left + width] = figure
    return cell


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--src", default="art_source/jo_turnaround.png")
    parser.add_argument("--out", default="assets/jo")
    args = parser.parse_args()

    source = Image.open(args.src).convert("RGB")
    rgb = np.asarray(source)
    alpha = build_alpha(rgb)
    rgba = np.dstack([rgb, alpha])

    col_bands = find_bands((alpha > 0).sum(axis=0))
    row_bands = find_bands((alpha > 0).sum(axis=1))
    check_bands(col_bands, EXPECTED_COL_BANDS, "column")
    check_bands(row_bands, EXPECTED_ROW_BANDS, "row")

    figures = {
        (row_name, col_name): crop_figure(rgba, row_bands[r], col_bands[c])
        for r, row_name in enumerate(ROWS)
        for c, col_name in enumerate(COLS)
    }

    # One shared scale factor, keyed to the front/empty figure height.
    scale = FIGURE_H / figures[("empty", "front")].shape[0]

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    failures = 0
    for (row_name, col_name), figure in figures.items():
        cell = composite_cell(resize_premultiplied(figure, scale))
        path = out_dir / f"jo_{col_name}_{row_name}.png"
        Image.fromarray(cell, "RGBA").save(path)
        opaque_rows = np.flatnonzero(cell[:, :, 3].any(axis=1))
        baseline, top = opaque_rows[-1], opaque_rows[0]
        status = "ok" if baseline == FEET_Y - 1 else "BASELINE FAIL"
        if baseline != FEET_Y - 1:
            failures += 1
        print(f"{path}  figure_h={FEET_Y - top}  lowest_opaque_y={baseline}  {status}")

    if failures:
        sys.exit(f"ERROR: {failures} output(s) missed the y={FEET_Y - 1} baseline")
    print(f"OK: 9 cells written to {out_dir}, shared scale {scale:.4f}, feet locked at y={FEET_Y}")


if __name__ == "__main__":
    main()
