# Loot baker — static model → game-ready sprite

Turns a generated 3D loot model into a 128 px sprite that drops into
`web/assets/loot/`. Static geometry only; Jo's rigged pipeline is
`tools/sprite-bake/`.

```bash
node    tools/loot-bake/bake.mjs /path/to/model-dir Thing.obj /tmp/raw.png 35 0
python3 tools/loot-bake/post.py  /tmp/raw.png web/assets/loot/coin.png --units 11 --outline 4
```

`bake.mjs` copies the vendored three + loaders into the model dir and serves it
(the loaders need XHR, which Chromium refuses over `file://`). Accepts OBJ+MTL;
GLB works too by swapping the loader.

## The rig is fixed on purpose

Camera and lights live in `bake.html`, not in the prompt: orthographic, 35°
elevation, straight-on azimuth, neutral key upper-left, cool fill right, warm
gold rim behind. Every piece goes through the identical rig or the eleven won't
look like a set. See `docs/LOOT_SLOTS.md`.

Lighting is deliberately dim (ambient 0.22, key 1.15). Greedrun's floors are
near-black; a brightly-lit sprite reads as a sticker on the world rather than an
object in it. Contrast comes from the key and the specular, not from lifting the
floor. Every light is overridable by query param for one-off tuning.

## Two traps, both silent

- **`preserveDrawingBuffer: true` is required.** Without it `toDataURL()` reads a
  cleared buffer and returns a *blank PNG with no error*.
- **Render on `LoadingManager.onLoad`, never in the OBJ callback.** The OBJ
  resolves before its colour map decodes (this one was 4.9 MB), and an incomplete
  sampler makes the material write alpha 0 — again silently blank.

Both failure modes look identical to success from the outside, so `bake.mjs`
refuses any render whose alpha coverage is zero. Keep that guard.

## post.py

Trims to the alpha box, scales so the widest axis spans `--units` world units at
4 px/unit, adds the `#050404` ink outline, and centres it in a 128 cell.

The ink is not optional. Without it the sprite dissolves into its own glow at
phone size — the halo is 4× the body, and a gold object inside a gold halo needs
a hard dark edge to hold an edge at all.

`--units` sets the hierarchy. The vector coin it replaces is a 10-unit circle;
11 keeps the cheapest item in the game reading as the smallest. Going to 14 looks
better in isolation and quietly breaks that.

## Splitting one model into two sprites

Two slots animate their parts separately — the shrine's crystal floats above its
altar and rises with the idle pulse, and the artifact's halo spins while the
relic inside it holds still. Fused into one image, either animates wrongly.

`split.py` separates them out of the mesh, so a fused generation does **not**
need regenerating:

```bash
python3 tools/loot-bake/split.py Shrine.obj --list          # what's in here?
python3 tools/loot-bake/split.py Shrine.obj --pick 0 --out altar.obj
python3 tools/loot-bake/split.py Shrine.obj --pick 1 --out crystal.obj
```

Floating parts are disconnected geometry, so components fall out for free. Note
generated meshes usually arrive **unwelded** — adjacent faces carry their own
copies of a shared corner — so components are found by welding on position
first. Index-based union-find reports ~1200 "components" for one solid object.

### Parts must share the whole model's frame

Baking a part on its own re-centres and re-scales it to fill the frame, which
destroys any register with its sibling. Bake the whole first, then feed back
what it reports:

```bash
R="shine=6 spec=241c33"
node tools/loot-bake/bake.mjs dir Shrine.obj /tmp/whole.png 35 0 $R
#   -> {"frustum":0.53,"scale":1.0020,"ctr":"0,0,0", ...}
node tools/loot-bake/bake.mjs dir altar.obj   /tmp/a.png 35 0 $R ctr=0,0,0 scale=1.0020 frustum=0.53
node tools/loot-bake/bake.mjs dir crystal.obj /tmp/b.png 35 0 $R ctr=0,0,0 scale=1.0020 frustum=0.53
python3 tools/loot-bake/post.py /tmp/a.png web/assets/loot/shrine_altar.png   --units 24 --nocrop
python3 tools/loot-bake/post.py /tmp/b.png web/assets/loot/shrine_crystal.png --units 24 --nocrop
```

`--nocrop` keeps the full frame instead of trimming to the art — that is what
holds the parts in register. Verified lossless on the Violet Crescent Rift: split
into its two crescents, baked in the shared frame and alpha-composited back, the
result differs from the whole render by **0 pixels**.

Because they stay in register, `drawLoot()` needs no per-part offsets — it draws
both cells at the same size and place, and scales the crystal about the origin
for the pulse.

## Directional sprites

One slot needs more than a single facing. The Skitterjewel flees anywhere, and a
sprite has one baked direction, so it gets three — `living_down`, `living_side`,
`living_up` — with side mirrored in-engine for rightward flight, the same
contract `web/assets/jo/SPRITE_SHEET_SPEC.md` sets for Jo.

Find which yaw is which by baking all four and looking; for the Emerald
Spindlebug it was yaw 0 = front, 90 = facing left, 180 = back, 270 = the mirror
of 90. Then bake the three you keep **in one shared frame** (`ctr`/`scale`/
`frustum` from any single probe) so they are the same size and sit at the same
height — otherwise the creature grows and hops as it turns.

## Sizing a model with limbs

`--units` scales the whole footprint, not the body. `docs/LOOT_SLOTS.md` lists
the Skitterjewel's body as 16 × 13, but a model with legs splayed out to the
sides is roughly 40% body — bake that at 16 and the creature ends up *smaller*
than the vector it replaces. It went in at **26**.

Ink scales with the thinnest feature, not the object. Legs about 2px wide
disappear inside a 4px outline — they merge into one black blob. Two pixels is
right for limbs; four is right for a solid mass like the coin heap.

## Working from a preview image instead of a model

`from_image.py` turns a flat render into a transparent sprite source that
`post.py` consumes exactly like a bake:

```bash
python3 tools/loot-bake/from_image.py shot.png --list                 # separable parts?
python3 tools/loot-bake/from_image.py shot.png --out /tmp/cut.png
python3 tools/loot-bake/post.py /tmp/cut.png web/assets/loot/mask.png --units 16 --outline 4
```

**The background is removed by flood fill from the corners, never by a global
colour key.** A global key punches every pixel that happens to match the
backdrop — which is exactly how `web/assets/jo/atlas.png` ended up 13% filled
when `build_atlas.py` keyed out the near-black outfit along with the checker.
Flood fill only eats pixels connected to the edge, so interior highlights and
white specular survive. Verified three ways:

- a known sprite flattened onto white and keyed back differs by **1 px of 16384**
  (edge antialiasing);
- a deliberately trapped case — a pure-white highlight *inside* dark art, on a
  white background — comes back at **alpha 255** where a global key would zero it;
- two disconnected blobs report as two parts, which is the shrine.

`--pick` selects parts, so a fused shrine preview splits into altar and crystal
without regenerating it — the same job `split.py` does on a mesh. Parts keep the
source frame, so they stay in register; run `post.py --nocrop` on each.

What an image cannot give you is a second camera. Facing is baked in, so a
directional slot (the Skitterjewel) still wants the model.
