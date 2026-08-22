# Greedrun — Loot Slots

The eleven things `drawLoot()` knows how to draw, specified tightly enough to
commission art against. Companion image: **`docs/loot-reference.png`** — every
slot rendered through the game's own draw path at the engine's maximum render
scale, plus a 1:1 strip at true phone pixel density.

Regenerate both with `tools/loot-sheet/` (see its README). Every number below is
read out of `web/index.html` at build **2026-08-17.27** — `LOOT_TYPES` (~L1472),
`lootColor()` / `drawLoot()` (~L4515), `TROPHY_GEM` (~L5410).

---

## 0. The three numbers that decide everything

**One world unit is 0.65 pt on a phone.** Portrait `VIEW.w` is 600 units across a
~390 pt stage. So the loot bodies below — 10 to 21 units — land on screen between
**6.5 pt and 13.5 pt**. A tap target is 44. These are jewellery-sized.

**The glow is four times the body, and the engine draws it.** Every non-special
kind gets a radial gradient out to r20 (r30 for artifacts), pulsing +12%. That is
26 pt of halo around 6.5 pt of object. At a glance across a dark vault the player
is reading *the halo* — its colour, its size, whether it pulses. The object inside
it is a confirmation, not the signal.

**Six of eleven kinds currently share one silhouette.** `loud`, `cursed`, `royal`,
`fragile`, `fake` and `mythic` all fall through to the same arch-shaped icon —
a circle over a rectangle — separated only by hue and by three sizes (s5 / s7 /
s9). That is the single biggest thing real art can fix, and it is worth more than
fidelity on any individual piece.

---

## 1. The slots

| # | kind | id | Name | Value | Wt | Noise | Curse | Colour | Silhouette today | Body (world u) | Glow r |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 01 | `common` | `coin` | Loose Coin | 60 | 1 | 0 | 0 | `#e9c15a` | circle r5 | 10 × 10 | 20 |
| 02 | `valuable` | `gem` | Cut Gem | 170 | 2 | 1 | 0 | `#7fe3d0` | diamond r5 | 10 × 10 | 20 |
| 03 | `loud` | `idol` | Golden Idol | 460 | 5 | 4 | 0 | `#f5c542` | arch s7 | 9.8 × 16.1 | 20 |
| 04 | `cursed` | `mask` | Marked Relic | 900 | 6 | 2 | 3 | `#a98bff` | arch s7 | 9.8 × 16.1 | 20 |
| 05 | `living` | `living` | Skitterjewel | 380 | 3 | 2 | 0 | `#7fd88a` | creature + legs + eyes | 16 × 13 | 18 |
| 06 | `royal` | `royal` | Crown Jewels | 720 | 5 | 3 | 0 | `#ff5da8` | arch s5 | 7 × 11.5 | 20 |
| 07 | `fragile` | `fragile` | Porcelain Relic | 560 | 2 | 0 | 0 | `#dfeaf5` | arch s5 | 7 × 11.5 | 20 |
| 08 | `fake` | `fake` | Gilded Fake | 520 | 2 | 0 | 0 | `#ffd27a` | arch s5 | 7 × 11.5 | 20 |
| 09 | `shrine` | — | Offering Shrine | 0 | 0 | 0 | 0 | `#a98bff` | altar block + gem triangle | 18 × 24 | 18–22 |
| 10 | `artifact` | — | Bound Relic (12 named) | 700–1149 | 0 | 0 | 0 | `#a98bff` → `#ffe9a8` | halo ring r14 + faceted gem | 28 × 28 | 30 |
| 11 | `mythic` | `heart` | Vault Heart | 2600 | 11 | 6 | 6 | `#ff6b8a` | arch s9 + white centre pip | 12.6 × 20.7 | 20 |

Arch geometry, for reference: a circle of radius `0.7s` centred at `-0.5s`, over a
rect `1.4s × 1.3s` from `-0.2s`. Total footprint `1.4s × 2.3s`.

**Slots 09 and 10 are not in `LOOT_TYPES`.** The Offering Shrine and the Bound
Relics are placed directly by `build()` — the shrine is a mid-depth set-piece that
grants a boon and stirs the vault (+1 Heat); each artifact rolls a value of
`700 + rng*450` and carries one of twelve names (The Gilded Debt, The Empty
Throne, Blade of the Last Auction …). Both are *destinations* in a way the bulk
loot is not: the player crosses a floor to reach them. Their art should be able to
carry that from across a room.

### Behaviour worth knowing before drawing

