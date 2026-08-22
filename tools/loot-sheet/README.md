# Loot reference sheet

Regenerates `docs/loot-reference.png` — every drawable loot kind rendered through
the game's own `drawLoot()`, cropped straight out of the canvas backing store.

```bash
export LOOT_OUT=/tmp/greedrun-loot
node   tools/loot-sheet/render.mjs     # 11 crops + a bare backdrop, from web/index.html
python3 tools/loot-sheet/compose.py    # -> docs/loot-reference.png
```

Requires `playwright-core` (already a devDependency) and Pillow.

## Why it renders rather than draws

The sheet has to be *true*, not illustrative — it is a brief handed to an artist,
and every number on it drives a purchase. So the pipeline never re-implements
`drawLoot()`. It boots the real game, builds vault seed 7, clears the floor, and
parks one loot piece at a fixed anchor so all eleven share an identical backdrop.
Pixels come from `canvas.drawImage(gameCanvas, …).toDataURL()`, which reads the
backing store verbatim — an element screenshot would resample it.

Three details that matter if you touch this:

- **`deviceScaleFactor: 2`** pushes `RS` to its `clampNum(…, 1, 2.5)` ceiling. 2.5
  backing pixels per world unit is the sharpest the engine ever draws loot, so it
  is the honest upper bound for the sheet.
- **`l.glow` is re-zeroed one frame before the read.** The sim advances it at
  `dt*4` forever; zeroing it gives `pulse === 1` and artifact rotation `0` — the
  canonical resting pose rather than an arbitrary frame.
- **The Threshold Offering pedestals draw their own gold nameplates** and will
  photobomb any grid laid over the entrance. Their draw loop only checks
  `dp.taken`, not `runPerk.id`, so the single-anchor approach is what avoids them
  — not a flag.

`compose.py` carries the stat table. If `LOOT_TYPES` changes in `web/index.html`,
change it here too; the two are not wired together.
