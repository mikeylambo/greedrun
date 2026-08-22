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
