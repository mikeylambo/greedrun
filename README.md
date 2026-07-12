# Jo: Greedrun — Godot Port

A Godot 4 port of the supplied HTML prototype and port handoff. This build targets the complete vertical-slice loop rather than a movement-only conversion:

**Hideout → Contracts → Infiltration → Loot pressure → One More Thing → Extraction → Fence → Upgrades / Collection**

## Open and run

1. Extract the project folder.
2. Open `project.godot` in **Godot 4.3 or newer**. Godot 4.7 is the intended local test target.
3. Press **F5**. `scenes/Main.tscn` is already assigned as the main scene.

The project has no external asset dependencies. Current presentation is drawn with Godot-native vector primitives so the port boots independently of an art pipeline.

## Controls

- **Move:** WASD or arrow keys
- **Extract:** Hold E while standing at the portal after resolving **One More Thing**
- **Pause:** P or Escape
- **Touch:** Drag on the left side to move; hold the right-side button to extract
- **Verticality:** Walk onto a platform through its stairs. Walking off another edge creates a contextual drop; heavy loads create noise or damage unless Cat's Landing is owned.

## Implemented systems

- Four procedural vault themes and multiple obstacle layouts
- Load-sensitive player movement, visible bag growth, hearts, invulnerability and Second Wind
- Ground/platform elevation without a jump button
- Coins, gems, idols, marked relics, Skitterjewel, Crown Jewels, Porcelain Relic, branching artifacts and Vault Heart
- Patrol → chase → investigate guards, elite reinforcements, bounty hunters and sweeping sentries
- Heat, marked-goods escalation, alarms, notoriety and danger payout multipliers
- Nine contract families plus free runs
- Timed collapse, stealth, untouched, quota, sweep, target theft, Heart and high-Heat jobs
- Signature **One More Thing?** leave/stay decision
- Three-way artifact decisions: carry whole, dismantle, or convert into a run boon
- Fence network with Black Market, Noble Collector, Syndicate, return and keep choices
- Persistent upgrades, Collection trophies, restoration levels and passive bonuses
- JSON save data at `user://greedrun.save`
- Desktop and touchscreen input paths

## Project map

- `scripts/main.gd` — menu flow, hideout, contracts, results, fence and HUD
- `scripts/vault.gd` — procedural run simulation and extraction rules
- `scripts/player.gd` — movement, load penalties, health and verticality
- `scripts/guard.gd` — patrol/chase/investigate AI
- `scripts/loot_item.gd` — loot identity and vector presentation
- `autoload/meta_save.gd` — persistent save data
- `autoload/progression.gd` — upgrades, trophies and derived stats
- `autoload/economy.gd` — fence buyers and payout calculations
- `docs/PORT_HANDOFF.md` — supplied design/port specification
- `docs/original_prototype.html` — supplied browser prototype preserved for comparison

## Validation status

All twelve GDScript files pass `gdformat` parsing and `gdlint` with no reported problems. Every `res://` resource reference has also been checked against the packaged project.

A Godot executable was not installed in the build sandbox, and the sandbox could not download one, so the project could not receive an engine-level F5 runtime certification here. The first local F5 in Godot 4.7 should therefore be treated as the final boot smoke test; use `docs/PLAYTEST_CHECKLIST.md` for the intended sequence.

## Current presentation boundary

This is a system-complete graybox/vertical-slice port. It deliberately uses replaceable primitive art and has no final animation, sound, music, authored rooms, dialogue, controller action mapping, or production-grade mobile layout pass yet.
