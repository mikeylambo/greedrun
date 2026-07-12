# Jo: Greedrun — Port Handoff Spec

*From the HTML/canvas vertical slice to Godot 4. This is the map: every system, its tuning numbers, and a recommended engine structure. All numbers are pulled from the working prototype and are **starting values / dials**, not gospel.*

---

## 1. What this game is

A **one-finger, top-down loot-heist roguelite.** Play Jo, a mastermind thief whose greed is both his power and his undoing. Enter a procedural vault, steal treasure, escape alive. Every item makes you **richer, slower, louder, more marked, and more hunted.** The whole game is the question: *how greedy can you be before the vault owns you?*

**Design north stars (keep these):**
- **Greed is the core mechanic**, not a reward. Loot is weight, noise, heat, and temptation.
- **One-finger playable, always.** Movement is a drag/joystick; extraction is contextual; verticality is contextual. Never add a button that a run *requires*.
- **Reverent tone; no occult framing.** Crime-world language, not dark-spiritual. (See §12.)
- **Replayability comes from variety + mastery, not grind.**

**Core loop:** Hideout (spend gold, restore trophies) → pick a Contract (sets target, location, pay) → infiltrate → grab loot (greed rises) → escape to the portal → Fence the haul (buyers, notoriety, keep-for-collection) → repeat.

---

## 2. World & controls

- **World size (per run):** width `2300–3200`, height `1550–2200`, rolled fresh each run. Content scales with area (`areaScale = W*H / (2000*1400)`).
- **Viewport:** camera follows Jo, clamped to world bounds. Internal render res in prototype was 960×640.
- **Controls (one-finger):** drag anywhere (left ~55% on touch) = floating joystick; hold on the exit = extract. Keyboard fallback: WASD/arrows, hold **E** = extract, **P/Esc** = pause.
- **Locations/themes (4):** Sunken Treasury, Cliffside Fortress, Undercity Vaults, Old Mint. Each = a palette (floor/wall/grid/platform colors). A contract picks the theme; free runs pick random. **In Godot these become full tileset "kits"** (art + props + layout rules), the seam already exists.

---

## 3. Player

| Property | Value |
|---|---|
| Radius | 14 |
| Base speed | `2.85 * (1 + 0.11 * feetLvl)` px/frame @60fps |
| Max HP | `3 + luckLvl` |
| Hit i-frames | 1.1s (2s on revive) |
| Weight penalty | `speed *= 1 - clamp(weight * strapMul, 0, capPen)` |
| — strapMul | `0.011 * max(0.32, 1 - 0.14 * strapsLvl)` |
| — capPen (floor) | `max(0.34, 0.66 - 0.07 * pocketsLvl)` |

**Greed state (recomputed on pickup):** `carriedValue`, `carriedWeight`, `carriedNoise`, `carriedCurse` (marked), and the loot bag visibly grows with weight.

---

## 4. Loot table

| Loot | Value | Weight | Noise | Marked | Kind | Notes |
|---|---|---|---|---|---|---|
| Loose Coin | 60 | 1 | 0 | 0 | common | bulk |
| Cut Gem | 170 | 2 | 1 | 0 | valuable | bulk |
| Golden Idol | 460 | 5 | 4 | 0 | loud | |
| Marked Relic | 900 | 6 | 2 | 3 | cursed | raises heat/notoriety |
| Skitterjewel | 380 | 3 | 2 | 0 | living | **flees**; corner it |
| Crown Jewels | 720 | 5 | 3 | 0 | royal | **summons 2 elite guards on pickup** |
| Porcelain Relic | 560 | 2 | 0 | 0 | fragile | **shatters if you're hit** |
| Decision Artifact | 700–1150 | varies | varies | varies | artifact | pause + 3-way choice (below) |
| Vault Heart | 2600 | 11 | 6 | 6 | mythic | hidden until "one more thing" |

**Spawn counts (× areaScale):** ~7 coins, ~5 gems, 2 idols, 1 marked, 1 living, 1 royal (70%), 1 fragile (70%), 1–2 artifacts, 1 heart, + 1 elevated item per platform. Deep/high-value loot biased toward the far (right) half.

**Decision Artifacts** (branching loot): on pickup, freeze and offer —
1. **Pocket it whole** — full value, +weight/noise/marked.
2. **Pry it apart** — ~40% value, light, silent.
3. **Bend its power** — no value, grants a run boon: *Greed Sense* (reveal Heart), *Smoke Step* (6s untouchable, guards lose you), or *Silence* (carried noise → 0 for the run).

---

## 5. Enemies & AI

**Guard states:** `patrol → chase → investigate → patrol`. The *investigate* state (walk to last-known position, sweep-look, then give up) is what makes escapes feel skillful — preserve it.

