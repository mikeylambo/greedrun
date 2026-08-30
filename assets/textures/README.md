# Environment Textures

Seamless 1024×1024 PNGs generated with Scenario Texture. Folder names match the
`THEMES` keys in `scripts/vault.gd` (`treasury`, `fortress`, `undercity`, `mint`)
so tileset wiring maps 1:1. At the locked 64 px tile size each is a 16×16 grid of
cells. See `docs/ART_PIPELINE.md` for prompts and generation notes.

| File | Theme (in-game name) | Scenario asset ID |
|---|---|---|
| `treasury/floor.png` | Sunken Treasury | `asset_Ds8X7fp1XXmDpNyPahJAgZG3` |
| `treasury/wall.png` | Sunken Treasury | `asset_2to9kaxu9y3niragDoKcL9Ag` |
| `fortress/floor.png` | Cliffside Fortress | `asset_ovLcZw1dquxKdbJFPgmPQThp` |
| `fortress/wall.png` | Cliffside Fortress | `asset_GZ7921BDMxEUArUF3mzvnFjj` |
| `undercity/floor.png` | Undercity Vaults | `asset_5xh4hpx9XD627Bt7Kb2gi4vc` |
| `undercity/wall.png` | Undercity Vaults | `asset_f83atK9VWUZzaGkrpimLS4By` |
| `mint/floor.png` | Old Mint | `asset_p7Y4CQqAejUxNXTy1oC9EyJA` |
| `mint/wall.png` | Old Mint | `asset_b6dNGckka6LvroV7fvtppf7s` |

The two rejected Old Mint wall attempts (`asset_izoFSR6JHZDVfRX9ubnUxa8f`,
`asset_m1omR6LSUAfFDwPYCmutjYra`) from the same export are intentionally not
committed — both had seam-erase ghosting; the keeper was generated with
`eraseSeam: false`.

Not yet in-repo (second export is larger): icons, enemy sprites, prop sheets,
HUD chrome. Those asset IDs are catalogued in `docs/ART_PIPELINE.md`.
