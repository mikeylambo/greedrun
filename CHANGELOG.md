# Changelog

## v0.3.0 — Seeded Daily Runs

- Added the `Daily` autoload: `daily_config_for_today()` derives everything — date key,
  seed (`YYYYMMDD` as int), contract type and theme — from the UTC date, so every install
  generates the identical daily vault with no server.
- Decision constants in one place: `DAILY_ONE_ATTEMPT` (one scored attempt per day),
  `DAILY_STREAK_ON_ATTEMPT` (streak advances on starting, not on escaping),
  `DAILY_USE_META` (upgrades/trophies apply) and `DAILY_ASCENSION` (fixed difficulty 0).
- Persisted a `daily` block in MetaSave (`last_played_key`, `last_score`, `best_daily`,
  `streak`); old saves pick it up through the existing default-merge load. Consecutive
  days build the streak, a missed day resets it.
- The daily is a normal run with a fixed config: the launch path seeds the existing
  contract pool from the date, pins the theme, sets `GameState.ascension_level` to
  `DAILY_ASCENSION` and calls `start_run(contract, seed)` — no forked run loop.
- Hideout gained a Daily Heist entry showing today's job, theme, streak and best (or
  today's score and a locked "come back tomorrow" state once played). The run HUD tags
  daily runs and the result screen shows the daily streak and NEW DAILY BEST.
- Added `tests/daily_check.gd`, a headless check
  (`godot --headless --path . -s tests/daily_check.gd`) verifying seed determinism via
  `layout_signature()`, date-stable config rotation and the streak rules.

## v0.2.0 — Difficulty Ascension + seeded runs

- Routed all run generation randomness (world size, theme, layout, platforms, loot,
  guard/sentry placement) through the vault's one seeded `RandomNumberGenerator`;
  replaced the global-RNG artifact shuffle with a seeded shuffle. A run can start from an
  explicit seed (`start_run(contract, seed)`), defaults to random, and
  `Vault.layout_signature()` fingerprints the generated layout for verification.
- Added the `AscensionModifiers` autoload: a single editable table of dials for Ascension
  1-10 (guard speed/detection multipliers, starting-Heat floor, Hunter threshold delta,
  payout multiplier) with an explicit `HUNTER_FROM_START` sentinel for Ascension 10.
- Ascension modifiers multiply into the existing formulas at their final computed values;
  `Economy.final_total` applies the payout multiplier as one clean multiply at the end.
- Persisted `ascension_level` (highest unlocked) and `best_by_ascension` in MetaSave;
  old saves upgrade cleanly via the existing default-merge load.
- Ascension 1 unlocks when the meta is fully maxed — the definition lives in one named
  function, `Progression.is_meta_maxed()` (currently: every upgrade and every trophy at
  max). Escaping Ascension N unlocks N+1.
- Added an Ascension selector to the contracts board (capped at the unlocked level, with
  a modifier summary and per-level best), an ascension tag on the run HUD, and the
  ascension level / new-best line on the result screen.

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