| Enemy | Speed | Detection | Behavior |
|---|---|---|---|
| Guard | `gSpd` base, `×1.35` chase | `detR` | patrol/chase/investigate; **can't climb platforms** |
| Elite (from Royal loot) | `gSpd×1.12` | `detR×1.2` | spawn 2, start chasing |
| Bounty Hunter | `gSpd×1.10` | `detR×1.25` | enters at heat `≥ max(2, 4 - floor(notoriety/3))`; **can climb; hits you anywhere** |
| Sentry (2–3) | stationary | cone `±0.42 rad`, range 250, **LoS-checked** | sweeps; trips alarm → heat +1, wakes nearest 2 guards |

- `gSpd = 1.5 + heatTier*0.16 + carriedCurse*0.03`
- `detR = (92 + noiseNow*6 + heatTier*9) * ironNerveMul` (Iron Nerve trophy shrinks it)
- Contact: −1 heart, knockback (collision-checked), 1.1s i-frames. Ground guards only hit ground-level Jo; the Hunter hits anywhere.

---

## 6. Heat & Notoriety

**Heat (per-run, 0–6):** `heatTier = clamp(floor(value/650) + floor(marked/3) + heatSeed, 0, 6)`. Rising heat → faster/sharper guards, screen tint, and the Hunter. **Heat is greed-driven, so it self-balances against player progression.**

**Notoriety (persistent, `curseDebt` 0–10):** +1 per Syndicate sale, −1 per Return. Seeds starting heat: `heatSeed = clamp(floor(curseDebt/2) - coolLvl, 0, 3)`. Also lowers the Hunter's spawn threshold. **Return jobs / Recovery contracts cool it — restraint as a mechanic.**

**Danger pays (the income scaler):** final haul `× (1 + peakHeat*0.09 + 0.05*heartTrophyLvl)`. This is how income keeps pace with costs — hotter runs are worth more.

**→ Godot roadmap: the full heat ladder** (traps → locked exits/wardens → rival thief → the Vault hunts Jo). Staged by heat so it escalates, not dogpiles. This is the endgame replay content.

---

## 7. Verticality (contextual — no jump button)

- **Platforms (mesas):** 2–4 raised regions, each with one **staircase** (outside the footprint).
- **Climb:** steer onto a staircase → ascend. **Descend:** stairs (graceful) or step off a **ledge** (drop).
- **Drop cost (scales with weight):** `<8` silent · `8–19` loud (nearby guards investigate) · `≥20` −1 heart. **Cat's Landing** upgrade negates all of it.
- **Tactics:** ground guards can't climb (high ground = refuge from the many); the Hunter can (refuge has a ceiling). Elevated loot requires matching elevation to grab.
- **In Godot:** replace fake-height (shading + offset) with **real TileMap elevation layers + Y-sort** for true 2.5D. This is the single biggest "feel" upgrade the engine buys you.

---

## 8. The Fence (economy)

Notable items are fenced individually; bulk (coins/gems) auto-sells. Buyers:

| Buyer | Rate | Effect / constraint |
|---|---|---|
| Black Market | ×1.0 | anything, no strings |
| Noble Collector | ×1.7 | fine goods only; **one piece per visit** |
| The Syndicate | ×2.2 | cursed/artifact/mythic; **+1 notoriety** |
| Return it | ×0.4 | cursed/artifact/mythic; **−1 notoriety** |
| Keep it | forgo sale | adds to the **Collection** (once per trophy) |

- `sellMult = 1 + 0.08*contactsLvl + 0.03*idolTrophyLvl`
- Final total also `× dangerMult × collGoldMult (1 + 0.04*fortuneTrophyLvl)`, `× 1.4` if Perfect Heist.

**→ Roadmap:** reputation-as-system (run epithets become persistent, shifting prices/jobs); optional laundering/dismantling depth. Avoid fence-betrayal RNG — it fights the game's fairness.

---

## 9. Upgrades (leveled meta-progression)

Cost to buy next level: `base * 1.55^currentLevel`.

| Upgrade | Base | Max | Effect / level |
|---|---|---|---|
| Quick Feet | 650 | 5 | +11% speed |
| Reinforced Straps | 750 | 5 | −14% weight drag |
| Muffled Boots | 650 | 5 | −18% noise |
| Deep Pockets | 850 | 4 | raise speed floor under load |
| Guild Contacts | 900 | 5 | +8% from all buyers |
| Thief's Luck | 1200 | 3 | +1 starting heart |
| Cool Head | 1100 | 3 | −1 starting Heat |
| Second Wind | 2200 | 1 | once/run, fatal hit → 1 heart |
| Cat's Landing | 1100 | 1 | silent, safe drops |
| Treasure Sense | 1500 | 1 | Vault Heart revealed from start |

Full-max cost ≈ **66,000 gold.**

---

## 10. The Collection (museum of greed — the permanent sink)

**Keep** a treasure at the fence (forgo the sale) to claim its trophy at Lv 1. **Restore** with gold to deepen the passive. Restore cost: `base * 1.5^(level-1)`, max Lv 5.

