# Godot Port Status

## Port objective

Preserve the evolved prototype's identity: loot is simultaneously reward, encumbrance, noise, notoriety, temptation and long-term collection progression.

## Source-to-Godot mapping

| Prototype domain | Godot implementation |
|---|---|
| Browser screen/state flow | `Main.tscn` + `scripts/main.gd` + `GameState` autoload |
| Local browser persistence | JSON persistence in `MetaSave` at `user://greedrun.save` |
| Canvas world rendering | Native `_draw()` methods on vault, player, loot, enemies and portal |
| Keyboard/touch input | Runtime `InputMap` actions + `GreedrunTouchOverlay` |
| Procedural map generation | `GreedrunVault._generate_layout()` and `_generate_platforms()` |
| Player load model | `Progression.speed_with_weight()` + `GreedrunPlayer.set_load()` |
| Loot behaviors | `GreedrunLoot` configuration plus vault pickup/event handling |
| Guard state machine | `GreedrunGuard.update_ai()` |
| Heat and alarm model | `GreedrunVault._recompute_load()`, `trip_alarm()` and hunter threshold |
| Verticality | platform/stair metadata and player elevation transitions |
| One More Thing | modal request from portal proximity, stay/leave resolution in Main |
| Artifact branching | artifact modal plus sense/ghost/muffle boons |
| Contracts | generated contract dictionaries and run-end evaluation |
| Fence economy | `Economy.buyers_for()` and fence resolution UI |
| Upgrades / Collection | `Progression`, `MetaSave`, shop and trophy restoration UI |

## Scope retained from the handoff

- Reverent, non-occult language framing
- Contextual traversal rather than a jump button
- Loot with physical and systemic personality
- Heat that comes from greed, marked goods, alarms and reputation
- Returning/keeping treasures as meaningful alternatives to maximum cash
- Greater tools leading back into more dangerous vaults for greater loot

## Deliberate graybox substitutions

- Procedural vector shapes stand in for final character, enemy and treasure art.
- Color-coded vault themes stand in for authored environment kits.
- Text feedback stands in for audio stingers, voice and animation tells.
- Room generation currently favors readable rectangles over authored heist puzzles.

## Recommended next implementation passes

1. **Runtime certification and tuning:** local Godot 4.7 boot, collision checks, economy pacing and touch feel.
2. **Authored room grammar:** doors, keys, lockpick timings, alternate routes, shadow zones and timed security cycles.
3. **Stealth readability:** vision cones, suspicion meters, noise pulses and clearer investigate markers.
4. **Jo presentation:** production model/sprite, bag/load silhouettes, animation state machine and gadget feedback.
5. **Audio:** loot signatures, clinks by noise tier, alarm layers, chase music and extraction stingers.
6. **Content expansion:** named fences, recurring rivals, contract chains, curated relic lore and hideout visual growth.
