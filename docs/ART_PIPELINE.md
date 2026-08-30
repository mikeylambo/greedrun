# Art Pipeline — Scenario Generation Record

Working record of AI-generated art produced with Scenario (scenario.com) for the
Godot build. Character/mesh generation via Scenario was abandoned (3D + animation
consistency results were poor); the pipeline now targets **environment textures,
props, and UI/icons**, which are its strengths.

All assets live in the Scenario library: team "My personal space" → Default
Project (app.scenario.com). Download as PNG-24 from there. Asset IDs below are
stable references.

---

## Locked decisions (resolves ASSET_MANIFEST.md §0)

- **Orientation: 3/4 top-down** (Hades/Zelda-style). More expressive, easier to
  source, and matches how the Scenario environment models draw.
- **Tile size: 64 px.** Generated textures are 1024×1024 seamless → 16×16 grid of
  64 px cells, downscaled in-engine as needed.
- **Icons: authored at 1024 px**, downscale in-engine (spec'd 256 px is met with
  headroom).
- Character animation model: still open (moot until characters are re-sourced
  outside Scenario).

## Style locks

- **Icon style:** "Stylized Game Icons & Props" LoRA (`model_CEThmDcx99XQgUg2YVxmJ8Ku`)
  on Flux.1-dev (`model_bfl-flux-1-dev`). Chosen over Juicy Icons 2.0 / Game UI
  Essentials 2.0 for small-size readability (bold outlines, flat color planes)
  and heist-fantasy tone; the same model covers loot + trophy + contract icons
  so all icon families share one voice.
- **Icon prompt template:**
  `game upgrade icon, {subject}, bold clean silhouette, centered single object on
  dark background, rich gold and deep teal palette, polished cartoon style with
  bold outlines` — 1024×1024, defaults otherwise, seeds 411001+.
- **Texture model:** "Scenario Texture" (`model_scenario-texture`), 1024×1024,
  `eraseSeam: true` (guaranteed tileable). ~33 CU each, ~4–5 min per job.
- Plan note: account allows **2 parallel jobs**; icons cost 9 CU each.

## Generated assets

### Upgrade icons (10/10) — seed / asset ID

| Upgrade | Seed | Asset ID |
|---|---|---|
| Muffled Boots | 411001 | `asset_6axyLWpsd3skJF9oSqf28iMb` |
| Quick Feet | 411004 | `asset_4t7K4TdFMoS8GfNtVZmR9XhF` |
| Reinforced Straps | 411005 | `asset_Q9iHxUT2AAjx9UteTjKznrgW` |
| Deep Pockets | 411006 | `asset_DuPZvKVxUDU2g2aCxbmQ12Sc` |
| Guild Contacts | 411007 | `asset_QL8mdBGezx7ubwNeKFhry2WM` |
| Thief's Luck | 411008 | `asset_Q6PMVi9SpUNBJUeKpT47d9wb` |
| Cool Head | 411009 | `asset_oH6gPqn6X69PpKpi2exgSSeA` |
| Second Wind | 411010 | `asset_KjHFYrZbgH6QZ9uvH1eGT2UJ` |
| Cat's Landing | 411011 | `asset_WhHyNyTKPav38FRPUibRE4RC` |
| Treasure Sense | 411012 | `asset_97E6qo7qFk5vRmqutw8vxxuf` |

Known nits: Thief's Luck rendered a 3-leaf shamrock (fine, or re-roll for
4-leaf); style-probe runners-up kept for reference: Juicy Icons
`asset_P8EGqoz5TSg1KVCLM5UQkNED`, UI Essentials `asset_QgNZpGyAUPPdrovGVdimkZ9a`.

### Theme floor textures (4/4, seamless)

| Theme | Asset ID |
|---|---|
| Sunken Treasury | `asset_Ds8X7fp1XXmDpNyPahJAgZG3` |
| Cliffside Fortress | `asset_ovLcZw1dquxKdbJFPgmPQThp` |
| Undercity Vaults | `asset_5xh4hpx9XD627Bt7Kb2gi4vc` |
| Old Mint | `asset_p7Y4CQqAejUxNXTy1oC9EyJA` |

Known nit: Cliffside Fortress has a small light artifact at the middle-right
edge — patch with clone stamp or re-roll before shipping.

### Loot icons (10/10, incl. shattered porcelain) — seed / asset ID

| Loot | Seed | Asset ID |
|---|---|---|
| Loose Coin | 411013 | `asset_Q8uXF94vHP8rKWQDnGFHN4u7` |
| Cut Gem | 411014 | `asset_jUTrRpspFfY2XVobT1Xs3aZB` |
| Golden Idol | 411015 | `asset_gjkLRhW9D7AyKw7vEMNu1FKb` |
| Marked Relic | 411016 | `asset_cdkzWc62Ny2TfUYkWm78CL6V` |
| Skitterjewel | 411017 | `asset_CX7aHjozk2Vh8ecBow6nrhNe` |
| Crown Jewels | 411018 | `asset_CnY2H1Q5dZiFoEhYAJPdWPuU` |
| Porcelain Relic (intact) | 411019 | `asset_icxebWTEjoUhkMJ4FXTJ1J9v` |
| Porcelain Relic (shattered) | 411019 | `asset_Xwdj8wLxyYTCEtVksgbtQWEJ` |
| Decision Artifact | 411020 | `asset_yi87jQDwJpVPzPMauUq2XvpV` |
| Vault Heart | 411021 | `asset_58PuoKxDYV2t7MQPkmiRyh5A` |

