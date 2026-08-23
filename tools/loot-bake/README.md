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