| Trophy (kind) | Passive | Base | Effect / level |
|---|---|---|---|
| Golden Idol (loud) | Merchant's Eye | 900 | +3% sell |
| Marked Relic (cursed) | Iron Nerve | 1000 | guards spot you 6% later |
| Skitterjewel (living) | Quick Hands | 800 | +6 pickup reach |
| Bound Relic (artifact) | Fortune's Cache | 1100 | +4% on all gold |
| Vault Heart (mythic) | Vault-Sense | 1500 | +5% danger bonus |

Full-max restore cost ≈ **43,000 gold** (+ forgone sales). **This is also the natural, non-forced home for any SLU/universe relic connections later** — a kept relic reads as a cool trophy to newcomers and a lore nod to fans. Never gate the game on it.

---

## 11. Contracts (9 types)

Each rolls a client, location (theme), reward, and a `check()` evaluated at extraction. Board offers 3 + a free run.

| Contract | Win condition | ~Reward |
|---|---|---|
| Smuggling Run | extract with ≥ $X | ~35% of X |
| Silent Job | never spotted | 750 |
| Contract Theft | steal a named item, escape | 700 |
| Clean Sweep | 100% the vault, escape | 1100 |
| Timed Raid | escape before the collapse timer | 850 |
| Recovery Job | extract (lay low) → **−2 notoriety** | 400 |
| Legendary Heist | steal the Vault Heart, escape | 1700 |
| Ghost Job | extract taking **zero** hits | 950 |
| Bounty Run | reach Heat T4+ and escape | 1050 |

**Completion economy:** max-everything (upgrades + trophies) ≈ **110,000 gold**. At ~2k/run early rising to ~8k+ late, that's ~25 runs, ~2–3 hours (slice-appropriate). For a **release curve**: first win ~3–4h, max-meta ~15–25h, then infinite via **difficulty ascension + seeded dailies** (see §13).

---

## 12. Content/language rules (non-negotiable)

Reverent tone reflecting Christian virtues (Grace, Wisdom, Patience); prefer subtle over overt religious symbolism; **no occult framing** (no cults, curses-as-dark-magic, forbidden idols, blood/communion inversions, necromancy). The "marked goods / heat / notoriety" crime-world framing already replaces the old occult layer — keep it. Note the restraint mechanics (Return / Recovery lowering notoriety) quietly embody restitution-over-hoarding; a subtle, non-preachy virtue thread worth preserving.

---

## 13. Recommended Godot 4 structure

**Autoload singletons (global state):**
- `MetaSave` — persistence to `user://greedrun.save` (JSON): gold, notoriety, upgrade levels, collection levels. *(Replaces the prototype's `window.storage`.)*
- `GameState` — current run state machine (menu / hideout / contracts / fence / collection / playing / paused / result).
- `Economy` — buyers, sell math, danger/collection multipliers.
- `Progression` — upgrades, trophies, and their derived effects (query e.g. `Progression.move_speed()`).

**Scenes:**
- `Main.tscn` — owns the state machine + swaps UI/vault.
- `Vault.tscn` + `VaultGenerator.gd` — procedural room via **seeded** `RandomNumberGenerator` (enables dailies). Emits placed walls, platforms, loot, spawns.
- `Player.tscn` — `CharacterBody2D`; elevation as a property; drag/joystick input via `InputMap`.
- `Guard.tscn` / `Sentry.tscn` / `Hunter.tscn` / `Elite.tscn` — state-machine AI; use `NavigationAgent2D` for real pathfinding (upgrade over the prototype's wall-slide).
- `Loot.tscn` — `Area2D`; `kind` drives behavior/visual; emits `picked_up`.
- `Portal.tscn`, `HUD.tscn` (CanvasLayer).
- UI Controls: `Hideout`, `Shop`, `Fence`, `Collection`, `Contracts`, `Result`, `HowTo`, `Pause`.

**Engine wins to lean on:**
- **TileMap elevation layers + Y-sort** for true verticality (retire fake-height).
- **NavigationAgent2D** for guard pathing (retire wall-slide; enables the rival thief AI cleanly).
- **AudioStreamPlayer2D** for the noise mechanic — landing thuds, clinking loot, alarms — the prototype has *no sound* and it's the biggest missing "feel" layer.
- **AnimationPlayer / AnimatedSprite2D** for Jo (the yellow-scarf signature), guards, and loot.
- Node groups (`guards`, `loot`) + signals (`alarm_tripped`, `extraction`, `loot_kept`) to decouple systems.

---

## 14. Post-port roadmap (priority order)

1. **Art, animation, audio** — the prototype proved the systems; feel is the whole job now.
2. **True 2.5D verticality** via tilemap layers.
3. **Evolved heat ladder** — traps → locked exits → **rival thief** → the Vault hunts Jo. The endgame replay content.
4. **Difficulty ascension + seeded dailies** — the real long-tail replay engine.
5. **Reputation-as-system** — epithets become persistent and price/job-affecting.
6. **More kits/locations, loot personalities, contract types** — cheap variety that recombines.
7. **Optional SLU connective tissue** — via the Collection, as texture, never as a gate.

**Deliberately cut:** factions (dilutes the personal greed-vs-Jo focus).

---

*The slice is the proof. The engine is the build. Go get it, Jo.*