Nit: shattered porcelain reads "cracked" rather than fully shattered, and its
silhouette differs from the intact vase (handles) — re-roll or inpaint from the
intact asset if the state swap must match 1:1.

### Trophy icons (5/5)

| Trophy | Seed | Asset ID |
|---|---|---|
| Golden Idol | 411055 | `asset_AzHo93tiFdLVVqPHyHLXZWdK` (re-roll) |
| Marked Relic | 411023 | `asset_FTXoFAzd4ATFhX1rxmTkVxXJ` |
| Skitterjewel | 411024 | `asset_WsbQeqM362nQD1mPYd9qYqav` |
| Bound Relic | 411056 | `asset_ZR91BJc3vVhjMmCKYsvMPAPi` (re-roll) |
| Vault Heart | 411026 | `asset_a8c64B7WF6p65PzUEDEYx77n` |

Prompting lesson: the word "trophy" makes this LoRA draw a generic trophy cup —
two first-pass misses (`asset_GrKgcz3BnDhC3dqWLthgTN2g`,
`asset_VJyQP1K44385VJVcJW4ee32W`); describe the subject on a pedestal instead.

### Contract icons (9/9)

| Contract | Seed | Asset ID |
|---|---|---|
| Smuggling Run | 411027 | `asset_xPpKjyBkYc9eioftqBVb2R9H` |
| Silent Job | 411028 | `asset_HEdXHf6Uu643MPrGxkWuAe1v` |
| Contract Theft | 411029 | `asset_p4HoHYGMFm9b7aLtnJqPvJu9` |
| Clean Sweep | 411030 | `asset_H35c3Cvx52jdyjt64aeZwMZk` |
| Timed Raid | 411031 | `asset_HsMtz4oRo4MCLBSNt3Y1evJU` |
| Recovery Job | 411032 | `asset_aVHVyDHZBhzRU3qYNScSxD5e` |
| Legendary Heist | 411033 | `asset_zhj4ZGvgz56z44LKXouAcKgK` |
| Ghost Job | 411034 | `asset_KqebFhBhgz2hP2kmTVUMAPk7` |
| Bounty Run | 411035 | `asset_EqpxnKf2Bb2AnJCCEjjhcqB6` |

Nit: Smuggling Run and Bounty Run rendered "$" symbols — modern for the
setting; re-roll with "coin emblem, no letters or currency symbols" if desired.

### Buyer avatars (5/5) and boon icons (3/3)

| Icon | Seed | Asset ID |
|---|---|---|
| Black Market | 411036 | `asset_syTp7W5GDGMZBPeYrM7DaQCZ` |
| Noble Collector | 411037 | `asset_HknCRcJ6NDDfu4KxJ38Bg3NK` |
| The Syndicate | 411038 | `asset_fy4D8aDpd2pyckWTyFsVjhqU` |
| Return it | 411039 | `asset_ZGFtdCr2c92r95WvF7C6N614` |
| Keep it | 411040 | `asset_3Vw8nvzQsYyzBQqdtoHz6V5s` |
| Greed Sense | 411041 | `asset_S9oYCUP1mWZJv1CorYr8qLwQ` |
| Smoke Step | 411042 | `asset_tatokAZ7MFr1DmE3g1kiT4DZ` |
| Silence | 411043 | `asset_Q1DJCihED5gE3cE36TFytexs` |

### Enemy sprites (3 + palette swap)

