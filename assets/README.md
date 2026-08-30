# Assets - Provenance & Naming

AI-generated art for the Godot build. Filenames match the identifier keys in the
game code so wiring is a 1:1 lookup - no rename step. Prompts, seeds, and
generation notes are in `docs/ART_PIPELINE.md`; environment tilesets have their
own `assets/textures/README.md`.

**Naming source of truth:**
- `icons/upgrades/<id>` - `id` from `autoload/progression.gd` upgrades
- `icons/trophies/<id>` - `id` from `autoload/progression.gd` trophies
- `icons/loot/<type>` - key from `LOOT_TYPES` in `scripts/vault.gd` (plus `artifact`, and `fragile_broken` for the shattered state)
- `icons/contracts/<type>` - contract `type` from `scripts/main.gd`
- `icons/buyers/<id>` - `id` from `autoload/economy.gd`
- `icons/boons/<key>` - entries of `BOONS` in `scripts/vault.gd`
- `enemies/<name>`, `ui/<name>`, `props/<theme>` - theme keys match `THEMES` in `scripts/vault.gd`

All source PNGs are 1024x1024, generated with Scenario (see ART_PIPELINE for the
per-family model/LoRA). Icons and enemies have transparent/dark grounds; `ui/` and
`props/` sheets contain multiple elements and need cutting (9-slice for panels/
buttons, sprite extraction for pictograms and props).

## File -> Scenario asset ID


### `icons/upgrades/`

| File | In-game | Scenario asset ID |
|---|---|---|
| `boots.png` | Muffled Boots | `asset_6axyLWpsd3skJF9oSqf28iMb` |
| `feet.png` | Quick Feet | `asset_4t7K4TdFMoS8GfNtVZmR9XhF` |
| `straps.png` | Reinforced Straps | `asset_Q9iHxUT2AAjx9UteTjKznrgW` |
| `pockets.png` | Deep Pockets | `asset_DuPZvKVxUDU2g2aCxbmQ12Sc` |
| `contacts.png` | Guild Contacts | `asset_QL8mdBGezx7ubwNeKFhry2WM` |
| `luck.png` | Thief's Luck | `asset_Q6PMVi9SpUNBJUeKpT47d9wb` |
| `cool.png` | Cool Head | `asset_oH6gPqn6X69PpKpi2exgSSeA` |
| `revive.png` | Second Wind | `asset_KjHFYrZbgH6QZ9uvH1eGT2UJ` |
| `landing.png` | Cat's Landing | `asset_WhHyNyTKPav38FRPUibRE4RC` |
| `scanner.png` | Treasure Sense | `asset_97E6qo7qFk5vRmqutw8vxxuf` |

### `icons/loot/`

| File | In-game | Scenario asset ID |
|---|---|---|
| `coin.png` | Loose Coin | `asset_Q8uXF94vHP8rKWQDnGFHN4u7` |
| `gem.png` | Cut Gem | `asset_jUTrRpspFfY2XVobT1Xs3aZB` |
| `idol.png` | Golden Idol | `asset_gjkLRhW9D7AyKw7vEMNu1FKb` |
| `mask.png` | Marked Relic | `asset_cdkzWc62Ny2TfUYkWm78CL6V` |
| `living.png` | Skitterjewel | `asset_CX7aHjozk2Vh8ecBow6nrhNe` |
| `royal.png` | Crown Jewels | `asset_CnY2H1Q5dZiFoEhYAJPdWPuU` |
| `fragile.png` | Porcelain Relic | `asset_icxebWTEjoUhkMJ4FXTJ1J9v` |
| `fragile_broken.png` | Porcelain Relic (shattered) | `asset_Xwdj8wLxyYTCEtVksgbtQWEJ` |
| `artifact.png` | Decision Artifact | `asset_yi87jQDwJpVPzPMauUq2XvpV` |
| `heart.png` | Vault Heart | `asset_58PuoKxDYV2t7MQPkmiRyh5A` |

### `icons/trophies/`

| File | In-game | Scenario asset ID |
|---|---|---|
| `idol.png` | Golden Idol | `asset_AzHo93tiFdLVVqPHyHLXZWdK` |
| `relic.png` | Marked Relic | `asset_FTXoFAzd4ATFhX1rxmTkVxXJ` |
| `jewel.png` | Skitterjewel | `asset_WsbQeqM362nQD1mPYd9qYqav` |
| `relicart.png` | Bound Relic | `asset_ZR91BJc3vVhjMmCKYsvMPAPi` |
| `heart.png` | Vault Heart | `asset_a8c64B7WF6p65PzUEDEYx77n` |

