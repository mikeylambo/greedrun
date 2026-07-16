# Greedrun — Web Version (character visuals build)

A playable web build of the HTML/canvas prototype with **Jo rendered as real
directional sprite art** instead of the old procedural vector shape. Built as a
side-by-side reference for what the character should look and feel like before
committing the full art pass in the engine.

## Two builds in here

- **`index.html`** — the 2D canvas prototype with Jo drawn as real directional
  **sprite art**, procedurally animated (see below).
- **`jo3d.html`** — a **true 3D character model** of Jo, rigged and animated in the
  browser with Three.js. Built to answer "how far can web production go from the
  reference art" — a real articulated model instead of a flat sprite, so it turns,
  steps, and streams its scarf in actual 3D with no bob/weave and no directional
  art needed.

## Run it

Open either file directly in a browser (double-click / `file://` works — no
server needed). Drag anywhere (or WASD / arrows) to move. In `index.html`, hold on
the exit to extract; in `jo3d.html`, walk over the gold to collect it and watch the
bag grow.

## `jo3d.html` — the 3D model

A stylized 3D Jo assembled from primitives and rigged as a bone hierarchy
(hips → torso → head, plus shoulder/elbow arms and hip/knee legs), matched to the
reference: near-black outfit, gold scarf (neck wrap + a physics-y trailing tail),
blue headband, spiky black hair, crossed leather bandolier, gloves, boots, and the
loot bag on his back that **grows as you collect gold**.

- **Real walk cycle** — thighs and shins swing and bend on opposite phase, arms
  counter-swing, the body bobs twice per stride, leans into the walk, and rolls
  slightly. The stride is distance-driven, so feet never skate.
- **True 3D turning** — Jo rotates to face his heading; no sprite flipping, no
  per-direction art, no mirror bugs. Idle eases back to a gentle breathing pose.
- **Scarf** — a chain of ribbon segments that hangs at rest and streams out behind
  him with speed, always fluttering.
- **Scene** — 3/4 follow camera, warm key light with soft shadow maps, a cool rim
  light, fog, a grid floor, and pillars for depth. Vendored `vendor/three.min.js`
  (Three.js r128, MIT) so it runs offline with no CDN.

This is the "reference target" build — it shows what the character can look like in
motion when it's a model, not a sprite. The 2D build below is the same character as
production-ready flat art.

## What changed vs. `docs/original_prototype.html`

Only Jo's rendering. Every game system — vault gen, guards, sentries, economy,
heat/notoriety, contracts — is untouched. The baseline prototype is preserved at
`docs/original_prototype.html` for comparison.

- **Real sprites.** `drawJo()` now draws the nine game-ready cells in
  `assets/jo/` (`jo_<front|side|back>_<empty|light|heavy>.png`) — the black
  outfit, yellow scarf, blue headband, and gloves, in the 3/4 look.
- **4-directional facing.** `player.face` is collapsed to front / back / side.
  The side art natively faces left, so it is mirrored for right-facing and left
  as-is: down → front, up → back, moving right → faces right, left → faces left.
- **Load tiers = greed made visible.** The sprite swaps by `carriedWeight`
  (empty → light → heavy), so the loot bag visibly grows from nothing to a small
  pouch to a sack hauled over the shoulder — the game's core "greed is weight"
  beat, now on the character itself.
- **Real procedural walk cycle.** We only have static directional art (no frame
  sheets), so the walk is a **cutout puppet animation**: the lower body is split
  into two overlapping leg halves that alternately lift and swing about the hip,
  while the torso — drawn on top, hiding the seam — bobs (two steps per stride),
  leans into the stride, and shifts its weight side to side. The stride is
  **distance-driven** (`joWalkPhase += distance`), so the steps never skate no
  matter the speed. Idle adds a gentle breathe. Smoke Step aura, i-frame blink,
  and the platform-height cue are all preserved.
- **Grounded, not floating.** Feet are planted on the shadow's center
  (`footY = r*1.02`), so Jo stands on the floor instead of hovering above it.
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
