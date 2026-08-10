# Jo Sprite Sheet — Regeneration Spec (game-ready)

The engine slices this into a frame atlas and renders Jo as `state × direction ×
frame`. The make-or-break is **normalization** (§2) — the previous sheet's art was
good but it was not actually normalized, so it can't drop in. Read §2 first.

## 1. Directions
Three facings only: **front (down), side-left, back (up)**. Do **not** draw a
right-facing set — the engine mirrors side-left for right. Side must genuinely face
**left** (scarf/bag trailing to the right).

## 2. Normalization — NON-NEGOTIABLE (this is what the last sheet got wrong)
- **Uniform cells.** Every frame in its own **256 × 256 px** cell on a strict grid,
  zero drift. Same cell size for every frame in the whole sheet.
- **Shared feet baseline.** The feet (lowest boot pixel) sit on the **same line,
  y = 239**, in EVERY cell — idle, run, loaded, all of it. This is the point the
  engine plants on the floor; if it varies, Jo bobs and floats.
- **Horizontal centering.** Character mass centered on **x = 128** (± a few px). No
  frame drifting left/right within its cell.
- **Constant scale.** Identical pixels-per-unit across ALL frames and states. A
  heavy-loaded Jo is the SAME body size as an empty Jo — only the *bag* changes.
  Never zoom/resize the character between frames.
- **Clean alpha.** Fully transparent background (as this version already has), no
  colored matte, no semi-transparent halo/fringe around the silhouette.

## 3. Character identity — lock it, frame to frame
The same Jo in every frame: near-black outfit, **gold scarf with a streaming tail**,
**blue headband**, spiky black hair, fingerless gloves, crossed bandolier, dark
boots. Same proportions, face, palette, outline weight, and light direction in every
frame — only the pose (and the bag, on load rows) changes. Frame-to-frame
consistency matters more than any single frame's detail.

## 4. Sheet layout
- **6 columns**, left-to-right = animation frames in play order.
- **One state per row**, top-to-bottom in the exact order in §5.
- States with fewer than 6 frames: left-align, leave the rest fully transparent.
- No gaps between cells (or one consistent, stated gutter — zero is simplest).

## 5. Rows (in this exact order)
Empty / unloaded:
1. `idle_down` — 4 frames (subtle breath + scarf sway)
2. `idle_side_l` — 4
3. `idle_up` — 4
4. `run_down` — 6 (full run cycle, loops seamlessly)
5. `run_side_l` — 6
6. `run_up` — 6
7. `pickup` — 5 (crouch, grab, rise) — front-facing
8. `hit` — 4 (recoil/stagger) — front-facing
9. `downed` — 4 (stagger → fall → lie still) — front-facing

Light load (small pouch on hip/back):
10. `run_light_down` — 6
11. `run_light_side_l` — 6
12. `run_light_up` — 6

Heavy load (big sack over the shoulder — the max-greed silhouette):
13. `run_heavy_down` — 6
14. `run_heavy_side_l` — 6
15. `run_heavy_up` — 6

Loaded rows are the SAME cycle as the empty run — same frame count, same foot-contact
timing, same anchoring — with the bag baked in and growing by tier. The engine uses
frame 0 of a loaded run as the "standing loaded" pose, so no separate loaded-idle is
needed.

*(Optional — only if consistency holds: a medium tier, rows 16–18 `run_medium_*`,
bag between light and heavy.)*

## 6. Animation rules
- **Run cycles must loop** (last frame flows into the first). Include both contact
  and both passing poses; alternate the leading leg.
- **Idle** is subtle (breath + scarf); a 4-frame ping-pong is fine.
- **pickup / hit / downed** must read clearly as their beat within the given frames.
- Keep the scarf lively but never crossing the feet baseline or leaving the cell.

## 7. Delivery
- Single **PNG**, transparent RGBA.
- Exact grid: **6 × 15 cells at 256×256** → 1536 × 3840 px (add rows for medium).
- If easy, also deliver each row as its own strip (not required).

## 8. If scope must be cut
Keep this priority so the engine always has a floor — and **never** sacrifice §2
normalization to fit more frames (a smaller, correctly-anchored sheet beats a bigger,
drifting one):
1. `run_down / side_l / up` (empty) + `idle_down` — locomotion is essential.
2. `hit`, `downed`, `pickup`.
3. `run_heavy_*` — the loaded silhouette (the "greed = the bag grows" beat).
4. `run_light_*`, then `idle_side_l / up`.
5. Optional medium tier.