- **Skitterjewel moves.** It scuttles and flees; `drawLoot` jitters the body, bobs
  it, and points both pupils along the flee vector. Any replacement has to keep a
  readable *front* and eyes, or the flee direction stops reading.
- **Porcelain Relic does not need a shattered sprite.** When a guard lands a hit
  while you carry it, the code sets `got=false` and plays a shatter cue — the
  piece returns to its original floor position, intact. (`ASSET_MANIFEST.md` §2
  still lists an "intact **and** shattered state"; that is stale.) Note for later:
  the piece reappearing whole at its spawn is arguably wrong, but it is not an
  art problem.
- **Gilded Fake must read as valuable and be wrong.** It raises Heat like real
  loot and fences for pennies. Its current tell is a hue nudge off Loose Coin
  (`#ffd27a` vs `#e9c15a`) — deliberately near-invisible. The Appraiser's Eye
  capstone adds a small green tick at `(+8, −10)`, drawn by code on top of the
  art. Keep the deception in the *material*, not the shape.
- **Vault Heart is the centrepiece.** Weight 11 — nearly double the next heaviest
  piece in the game — plus the top noise and the top curse on the table. There is
  no hard bag cap; weight is a continuous drag on speed and volume, so carrying
  the Heart out is the run's biggest single decision. It currently looks like a
  pink Crown Jewel.

---

## 2. What the engine draws — leave it out of the art

`drawLoot()` composites these around your sprite. Bake none of them in:

| Drawn by code | Detail |
|---|---|
| **The glow** | radial gradient, `colour + '88'` → `colour + '00'`, r20 (r18 living/shrine, r30 artifact), pulsing ±12% at `dt*4` |
| **The ground shadow** | when the piece sits on a platform (`plat >= 0`): an ellipse `7 × 3` at `+6`, then the art lifts by `−7` |
| **The Appraiser's Eye tick** | a `#7fc98a` dot r2.2 at `(+8, −10)` on a clocked fake |
| **Artifact rotation** | the halo ring spins at `glow * 0.6` — ring and gem are separate layers |
| **Ink outline** | `#050404` at `lineWidth 2` (≈ 2 world units) — bake this one *in*, it is what keeps 6 pt objects legible on near-black floors |

So a delivered asset is: **the object, on transparent, with its dark outline, no
shadow, no halo, no background.**

---

## 3. Export contract

- **128 × 128 px PNG**, straight alpha, no matte, no semi-transparent fringe.
- The cell represents **32 × 32 world units** → **4 px per world unit**. The engine
  never draws loot above 2.5 px/unit (`RS` is clamped to 2.5), so this is 1.6×
  headroom — enough for a future zoom, cheap enough to ship eleven of.
- **Centre-anchored.** `drawLoot` translates to the piece's world `(x, y)` and
  draws around the origin. Put the object's visual centre at pixel `(64, 64)`.
  This is *not* the Jo atlas contract — Jo is feet-baselined at `y = 118`; loot is
  centred. Do not mix them up.
- Bodies should occupy roughly **40–90 px** of the 128 cell (10–22 world units).
  Do not fill the frame; the halo needs the room.
- One hero colour per slot, matching the table. The palette is doing mechanical
  work — teal means valuable, violet means cursed, green means it runs away — so
  a piece that drifts off its hue breaks a read the player has been trained on.

Suggested drop path: `web/assets/loot/<kind>.png`, with a manifest beside it
mirroring `web/assets/jo/atlas_manifest.json`.

---

## 4. The second surface: the Collection

Five of these kinds already have a second home — the trophy niches in The
Collection, currently rendered as a CSS `.gem` + `.plinth` with its own palette:

| Trophy | kind | Niche colour | vs. world colour |
|---|---|---|---|
| Golden Idol | `loud` | `#f5c542` | same |
| Marked Relic | `cursed` | `#a98bff` | same |
| Skitterjewel | `living` | `#8fe39a` | `#7fd88a` — near-identical |
| Bound Relic | `artifact` | `#ff9a4a` | violet/gold — **diverges** |
| Vault Heart | `mythic` | `#e0503f` | `#ff6b8a` — **diverges** |

Two real inconsistencies there. When art lands for slots 04, 10 and 11, the niche
should adopt the world colour rather than the reverse — the world is where the
player learns the language.

---

## 5. Prompting Mint.gg

Mint generates 3D; the game needs a flat sprite. The workflow is: generate the
object, render it orthographically from a fixed camera, export at 128, drop it in.
Same discipline as `tools/sprite-bake/` — one camera, one light rig, every piece
baked through it, so eleven assets look like one set.

