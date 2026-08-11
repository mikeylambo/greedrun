#!/usr/bin/env python3
"""Normalize a Gemini Jo sprite sheet into a clean game atlas.

Input : a 6-col x 15-row sheet (idle/run/pickup/hit/downed + light/heavy loaded runs)
        exported with a baked neutral-gray "transparency" checkerboard (Gemini does
        this even on RGBA export) and baked row labels.
Output: web/assets/jo/atlas.png  — 768x1920, 6x15 grid of 128x128 cells, real alpha,
        each frame trimmed to its silhouette and RE-ANCHORED (feet on a shared
        baseline y=118, centered x=64), plus atlas_manifest.json (frames per row).

Run:  python3 web/assets/jo/build_atlas.py "web/Gemini_Generated_Image_...png"
"""
import sys, json
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "web/Gemini_Generated_Image_mupm1zmupm1zmupm.png"
COLS, ROWS = 6, 15
CELL, FEET, CX = 128, 118, 64          # output cell / feet baseline / center x
ROW_NAMES = ["idle_down","idle_side_l","idle_up","run_down","run_side_l","run_up",
             "pickup","hit","downed","run_light_down","run_light_side_l","run_light_up",
             "run_heavy_down","run_heavy_side_l","run_heavy_up"]


def knockout(im):
    """Erase the neutral-gray checker (both shades) and the white baked labels."""
    px = im.load(); W, H = im.size
    for y in range(H):
        for x in range(W):
            r, g, b, _ = px[x, y]
            if (max(r, g, b) - min(r, g, b)) <= 18 and max(r, g, b) >= 116:
                px[x, y] = (0, 0, 0, 0)
    return im


def build():
    src = knockout(Image.open(SRC).convert("RGBA"))
    W, H = src.size; cw, ch = W / COLS, H / ROWS
    al = src.split()[-1].load()
    atlas = Image.new("RGBA", (COLS * CELL, ROWS * CELL), (0, 0, 0, 0))
    counts = {}
    for r in range(ROWS):
        filled = 0
        for c in range(COLS):
            x0, y0, x1, y1 = int(c*cw), int(r*ch), int((c+1)*cw), int((r+1)*ch)
            minx = miny = 1 << 30; maxx = maxy = -1
            for yy in range(y0, y1):
                for xx in range(x0, x1):
                    if al[xx, yy] > 50:
                        minx = min(minx, xx); maxx = max(maxx, xx)
                        miny = min(miny, yy); maxy = max(maxy, yy)
            if maxx < 0 or (maxx - minx) * (maxy - miny) < 500:
                continue                                   # empty frame
            crop = src.crop((minx, miny, maxx + 1, maxy + 1))
            bw, bh = crop.size
            dx = max(c * CELL, int(c*CELL + CX - bw // 2))
            dy = max(r * CELL, int(r*CELL + FEET - bh))
            atlas.alpha_composite(crop, (dx, dy))
            filled += 1
        counts[ROW_NAMES[r]] = filled
    atlas.save("web/assets/jo/atlas.png")
    json.dump({"cell": CELL, "feet": FEET, "cx": CX, "cols": COLS,
               "rows": ROW_NAMES, "frames": counts},
              open("web/assets/jo/atlas_manifest.json", "w"), indent=2)
    print("wrote atlas.png (768x1920) and atlas_manifest.json:", counts)


if __name__ == "__main__":
    build()
