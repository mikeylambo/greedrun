# Sprite baker — render Jo's atlas from the rigged 3D model

An experiment, not a shipping path yet. Renders `assets/jo/atlas.png`-shaped
frames from a rigged glTF by posing the rig with the game's own
`solveLocomotion()` curves (lifted from `web/jo3d.html`) and screenshotting an
orthographic camera.

**Why this approach:** the earlier Gemini sheet failed on *normalization* —
`SPRITE_SHEET_SPEC.md` says "the previous sheet's art was good but it was not
actually normalized, so it can't drop in." Rendering from one rig makes that
failure impossible: one camera, one crop rect per row, feet computed onto the
y=118 baseline. Every frame agrees by construction.

## Run
1. Put the rigged GLB next to `bake.html` as `base_basic_pbr.glb`, with
   `three.min.js` and `GLTFLoader.js` copied from `web/vendor/`.
2. `python3 -m http.server 8731` in that directory (GLTFLoader needs XHR, which
   Chromium blocks over `file://`).
3. `node tools/sprite-bake/bake.mjs` — writes 128px frames to `frames/`.
4. Assemble with the snippet in this repo's history, or reuse
   `web/assets/jo/build_atlas.py`'s anchoring maths (cell 128, feet 118, cx 64).

## Known finding (2026-08-18)
The pipeline works, but the model is a standard 1.8 m UE-rigged humanoid —
about 7.5 heads tall. Greedrun's vector Jo is drawn chibi (~3 heads) and reads
far better at the game's zoom, where the player collision radius is 14 px.
Using this model as-is would need a proportion retarget (scale head up, shorten
limbs) before it beats what already ships.
