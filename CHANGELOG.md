# Changelog

## Web build — location identity (every map fights differently)

- The four contract locations are no longer just palettes — each has a
  signature hazard, shown on the HUD objective line:
  - **Sunken Treasury** — flood pools: wading is 25% slower but swallows 55%
    of your loot noise (guards wade slower too). Splashes and ripples.
  - **Cliffside Fortress** — telegraphed wind gusts shove every ground
    creature (you and guards alike), plus one extra mesa to climb.
  - **Undercity Vaults** — pitch dark: you see a breathing lantern radius
    around Jo; in exchange, guards spot you 15% later. Distant drips.
  - **Old Mint** — coin presses on staggered warn→slam cycles: getting
    caught under one costs a heart, but a guard caught under one is
    stunned — bait chases through the presses.
- Free runs roll a location too, so the identity shows up everywhere; the
  How to Play screen documents it under "Places".
- New headless suite `tests/web_location_test.mjs` (`npm run test:location`)
  forces each theme and verifies pool slow/muffle ratios, gust cycles that
  move an idle player, the exact 0.85× dark-detection factor, and press
  crush/stun behavior.

## Web build — game-feel pass (audio & juice)

- Procedural audio: a fully synthesized WebAudio kit (no assets) — 22 named
  cues covering pickups (pitch scales with value), hits, shatters, alarms,
  the Hunter's entrance, sever groan/slam/reopen, landings, drops, the
  escape-hold charge, win/loss stingers, cash and UI ticks.
- Ambient bed: a low drone under every run, a heartbeat that quickens with
  Heat, and a tremolo layer that fades in while any guard is chasing.
- Mute: the M key or the new 🔊 HUD button toggles sound; the choice persists.
- Visual juice: expanding impact rings on hits/alarms/door slams, footstep
  dust, squash-and-stretch on Jo for hits and landings, a pulsing last-heart
  vignette, and a visible progress ring while holding the exit.
- New headless suite `tests/web_juice_test.mjs` (`npm run test:juice`) covers
  audio unlock, every cue, the ambient ramp, fx spawn/decay, pickup/drop
  wiring, mute, and silent no-op behavior when audio never unlocks.

## Web build — mobile, modifiers & mastery

- Landscape: the phone stage and canvas buffer now follow device orientation,
  filling the screen instead of shrinking to a portrait strip.
- Mobile controls: scale-correct joystick (orientation-agnostic), a touch DROP
  button (the Q-key verb), and pressed feedback on the touch buttons.
- Vault Modifiers: every free run rolls a risk/reward twist — Still Night,
  Gilded Vault, Curfew, Dead Fog, Heavy Purse, or a no-twist Clean Job.
- Modifier Mastery: bank a haul under each twist for a permanent +3%/twist
  sales bonus; progress persists and shows in the hideout.

## v0.1.3 — Godot 4.7 type-inference hotfix

- Replaced the untyped `Node` vault parameter in guard and sentry AI with `GreedrunVault`.
- Explicitly typed the guard visibility test as `bool`, removing the parser failure at `guard.gd:36`.
- Hardened guard movement locals and sentry cone calculations with explicit Godot types.
- Typed guard waypoint arrays and matching Vault spawn helpers to prevent follow-on inference failures.
- Added explicit types to several Vault locals that depend on duplicated typed arrays or nullable scene instances.
- Re-ran `gdlint` across every autoload and gameplay script.

## v0.1.2 — Godot 4.7 native-member hotfix

- Renamed `GreedrunLoot.hidden` to `GreedrunLoot.is_hidden`. Godot 4.7 exposes `hidden` as a native inherited member, so redeclaring it caused a parser error.
- Updated all Vault references to use `item.is_hidden`.
- Preserved the serialized loot configuration key as `"hidden"`, so generation behavior and save compatibility are unchanged.
- Re-ran `gdlint` across all gameplay and autoload scripts with no reported issues.

## v0.1.1 — Parser hotfix

- Fixed the missing indentation in `scripts/vault.gd` inside `can_move()` at the raised-platform collision return.
- Confirmed all autoload and gameplay scripts pass `gdlint` after the correction.
- The reported `main.gd` load failure was a downstream error caused by the invalid Vault script resource.

## v0.1.0 — Initial Godot port

- Ported the evolved HTML prototype and handoff into a standalone Godot 4 project.
- Implemented the complete hideout-to-fence vertical-slice loop.
- Added procedural vault themes, vertical platforms, stealth/chase AI, Heat, contracts, loot personalities, branching artifacts, extraction, buyers, upgrades, Collection restoration and JSON persistence.
- Added keyboard and touchscreen controls.
- Added parser/linter validation, port notes and a structured first-playtest checklist.
