# Changelog

## Web build — playtest telemetry & economy re-centering

- **Playtest telemetry**: every run (escape, capture, or abandon) is logged
  locally — location, layout, modifier, job, ascension, outcome and death
  cause, duration, haul vs banked, peak Heat, Vault-Remembers seconds, hits
  taken, loot secured, tool usage, epithet earned. "Copy playtest report" in
  the hideout aggregates it into paste-able text (escape rates, deaths by
  cause, per-location/modifier tallies, tool usage, recent-run lines).
  Kept to the last 80 runs; cleared by Reset progress.
- **Economy audit** (`npm run audit:econ`, committed): drives the real
  run→fence→bank pipeline headless across meta stages and grab policies.
  Findings: income growth FRESH→MAX is ×3.97 (on-target vs the handoff's
  ×4 intent), but every decent haul pinned Heat T6 because vaults roughly
  doubled in value since the 650/tier dial was set — flattening danger pay
  into a constant and making Vault-Remembers routine.
- **Tuning**: Heat re-centered at $900 of carried value per tier (was 650).
  Modest hauls now ride T3–4; T6 and THE VAULT REMEMBERS are reserved for
  genuinely greedy runs. Further economy dials deliberately wait for real
  playtest telemetry.

## Web build — endgame: The Vault Remembers, Legendary Heist & skill lanes

- **THE VAULT REMEMBERS** (Heat T6, the GDD's max-heat tier): at full Heat the
  building itself joins the hunt — a pulse every 2.5s hands your position to
  every guard (visible ripple), sentries sweep 50% faster and see 25%
  further, the vault slams its own loop doors on a timer, and the exit takes
  1.1s to force instead of 0.6s. Shed greed below T6 and it settles. The
  Heat label flips to "THE VAULT REMEMBERS" while active.
- **Legendary Heist is now multi-stage**: intel reveals the Heart from the
  start; Stage 1 case the chamber → Stage 2 take the Heart (the vault locks
  to T6 while you carry it) → Stage 3 the exit BOLTS itself and two
  seal-latches spawn — break both (each screams an alarm) to open the way.
  Reward raised $1,700 → $2,400. Stage progress lives on the HUD objective.
- **Skill lanes** (GDD skill tree): the 10 upgrades are grouped into Thief,
  Smuggler, Mastermind and Treasure Hunter lanes, with the Workbench as the
  Trickster lane. Maxing a lane earns a capstone: Cold Trail (chases give up
  30% sooner), Bottomless Bags (first 8 weight carries free), The Long Game
  (contracts +15%), Appraiser's Eye (a fake can't inflate your Heat — the
  noble scam still works), Sleight of Hand (+1 tool charge per job).
- Fixed a shop-layout bug: once the hideout grew taller than the stage, the
  upgrade/tool grids (the overlay's only shrinkable flex items) collapsed to
  zero height — they now keep natural height and the overlay scrolls.
- New suite `tests/web_endgame_test.mjs` (`npm run test:endgame`) covers the
  T6 wake/settle cycle, all five capstones, and the full heist: stages 1→4
  and extraction through the extended hold, live through real frames.

## Web build — the Workbench, the Gilded Fake & Reputation (GDD items)

- **The Workbench (Jo's tool kit)**: five buy-once tools at the hideout; one
  rides per job with limited charges, fired by Space or the optional TOOL
  touch button (never required — one-finger north star holds):
  Smoke Bomb (break chases, 3s silence), Decoy Bag (glitter bait), Grapple
  Hook (reel in the nearest visible treasure — ledges and Skitterjewels
  included), Lockpick Kit (reopen a severed shutter), Portable Portal
  (free marker, one snap-back from anywhere).
- **Gilded Fake** (Fake Loot from the GDD): spawns in ~70% of vaults, reads
  $520 in the bag (and raises Heat!), fences for $40 — unless you pass it to
  the Noble at full price for +1 notoriety. Dropped, its glitter baits
  nearby guards, same as the Decoy Bag.
- **Reputation-as-system**: escape epithets now accumulate; earned twice, one
  becomes your standing (shown in the hideout). Matching contracts seek you
  out at +25% pay (starred on the board), and your standing's favorite buyer
  pays +10% ("knows your name"). Recorded on the results screen.
- Generator hardening: a seeded reachability pass now guarantees every
  ground item is walkable from the entrance (arena layouts could rarely
  seal a pocket — Clean Sweep is now always possible).
- New suite `tests/web_tools_test.mjs` (`npm run test:tools`) drives all five
  tools, the fake's economy/bait, and reputation board/price shaping.

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
