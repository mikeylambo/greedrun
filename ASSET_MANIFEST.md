# Jo: Greedrun — Asset Manifest

Everything the Godot build currently draws procedurally (`_draw()` vector shapes,
color-coded theme palettes) that final art will replace, plus the audio the prototype
lacks entirely. Source the art anywhere — insertion into Godot is the same either way:
hand over the files, and the procedural draw calls get swapped for sprites/tiles and the
audio gets wired to the existing signals (`alarm_tripped`, pickups, extraction, etc.).

---

## 0. Locks that gate everything (decide first)

- **Orientation:** true bird's-eye vs. 3/4 top-down (Hades/Zelda-style). Affects every
  character, enemy, and top-down loot asset. 3/4 is more expressive and easier to source.
- **Character animation model:** single sprite rotated to face movement (cheap, few assets)
  vs. directional sheets (4-dir or 8-dir; 4–8× the frames). This is the biggest cost lever.
- **Base scales (suggestions, confirm before drawing):** characters ~64–96 px tall;
  tiles 32 or 64 px; icons authored at 256 px, downscaled in-engine. Player collision
  radius is currently 14 px — size sprites to read at that footprint.
- **Formats for Godot:** PNG-24 with transparency for sprites/icons; TileSet-ready tile
  sheets (consistent grid, no bleed) for environments; `.ogg` for music/ambience and
  `.wav` for short SFX; animations as either sprite sheets or numbered frame sets.

## Already done — do NOT remake
- Fonts: Barlow Semi Condensed (Bold/Medium/SemiBold) + Cinzel.
- Heat/curse screen vignette (`vignette.gdshader`) and soft-light texture.

---

## 1. Characters & enemies (top-down, animated)

Jo's bag visibly grows with carried weight — a real design beat, so he needs load-tier
silhouettes, not just one body.

| Sprite | States / frames needed |
|---|---|
| **Jo (player)** | idle, walk/run, grab/pickup, hit/stagger, downed; **+ load tiers** (empty / light / medium / heavy bag) as overlays or baked variants |
| **Guard** | idle, patrol-walk, chase (faster read), investigate (look-around), alert pose |
| **Elite Guard** | recolor/variant of Guard (summoned by Royal loot) — can be a palette swap |
| **Bounty Hunter** | distinct silhouette from guards (climbs, hits anywhere); walk/chase, entrance-alert |
| **Sentry** | stationary body + sweeping head/eye (rotation); the vision cone itself is a shader/VFX, not art |

## 2. Loot (world pickup + inventory icon)

Nine named items. Each needs a top-down world pickup and an icon read (fence, Collection,
HUD may reuse the same art). Kinds drive behavior: common, valuable, loud, cursed, living,
royal, fragile, artifact, mythic.

| Loot | Special state |
|---|---|
| Loose Coin | — (bulk) |
| Cut Gem | — (bulk) |
| Golden Idol | — |
| Marked Relic | — |
| Skitterjewel | small scuttle/flee animation (it moves) |
| Crown Jewels | — |
| Porcelain Relic | intact **and** shattered state |
| Decision Artifact | — (triggers the 3-way choice UI) |
| Vault Heart | hidden/revealed treatment; the centerpiece |

## 3. Environment kits (×4 themes)

Themes are currently palettes; each becomes a full kit. Per theme: floor tiles, wall tiles,
raised-platform tiles, staircase tiles, 3–6 decorative props. Plus shared:

- **Extraction Portal** (animated glow)
- **Staircase / ledge edge pieces** for verticality (targeting real TileMap elevation + Y-sort)

Themes: **Sunken Treasury · Cliffside Fortress · Undercity Vaults · Old Mint.**

## 4. UI & icons (the largest bucket)

- **HUD:** haul/gold readout, load/weight meter, noise indicator, Heat meter (0–6 states),
  hearts (HP), Ascension tag, Daily tag.
- **Upgrade icons ×10:** Quick Feet, Reinforced Straps, Muffled Boots, Deep Pockets,
  Guild Contacts, Thief's Luck, Cool Head, Second Wind, Cat's Landing, Treasure Sense.
- **Trophy icons ×5:** Golden Idol, Marked Relic, Skitterjewel, Bound Relic, Vault Heart
  (each also surfaces its passive: Merchant's Eye, Iron Nerve, Quick Hands, Fortune's Cache,
  Vault-Sense).
- **Contract icons ×9:** Smuggling Run, Silent Job, Contract Theft, Clean Sweep, Timed Raid,
  Recovery Job, Legendary Heist, Ghost Job, Bounty Run.
- **Buyer icons/avatars ×5:** Black Market, Noble Collector, The Syndicate, Return it, Keep it.
- **Boon icons ×3:** Greed Sense, Smoke Step, Silence.
- **Frames/panels/buttons** to replace code-drawn UI chrome.
- **Screen art:** title logo (JO: GREEDRUN), hideout backdrop, fence backdrop,
  Collection/museum backdrop, result screen.
- **App icon** (replace placeholder `icon.svg`).

## 5. VFX / feedback

Alarm flash, detection markers (! / ? for spotted/investigate), noise pulse rings,
Smoke Step effect, extraction glow, Porcelain shatter particles, pickup sparkle,
Sentry vision cone (shader or sprite). (Heat/curse vignette already exists.)

## 6. Audio — the biggest gap (prototype is silent)

- **SFX:** footsteps (light vs. heavy load), loot pickup by noise tier (quiet coin →
  loud idol clink), weight-scaled drop/landing thud, alarm, guard alert sting, hit/heart-lost,
  extraction-success sting, VAULT CLEARED sting, fence sale (coin), upgrade purchase,
  button clicks, artifact-decision chime, Skitterjewel skitter, Porcelain shatter,
  Elite/Hunter entrance sting.
- **Music (ideally Heat-reactive):** hideout/menu theme, calm infiltration bed,
  chase/high-Heat layer, extraction tension sting, and a top-ascension "the vault hunts Jo"
  track.

---

## Priority tiers (make Tier 1 first — it gets you a good-looking playable run)

**Tier 1 — vertical-slice look:** Jo (with load tiers) · 1 Guard · Sentry · the core loot
icons (coin, gem, idol, Vault Heart) · ONE full theme kit · core HUD (haul, load, Heat,
hearts) · core SFX (footsteps, pickup, alarm, hit, extraction). This alone makes one run
look and feel like a real game.

**Tier 2 — full feel:** Elite + Bounty Hunter · all 9 loot + special states · remaining 3
theme kits · all upgrade/trophy/contract/buyer/boon icons · music set · full VFX.

**Tier 3 — polish/identity:** title logo + key art · app icon · Collection museum visual
growth · Ascension/Daily screen flourishes · buyer avatars with personality.

*Insertion note: deliver Tier 1 and I (or Claude Code) can wire a slice build so you see
real art in-engine before committing to the full set — same validate-cheap loop as the systems.*
