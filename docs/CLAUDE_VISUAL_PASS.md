# Claude visual pass — Tier 0–1 (art direction only)

Goal: recover the *look* of the HTML prototype without touching game systems.
Nothing in `vault.gd`, `guard.gd`, `sentry.gd`, `economy.gd`, `progression.gd`,
`meta_save.gd`, or the run/economy logic was modified. Every change is
presentation: typography, lighting, glow, and screen-space mood.

## What changed

**Typography (the biggest single win)**
- Bundled the prototype's actual fonts (`assets/fonts/`): Cinzel + Barlow Semi
  Condensed, both OFL-licensed.
- `ui/greedrun_theme.tres` sets Barlow as the global UI font and is registered
  project-wide (`[gui] theme/custom` in `project.godot`), so every HUD label
  drops Godot's default sans automatically.
- `_title()` and `_button()` in `main.gd` now use Cinzel — so the haul value,
  timer, prompts, screen titles, and buttons render in the serif the prototype
  leans on.

**Lighting + bloom**
- Renderer switched to **Mobile** (`project.godot`). This is required for 2D glow
  and 2D lights; `gl_compatibility` supports neither. Still ships to phones.
- `_build_atmosphere()` in `main.gd` adds a `WorldEnvironment` with additive 2D
  glow + `use_hdr_2d`, so bright gold loot / scarf / portal actually bloom.
- A warm `CanvasModulate` casts a subtle warm tone over the world layer only
  (the HUD lives on a separate CanvasLayer and is unaffected).
- Jo carries a warm `PointLight2D` (`player.gd`) that pools light on the floor as
  he moves — this alone does most of the "heist" mood. It shifts violet during
  Smoke Step.

**Soft glow instead of flat discs**
- `gfx/soft_light.tres` is one reusable radial white→transparent texture.
- Loot (`loot_item.gd`), Jo's aura (`player.gd`), and the exit portal
  (`portal.gd`) now draw this texture instead of hard-edged translucent circles,
  so glows have real falloff and pick up bloom.

**Screen-space atmosphere**
- `gfx/vignette.gdshader` + `scripts/fx_vignette.gd` add an always-on edge
  vignette that gains curse-violet and heat-red as Heat climbs, plus a red
  alarm flash. Driven from `_update_hud()` (heat) and `_toast()` (alarm/spotted).
  Purely cosmetic; it never reads or writes run state.

## Tuning knobs (all safe to tweak live)

- Bloom feel: `env.glow_intensity` / `glow_bloom` / `glow_hdr_threshold` in
  `_build_atmosphere()`. Lower the threshold to make more things bloom.
- Ambient warmth/darkness: the `CanvasModulate.color` in `_build_atmosphere()`.
- Jo's light reach/warmth: `_lantern.texture_scale` / `energy` / `color` in
  `player.gd._ready()`.
- Vignette strength and tint: the constants and `heat_col`/`curse_col` uniforms
  in `gfx/vignette.gdshader`; response speed in `fx_vignette.gd._process()`.
- Loot glow size/strength: `glow_radius` / `glow_strength` in `loot_item.gd`.

## If you must stay on the Compatibility renderer

2D **glow** (the WorldEnvironment bloom) needs Mobile/Forward+. Everything else —
fonts, the soft-light textures, Jo's PointLight2D, the vignette — works on
Compatibility too. To revert: set both `renderer/rendering_method*` back to
`gl_compatibility` and delete the `WorldEnvironment` block in
`_build_atmosphere()`. You keep ~80% of the look, minus the bloom.

## Not done here (deliberately out of Tier 0–1)

Guard/sentry redraws, particle polish, real character sprites, scarf trail as a
Line2D, and any wall/floor texturing. Those are Tier 2+ and belong on top of a
look that already reads right.

> Note: this pass was authored without a Godot runtime to compile against. The
> changes are conservative and isolated, but open the project and press F5 once
> to let the editor import the fonts/textures and surface any environment-value
> tweaks you want.

## v0.1.4 — gameplay bugfix (logic, not visual)

Fixed: the Decision Artifact overlay never closed after choosing. `_choose_artifact()`
resolved the artifact (which unpauses the run) but never hid the menu, so the run
resumed *behind* the full-screen overlay and guards could kill you while you were
blind. Now it hides the screen first, then resolves — matching the One More Thing
handler. This is a base-port logic bug (present in v0.1.3 and in any build derived
from it), not something the visual pass introduced.
