# Jo: Greedrun — Ascension Build Spec

Read `greedrun_port_handoff.md` in the repo root first for full context. This session
builds ONE thing: **Difficulty Ascension**, the game's long-tail completion layer. Do not
start any other roadmap item (no art, no audio, no verticality).

## Why this exists
Base completion is ~25 runs / ~2-3h. Ascension turns that into a long tail WITHOUT adding
grind (per design north star §1: replayability = variety + mastery, not grind). Completion
past max meta is "clear the next ascension and beat your best," NOT "afford the next
upgrade." There is deliberately no new gold sink here.

## PREREQUISITE — seed the run (build this first)
- Route ALL run randomness (world size, layout, platforms, loot, guard/sentry placement)
  through ONE seeded `RandomNumberGenerator` owned by the vault generator.
- A run may start from an explicit seed; default to random. Same seed => identical vault.
- Build this foundation now. Do NOT build any dailies UI this session — seeding just has
  to exist and be verifiable.

## Persistence (MetaSave)
- Persist `ascension_level` (highest unlocked) and `best_by_ascension` (level -> best score).
- Extend `default_data()` and the merge-load so existing saves upgrade cleanly (missing
  keys default, no crash on old saves).
- Unlock trigger: Ascension 1 unlocks when meta is fully maxed. Expose the max-check as a
  named function/constant so I can change what "maxed" means. If ambiguous, ASK.

## Modifier table (the dials — keep in ONE readable place)
Put this in `AscensionModifiers.gd` (autoload) or a static table in `Progression`. Given a
level 1-10, return this bundle. These are STARTING VALUES to be tuned by hand — keep them
as an obvious editable table, do not scatter them through the systems.

| Asc | guard_speed_mult | guard_detr_mult | heat_floor_add | hunter_heat_delta | payout_mult |
|-----|------------------|-----------------|----------------|-------------------|-------------|
| 1   | 1.03 | 1.05 | 0 | 0 | 1.15 |
| 2   | 1.05 | 1.10 | 0 | 0 | 1.30 |
| 3   | 1.07 | 1.16 | 1 | 1 | 1.50 |
| 4   | 1.09 | 1.22 | 1 | 1 | 1.70 |
| 5   | 1.11 | 1.28 | 1 | 1 | 1.95 |
| 6   | 1.14 | 1.34 | 2 | 2 | 2.20 |
| 7   | 1.16 | 1.40 | 2 | 2 | 2.45 |
| 8   | 1.18 | 1.46 | 2 | 2 | 2.70 |
| 9   | 1.20 | 1.52 | 3 | 3 | 3.00 |
| 10  | 1.22 | 1.58 | 3 | HUNTER_FROM_START | 3.40 |

- `guard_speed_mult` / `guard_detr_mult`: multiply into the EXISTING gSpd / detR formulas
  in vault.gd. Do not fork the formulas — multiply the final computed value.
- `heat_floor_add`: added to `heatSeed` (raises starting Heat), clamped to the existing
  0-6 Heat range.
- `hunter_heat_delta`: LOWERS the Hunter's spawn threshold (enters sooner). A10 uses the
  sentinel `HUNTER_FROM_START`: the Hunter is present at run start. Implement the sentinel
  explicitly rather than as a magic number.
- `payout_mult`: multiply the FINAL run total, on top of the existing danger/collection
  math. One clean multiply at the end.

## Application points
- `GameState`: hold the active run's ascension level (0 = normal).
- `vault.gd`: read active level; apply speed/detR/heat-floor/hunter modifiers where the
  base values are ALREADY computed. Multiply in; do not rewrite the systems.
- `Economy`: apply `payout_mult` to the final total.

## UI (minimal, match the existing hand-built _draw / code style)
- Hideout or Contracts: an Ascension selector capped at the unlocked level, showing the
  active level's modifier summary.
- Result screen: show the ascension level played and whether it's a new best for that level.

## GUARDRAILS
- Do NOT retune the base (Ascension 0) economy or difficulty. Those dials are being tuned
  by hand separately. Only ADD ascension modifiers on top.
- Do NOT add a gold sink, prestige upgrade caps, or cost inflation. Completion is score +
  clearing levels, by design.
- Do NOT touch art, audio, or verticality.
- The game renders via `_draw()` and builds nodes in code — keep that pattern. Do not
  refactor working systems this task does not require.
- One focused commit. If a design choice is ambiguous (especially the unlock trigger), ASK
  rather than guess.

## DONE WHEN
- A maxed save unlocks Ascension 1.
- Selecting an ascension level visibly hardens the run and raises the payout.
- The result screen reports the ascension level and new-best.
- A10 spawns the Hunter from the opening second.
- A fixed seed reproduces a vault identically.
- Old saves load without error.