### `icons/contracts/`

| File | In-game | Scenario asset ID |
|---|---|---|
| `quota.png` | Smuggling Run | `asset_xPpKjyBkYc9eioftqBVb2R9H` |
| `silent.png` | Silent Job | `asset_HEdXHf6Uu643MPrGxkWuAe1v` |
| `steal.png` | Contract Theft | `asset_p4HoHYGMFm9b7aLtnJqPvJu9` |
| `sweep.png` | Clean Sweep | `asset_H35c3Cvx52jdyjt64aeZwMZk` |
| `timed.png` | Timed Raid | `asset_HsMtz4oRo4MCLBSNt3Y1evJU` |
| `recovery.png` | Recovery Job | `asset_aVHVyDHZBhzRU3qYNScSxD5e` |
| `heart.png` | Legendary Heist | `asset_zhj4ZGvgz56z44LKXouAcKgK` |
| `untouched.png` | Ghost Job | `asset_KqebFhBhgz2hP2kmTVUMAPk7` |
| `hot.png` | Bounty Run | `asset_EqpxnKf2Bb2AnJCCEjjhcqB6` |

### `icons/buyers/`

| File | In-game | Scenario asset ID |
|---|---|---|
| `black.png` | Black Market | `asset_syTp7W5GDGMZBPeYrM7DaQCZ` |
| `noble.png` | Noble Collector | `asset_HknCRcJ6NDDfu4KxJ38Bg3NK` |
| `syndicate.png` | The Syndicate | `asset_fy4D8aDpd2pyckWTyFsVjhqU` |
| `return.png` | Return it | `asset_ZGFtdCr2c92r95WvF7C6N614` |
| `keep.png` | Keep it | `asset_3Vw8nvzQsYyzBQqdtoHz6V5s` |

### `icons/boons/`

| File | In-game | Scenario asset ID |
|---|---|---|
| `sense.png` | Greed Sense | `asset_S9oYCUP1mWZJv1CorYr8qLwQ` |
| `ghost.png` | Smoke Step | `asset_tatokAZ7MFr1DmE3g1kiT4DZ` |
| `muffle.png` | Silence | `asset_Q1DJCihED5gE3cE36TFytexs` |

### `enemies/`

| File | In-game | Scenario asset ID |
|---|---|---|
| `guard.png` | Guard | `asset_VK24xWEtxJMEev1o2QLhCX2a` |
| `bounty_hunter.png` | Bounty Hunter | `asset_KvYXwzw7U5zJH46hknvNPNiD` |
| `sentry.png` | Sentry | `asset_fUXNadPapLHzLgbPyQQmCpT2` |

### `ui/`

| File | In-game | Scenario asset ID |
|---|---|---|
| `panel_frame.png` | Ornate panel (9-slice) | `asset_dfa4bB35jcq2ZTN41aRXQMsg` |
| `button_set.png` | Button state grid | `asset_A4BptrN6vDd2oiVDJ79dEPWw` |
| `meter_frames.png` | Meter frames + flame gauge | `asset_b4Qh9b28yaSbNcRMVEFTGFuN` |
| `hud_pictograms.png` | HUD pictogram sheet | `asset_K6TV5TBy3uBKqntfyumtS2ZV` |

### `props/`

| File | In-game | Scenario asset ID |
|---|---|---|
| `treasury.png` | Sunken Treasury props | `asset_mAuVKamoHHL96M7zGUEShuWr` |
| `fortress.png` | Cliffside Fortress props | `asset_s48WKBua5sZ8PQH4f9NV6v2H` |
| `undercity.png` | Undercity Vaults props | `asset_q3MGHzYkHp62ZrZNVxTTHTFD` |
| `mint.png` | Old Mint props | `asset_kvggfizpReNpctAqR4k9b1wQ` |

### Not committed (rejected duplicates)

Two trophy first-passes drew a generic trophy cup instead of the subject and were re-rolled; the misses are excluded: `asset_GrKgcz3BnDhC3dqWLthgTN2g` (Golden Idol), `asset_VJyQP1K44385VJVcJW4ee32W` (Bound Relic).