**Camera lock (state this in every prompt):** orthographic, **35° elevation**,
straight-on azimuth — the shallow 3/4 top-down the rest of the game reads in.
Every piece from the identical camera; no per-object framing.

### Shared style preamble — paste above each prompt

> Single isolated object on a fully transparent background. Stylised game asset for
> a dark, luxuriant top-down heist game — near-black stone vaults lit by gold.
> Bold simplified forms with a heavy near-black outline (`#050404`); high internal
> contrast; one dominant hero colour per object. Readable as a silhouette at 20
> pixels. No ground shadow, no glow, no light bloom, no scene, no text, no base or
> pedestal unless specified. Orthographic camera, 35° elevation, straight-on
> azimuth. Neutral key light from upper-left, cool fill, one warm gold rim.

### Per-slot prompts

1. **Loose Coin** — `#e9c15a`. A small heap of three or four struck gold coins,
   irregular hand-cut edges, one leaning on its side so the stack reads as a
   silhouette rather than a disc. Wide and low. The cheapest thing in the vault.
2. **Cut Gem** — `#7fe3d0`. A single brilliant-cut teal gemstone, sharp facets,
   internal light, standing point-up. Clean, geometric, cold. Nothing ornate.
3. **Golden Idol** — `#f5c542`. A squat gold votive figure, heavy and top-loud —
   an object that would *clang*. Broad shoulders, thick base, ceremonial. It
   should look like it weighs five of the coins above.
4. **Marked Relic** — `#a98bff`. A ritual mask in dull violet-black metal, hollow
   eyes, an ownership sigil struck into the brow. Sinister but sober. It is cursed
   and expensive, and it should look like both.
5. **Skitterjewel** — `#7fd88a`. A palm-sized live creature made of green gemstone
   with six thin dark legs and two large forward-facing eyes. Rounded body, alert,
   caught mid-scuttle. Cute enough to want, quick enough to lose. Front view: the
   eyes must read clearly, they point where it flees.
6. **Crown Jewels** — `#ff5da8`. A slim royal circlet set with rose-pink stones,
   tilted so the band and the stones both read. Regal, not gaudy. Stealing it
   brings elite guards, so it should look *noticed*.
7. **Porcelain Relic** — `#dfeaf5`. A pale glazed porcelain vase, narrow neck,
   fine painted band at the shoulder, cool near-white. Visibly thin-walled — it
   should look one knock from gone.
8. **Gilded Fake** — `#ffd27a`. A gilded reproduction of a small treasure: correct
   shape, over-bright plating, one hairline seam and a chipped corner showing
   grey base metal. From a distance it must read as real gold. Up close, wrong.
9. **Offering Shrine** — `#a98bff`. A low dark-stone altar block with a single
   floating violet crystal above it, faceted, point-up. A set-piece meant to be
   spotted from across a room. Include the altar base; this is the one object
   that gets one.
10. **Bound Relic** — `#a98bff` → `#ffe9a8`. A faceted gem in gold-to-violet
    gradient held inside an open metal halo ring — two separable layers: the ring
    spins in-engine, so deliver **ring and gem as separate 128 px PNGs**. Ornate,
    important, the thing you cross a floor for.
11. **Vault Heart** — `#ff6b8a`. A large raw crystalline heart, deep rose-pink,
    faceted and internally lit, held in a heavy gold cradle. The single most
    valuable object in the game — bigger, denser and more ornate than everything
    above it, and it should be obvious which one it is with the colour stripped
    out.

Ask for **greyscale silhouette thumbnails first**, at 20 px, before any detail
pass. If the eleven are not separable in greyscale at 20 px, the detail is wasted —
that is exactly the failure the current vector set has.

---

## 6. Wiring art in

The engine change is small and should sit behind a switch, exactly like Jo's:

- Add `let LOOT_STYLE = 'vector'` beside `JO_STYLE` (~L1001).
- Load `web/assets/loot/*.png` into an image map at boot; fall back to vector on
  any load failure, so a missing file never blanks a pickup.
- In `drawLoot()`, keep the glow / shadow / tick / rotation blocks exactly as they
  are and swap only the body: `drawImage(img, -16, -16, 32, 32)` in place of the
  shape branch.
- Nothing in the simulation moves. Pickup radius keys off `player.r + 16` and the
  loot's world `(x, y)`, never off its drawn size — the same decoupling that lets
  Jo swap between vector and atlas without touching collision.
- Add the loaded-image assertions to `tests/web_juice_test.mjs` and keep
  `LOOT_STYLE` exposed on `window.__greed` so the suite can flip it.