Single static sprites for the "one sprite rotated to face movement" animation
model (the manifest's cheap option). Elite Guard = engine palette swap of Guard.

| Enemy | Seed | Asset ID |
|---|---|---|
| Guard | 411044 | `asset_VK24xWEtxJMEev1o2QLhCX2a` |
| Bounty Hunter | 411045 | `asset_KvYXwzw7U5zJH46hknvNPNiD` |
| Sentry | 411046 | `asset_fUXNadPapLHzLgbPyQQmCpT2` |

Note: these are 3/4 *front-facing* full-body sprites, not true top-down —
usable for the vertical slice at small scale and for portraits/codex; commit to
either rotation-sprite or re-source directional sheets before animation work.

### Wall textures (4/4, seamless)

| Theme | Asset ID |
|---|---|
| Sunken Treasury | `asset_2to9kaxu9y3niragDoKcL9Ag` |
| Cliffside Fortress | `asset_GZ7921BDMxEUArUF3mzvnFjj` |
| Undercity Vaults | `asset_f83atK9VWUZzaGkrpimLS4By` |
| Old Mint | `asset_b6dNGckka6LvroV7fvtppf7s` |

Old Mint wall lesson: `eraseSeam` smears regular panel grids (two attempts,
`asset_izoFSR6JHZDVfRX9ubnUxa8f` and `asset_m1omR6LSUAfFDwPYCmutjYra`, both
ghosted); the keeper was generated with `eraseSeam: false` — a uniform grid
pattern tiles on its own.

### HUD chrome (Human Interface 2.0 LoRA `model_2CrDSJ7FsBZckLpakS4JyS6A`)

| Element | Seed | Asset ID |
|---|---|---|
| Ornate panel frame | 411047 | `asset_dfa4bB35jcq2ZTN41aRXQMsg` |
| Button set (state grid) | 411048 | `asset_A4BptrN6vDd2oiVDJ79dEPWw` |
| Meter frames + flame gauge | 411049 | `asset_b4Qh9b28yaSbNcRMVEFTGFuN` |
| HUD pictogram sheet (heart, pouch, flame, pack…) | 411050 | `asset_K6TV5TBy3uBKqntfyumtS2ZV` |

Panel/buttons need 9-slice cutting in Godot; pictogram sheet needs manual
cutting into individual icons.

### Theme prop sheets (Environment Sprites 2.0 LoRA `model_uM7q4Ms6Y5X2PXie6oA9ygRa`)

One sheet per theme, ~4 props each, cut apart + background-removed for use:

| Theme | Seed | Asset ID |
|---|---|---|
| Sunken Treasury | 411051 | `asset_mAuVKamoHHL96M7zGUEShuWr` |
| Cliffside Fortress | 411052 | `asset_s48WKBua5sZ8PQH4f9NV6v2H` |
| Undercity Vaults | 411053 | `asset_q3MGHzYkHp62ZrZNVxTTHTFD` |
| Old Mint | 411054 | `asset_kvggfizpReNpctAqR4k9b1wQ` |

Props render with grass/ground bases — fine as freestanding decor; mask the
base off for props that must sit flush on interior floors.

## Tier 1 slice — in-engine wiring (treasury)

The generated art is wired into the procedural `_draw()` renderers, texture-first
with a fallback to the original vector/flat drawing when a texture is missing:

- `scripts/art.gd` (`Art`) — cached `load()` + `ResourceLoader.exists()` texture
  loader and tiled-surface painter. `scripts/themes.gd` (`Themes.DATA`) — the
  theme palette table, moved out of `vault.gd`.
- `vault.gd` tiles `assets/textures/<theme>/{floor,wall}.png` for floor / walls /
  raised platforms (384px on-screen period). `FORCE_THEME := "treasury"` locks the
  theme; set `""` to restore per-contract/random.
- `loot_item.gd` draws `assets/icons/loot/<loot_type>.png`; `guard.gd` draws
  `enemies/guard.png` (Elite = gold modulate); `sentry.gd` draws `enemies/sentry.png`
  under its vision cone. Gameplay tells (facing line, chase ring, cone) are kept.

### Background cutouts

Scenario rendered the icons/sprites on dark grounds, so in-world sprites needed
alpha. `assets/icons/loot/*.png` and `assets/enemies/{guard,sentry}.png` were
processed to RGBA by removing only the **border-connected** dark background
(preserving dark areas inside a subject); the pre-cutout masters remain in git
history. `enemies/bounty_hunter.png` is a dark-on-dark subject that did not cut
out cleanly and is left as its master (not used in-world; the Hunter keeps its
vector token). The other icon families (upgrades/trophies/contracts/buyers/boons)
were left with their backgrounds — they render on UI cards.

## Still open (not generated here)

1. **Jo (player)** with load-tier variants — needs the character-animation-model
   lock first; same icon LoRA can produce the base sprite when decided.
2. Extraction portal + staircase/edge pieces: hand-built or engine-drawn over
   base textures (diffusion can't do edge-matching autotiles reliably).
3. Heat meter per-state art: engine-composite from the flame gauge + pictogram.
4. Tier-3 identity work: title logo, screen backdrops, app icon, key art.
5. VFX and all audio (out of scope for image generation).

## Environment note

The Claude Code remote session's egress proxy blocks `cdn.cloud.scenario.com`,
so generated PNGs could not be downloaded directly from the session. Workaround:
export the assets from app.scenario.com and hand the zip to the session, which
places them under `assets/`.

**In-repo status:** all generated art is now committed.
- Environment textures (4 floors + 4 walls) under `assets/textures/<theme>/{floor,wall}.png`.
- Icons, enemies, HUD chrome, and prop sheets under `assets/{icons,enemies,ui,props}/`.
- Filenames match the game's own identifier keys (upgrade/trophy `id`, loot
  `LOOT_TYPES` key, contract `type`, buyer `id`, boon key, `THEMES` key), so
  wiring is a 1:1 lookup. See `assets/README.md` and `assets/textures/README.md`
  for the full file→asset-ID provenance maps.
- The 2 rejected trophy misses and 2 rejected Old Mint wall attempts are not
  committed.
