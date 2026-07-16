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

## `jo3d.html` — the 3D model + the animation system

The important thing here isn't the model — it's that the **animation system is
built rig-agnostically, so it's clean and fluid *before* a real model exists.** A
stylized primitive Jo stands in today; drop a real `assets/jo.glb` in and it
inherits all the motion with zero code changes.

### The system (this is the reusable part)

- **One locomotion solver** (`solveLocomotion(speed01, phase)`) is the single
  source of truth for the walk — leg/arm swing, knee bend, body bob, lean, roll,
  head counter-rotation, scarf lift. Every backend is driven from it, so the motion
  is identical no matter what mesh is on screen.
- **Eased controller** — input feeds a *smoothed* velocity (accel + decel), so
  starts and stops are fluid; turning is angular-damped; the stride phase is
  **distance-locked** so feet never skate at any speed. A live readout (bottom-right)
  shows the state — IDLE / WALK / RUN — and the speed blend.
- **Actor abstraction** — the controller talks to an `actor` interface
  (`{ root, bag?, update(dt, loco) }`). Three backends implement it:
  1. `PrimitiveActor` — the code-built Jo (drives group rotations from the solver).
  2. `ClipActor` — a glTF with **baked clips**, played as a 1-D locomotion blend
     tree (idle → walk → run by speed). This is the real-model path.
  3. `BoneActor` — a glTF that's **rigged but has no clips**; the solver drives its
     humanoid bones directly (best-effort name matching).

### Dropping in a real model

Put a `assets/jo.glb` next to `jo3d.html` and reload. `loadJo()` auto-selects the
backend: has animations → `ClipActor`; rigged, no animations → `BoneActor`;
otherwise it shows the mesh with an idle bob. No file → the primitive stand-in.

- **Format:** glTF/GLB. Any scale/origin — it's auto-fit to ~1.85 units tall with
  feet on the ground and centered.
- **Facing:** author the model facing **+Z** (it's rotated to face movement).
- **Clips (ideal):** name them so they match `/idle|breath|stand/i`, `/walk/i`,
  `/run|jog|sprint/i` (e.g. a Mixamo export). Missing clips gracefully reuse a
  neighbor.
- **Bag growth:** a node named `bag` scales with the haul; optional.

The primitive Jo (near-black outfit, gold scarf with a streaming tail, blue
headband, spiky hair, crossed bandolier, gloves/boots, loot bag that grows as you
grab gold) is just the placeholder that proves the system reads correctly. Three.js
r128 (`vendor/three.min.js`) and its `GLTFLoader` (`vendor/GLTFLoader.js`) are
vendored (MIT) so everything runs offline with no CDN.

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
