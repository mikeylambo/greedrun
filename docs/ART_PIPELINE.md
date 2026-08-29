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

## Remaining queue (in priority order)

1. Loot icons ×9 (same icon LoRA; world-pickup variants can reuse icon art
   initially).
2. Trophy icons ×5, contract icons ×9 (same LoRA + template).
3. Wall textures ×4 themes (Scenario Texture, same theme prompts with "wall").
4. Decorative props, 3–6 per theme ("Environment Sprites 2.0"
   `model_uM7q4Ms6Y5X2PXie6oA9ygRa`, alpha sprites).
5. HUD chrome (frames/panels: "Human Interface 2.0"
   `model_2CrDSJ7FsBZckLpakS4JyS6A`); meter states (Heat 0–6, hearts) are
   engine-composited from single art elements — do not generate per-state art.
6. Extraction portal + staircase/edge pieces: hand-built or engine-drawn over
   base textures (diffusion can't do edge-matching autotiles reliably).

## Environment note

The Claude Code remote session's egress proxy blocks `cdn.cloud.scenario.com`,
so generated PNGs could not be committed directly from the session. Download
from app.scenario.com and place under `assets/` per ASSET_MANIFEST.md formats.
