# Greedrun — Web Version (character visuals build)

A playable web build of the HTML/canvas prototype with **Jo rendered as real
directional sprite art** instead of the old procedural vector shape. Built as a
side-by-side reference for what the character should look and feel like before
committing the full art pass in the engine.

## Run it

Open `web/index.html` directly in a browser (double-click / `file://` works — no
server needed). Drag anywhere (or WASD / arrows) to move; hold on the exit to
extract.

## What changed vs. `docs/original_prototype.html`

Only Jo's rendering. Every game system — vault gen, guards, sentries, economy,
heat/notoriety, contracts — is untouched. The baseline prototype is preserved at
`docs/original_prototype.html` for comparison.

- **Real sprites.** `drawJo()` now draws the nine game-ready cells in
  `assets/jo/` (`jo_<front|side|back>_<empty|light|heavy>.png`) — the black
  outfit, yellow scarf, blue headband, and gloves, in the 3/4 look.
- **4-directional facing.** `player.face` is collapsed to front / back / side,
  with the side art mirrored for left-facing. Down → front, up → back,
  left/right → side.
- **Load tiers = greed made visible.** The sprite swaps by `carriedWeight`
  (empty → light → heavy), so the loot bag visibly grows from nothing to a small
  pouch to a sack hauled over the shoulder — the game's core "greed is weight"
  beat, now on the character itself.
- **Faked animation life.** We only have static directional art (no frame
  sheets), so the walk cycle is procedural: a vertical bob while moving, a gentle
  idle breathe, and a shadow that squashes on the step. The existing shadow,
  Smoke Step aura, i-frame blink, and platform-height cue are all preserved.
- **Safe fallback.** If the art hasn't loaded (or a file is missing), Jo falls
  back per-frame to the original vector rendering (`drawJoVector()`), so the game
  never breaks.

## Sprite geometry (for anyone editing the renderer)

Each cell is 256×256, transparent background, the figure horizontally centered at
x=128 with feet locked to the baseline at y=239. One shared scale (`JO_SCALE`)
keeps the load tiers' relative heights, so heavier tiers correctly read as
bigger. Source art and the normalization tool (`knockout_normalize_jo.py`) live
in the Godot spec build.

## Not in this build

Frame-by-frame walk/run/grab/hit/downed animation (the reference sheets are
concept art, not sliced game frames), guard/sentry/loot art, environment kits,
and audio. This build is scoped to getting **Jo's character model reading right
in motion** as the visual target.
