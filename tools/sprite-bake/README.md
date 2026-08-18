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
The pipeline works. The blocker was PROPORTION, not fidelity: the supplied
model is a standard 1.8 m UE-rigged humanoid (~7.5 heads) and Greedrun draws Jo
at a 14 px collision radius, where realistic proportions stop reading.

`bake_chibi.html` fixes that **in the baker**. Because the mesh is skinned,
scaling bones deforms the art with them, so the retarget is a parameter block:

```js
const RT = { head:2.0, thigh:0.78, foot:1.28, arm:0.86, hand:1.15 };
```

Nothing in the game changes. `JO_A_CELL` / `JO_A_SCALE` appear only inside
`drawJo()`; collision, doors, spawns and pathing all key off `player.r = 14`.
The sprite is paint on top of that circle — world generation never learns the
character's on-screen size.

Next knobs if it needs to go further: push `head` toward 2.4, drop `thigh`
toward 0.65, and compress the spine chain.
