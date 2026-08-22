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
  loot and fences for pennies. Today it borrows the same arch as Crown Jewels and
  the Porcelain Relic and sits one hue-step off the gold family — near-invisible
  by accident rather than by design. §5.1 makes that deliberate: it is the one
  slot that *should* clone another (the Golden Idol), with every tell in the
  material. The Appraiser's Eye capstone adds a small green tick at `(+8, −10)`,
  drawn by code on top of the art.
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
- Bodies should occupy roughly **40–85 px** of the 128 cell (10–21 world units).
  Do not fill the frame; the halo needs the room. One exception: the artifact's
  halo ring (slot 10a) is 28 units across and will fill ~112 px. That is fine —
  it is circular and spins about the cell centre, so it stays inside the frame at
  every rotation.
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

Eleven prompts, each complete on its own — paste one, generate, move to the next.
Nothing here needs a preamble bolted on.

They are **model prompts**: they describe an object, its material and its
silhouette, and nothing else. Camera, lighting and export are a *render*
concern, they happen once in the tool rather than eleven times in a prompt, and
telling a 3D generator about cameras and ground shadows tends to make it model a
plinth. That part is §5.3, below the prompts.

### 5.1 The silhouette assignment

The finding in §0 is that six kinds currently share one shape. So the shapes are
assigned up front, deliberately, and each prompt states its own. Ten distinct
silhouettes and one intentional near-clone:

| # | Slot | Silhouette family | Identifying feature at 20 px |
|---|---|---|---|
| 01 | Loose Coin | wide and low | the flattest thing in the set |
| 02 | Cut Gem | tall narrow spike | the sharpest point |
| 03 | Golden Idol | heavy top-wide trapezoid | dense, blocky, no gaps |
| 04 | Marked Relic | flat oval pierced by voids | you can see through it |
| 05 | Skitterjewel | round mass, thin legs out | it's a bug |
| 06 | Crown Jewels | open ring with rising points | the hole in the middle |
| 07 | Porcelain Relic | curved hourglass profile | the only curves in the set |
| 08 | Gilded Fake | **deliberately clones 03** | nothing — that's the point |
| 09 | Offering Shrine | wide block, detached shape above | the gap between them |
| 10 | Bound Relic | open circle around a gem | ring plus contents |
| 11 | Vault Heart | broad mass in claws | biggest, heaviest, by a margin |

Colour is carrying meaning alongside shape, so keep the families straight: **gold
is money** (01, 03, 08), **violet is other** — cursed, sacred, bound (04, 09, 10),
and the rest are one-offs that own their hue outright.

### 5.2 The prompts

**01 · Loose Coin** — `#e9c15a`

> A small loose heap of four hand-struck gold coins resting against each other, one
> tipped up on its edge against the pile. Irregular hammered edges, worn relief of a
> face on the topmost coin, soft rounded thickness — struck metal, not machined.
> Warm antique gold `#e9c15a`, with dark tarnish pooled in the low relief. Stylised
> low-poly game asset: bold simplified forms, chunky readable geometry, heavy dark
> edge definition, no fine detail. The silhouette must be WIDE AND LOW — the
> flattest, most horizontal object in the set. Single isolated object. No base, no
> plinth, no ground plane, no scene, no text.

**02 · Cut Gem** — `#7fe3d0`

> A single brilliant-cut gemstone standing point-up, cold teal `#7fe3d0`, with large
> flat facets, sharp clean edges and bright internal refraction. Precise and
> geometric — cut by a jeweller, not found in a cave. Stylised low-poly game asset:
> bold simplified faceting, twelve facets or fewer, high contrast between lit and
> shadowed faces, heavy dark edge definition. The silhouette must be TALL, NARROW
> AND SHARPLY ANGULAR — a symmetrical spike, the most pointed object in the set.
> Single isolated object. No setting, no mount, no base, no ground plane, no scene,
> no text.

**03 · Golden Idol** — `#f5c542`

> A squat ceremonial gold idol: a broad-shouldered seated figure with a wide heavy
> base, stubby arms folded across its chest, a blank stylised face and a carved
> geometric headdress. Solid cast metal in bright ceremonial gold `#f5c542`, with
> dark tarnish pooled in the carved grooves. It should look like it weighs a great
> deal and would ring like a bell if dropped. Stylised low-poly game asset: bold
> simplified forms, heavy dark edge definition. The silhouette must be a HEAVY
> TOP-WIDE TRAPEZOID — wide shoulders over a wide base, dense and blocky, no gaps
> anywhere in the mass. Single isolated object. No plinth, no ground plane, no
> scene, no text.

**04 · Marked Relic** — `#a98bff`

> A ceremonial burial mask: a flat vertical face-plate in dull violet-black metal,
> `#a98bff` catching the light along its raised edges, with two hollow eye sockets
> and a narrow mouth slit cut clean through the plate so you can see through it. One
> owner's sigil struck deep into the brow. Sober and sinister rather than ornate —
> this is a marked object, and someone will come looking for it. Stylised low-poly
> game asset: bold simplified forms, heavy dark edge definition. The silhouette must
> be a FLAT VERTICAL OVAL PIERCED BY THREE VOIDS — the holes are the identifying
> feature and must still read as holes at very small size. Single isolated object.
> No stand, no ground plane, no scene, no text.

**05 · Skitterjewel** — `#7fd88a`

> A small living creature made of green gemstone: a rounded faceted body like a
> polished beetle, six thin dark spindly legs splayed wide, and two large
> forward-facing eyes with dark pupils. Caught mid-scuttle, alert, one instant from
> bolting. Body in bright jewel green `#7fd88a` with crystalline facets; legs and
> eye outlines in near-black. Cute enough to want, quick enough to lose. Stylised
> low-poly game asset: bold simplified forms, heavy dark edge definition. Model it
> FRONT-FACING with both eyes clearly visible — the eyes point where it flees and
> must read at very small size. The silhouette must be UNMISTAKABLY A BUG: a round
> mass with thin legs projecting out to the sides. Single isolated object. No base,
> no ground plane, no scene, no text.

**06 · Crown Jewels** — `#ff5da8`

> A slim royal circlet: a thin gold band with five tapering points rising from it,
> each point set with a rose-pink gemstone `#ff5da8`, the largest stone at the
> centre front. Tilted slightly forward so both the open band and the raised points
> read. Regal and restrained — a real crown, not a costume one. Stylised low-poly
> game asset: bold simplified forms, heavy dark edge definition. The silhouette must
> be an OPEN RING WITH RISING POINTS — the hole through the middle of the band is
> the identifying feature and must survive at very small size. Single isolated
> object. No cushion, no stand, no ground plane, no scene, no text.

**07 · Porcelain Relic** — `#dfeaf5`

> A tall porcelain vase: a narrow flared neck, a swelling round body, a small foot.
> Cool near-white glaze `#dfeaf5` with a fine painted band of pale blue geometric
> pattern at the shoulder and a faint crackle through the glaze. Visibly thin-walled
> and delicate — it should look one knock away from gone. Stylised low-poly game
> asset: bold simplified forms, heavy dark edge definition. The silhouette must be a
> SMOOTH CURVED HOURGLASS PROFILE — narrow, wide, narrow — the only object in the
> set built from curves rather than facets or blocks. Single isolated object, intact
> and unbroken. No base, no ground plane, no scene, no text.

**08 · Gilded Fake** — `#ffd27a`

> A cheap gilded reproduction of a ceremonial idol: the same squat broad-shouldered
> seated figure with a wide heavy base as a real gold idol, slightly smaller and
> hollow-feeling. Over-bright yellow plating `#ffd27a`, mirror-smooth where real
> cast gold would be textured, a visible mould seam running down one side, and one
> chipped corner at the base exposing dull grey base metal underneath. From across a
> room it must be mistakable for solid gold; up close it must be obviously wrong.
> Stylised low-poly game asset: bold simplified forms, heavy dark edge definition.
> The silhouette must DELIBERATELY MATCH a squat seated idol — this is the one
> object in the set meant to be confused with another. Every tell lives in the
> surface, never in the shape. Single isolated object. No plinth, no ground plane,
> no scene, no text.

**09 · Offering Shrine** — `#a98bff`

> A low dark-stone altar block — a rough-cut rectangular slab with carved channels
> across its top face — with a single violet crystal floating in the air above it,
> point-up and unsupported. Crystal in `#a98bff` with sharp facets and bright
> internal light; stone in near-black, with cool violet light spilling down into the
> carved channels from above. A set-piece meant to be spotted from across a dark
> room. Stylised low-poly game asset: bold simplified forms, heavy dark edge
> definition. The silhouette must be a WIDE BLOCK WITH A DETACHED FLOATING SHAPE
> ABOVE IT — the gap between altar and crystal is the identifying feature and must
> stay open at very small size. This is the only object in the set that includes its
> own base. No ground plane, no scene, no text.

**10a · Bound Relic — the halo ring** — `#a98bff`

> A broken open ring of ornate dark metal, roughly circular, with a gap at each side
> so it reads as two facing crescent arcs rather than a closed hoop. Etched with
> fine geometric banding, edges catching violet light `#a98bff`. Nothing inside the
> ring — the centre is empty and open. Stylised low-poly game asset: bold simplified
> forms, heavy dark edge definition. Model it flat-on and perfectly centred; this
> part rotates in-engine, so its centre must sit exactly at the model origin. Single
> isolated object. No gem, no base, no ground plane, no scene, no text.

**10b · Bound Relic — the bound gem** — `#ffe9a8` → `#a98bff`

> A single large faceted gemstone, pentagonal in profile, with a strong gradient
> running corner to corner from warm pale gold `#ffe9a8` at the top-left to deep
> violet `#a98bff` at the bottom-right. Bright, ornate and important — the thing a
> thief crosses a floor for. Large sharp facets, bold simplified forms, heavy dark
> edge definition, stylised low-poly game asset. Single isolated object, centred at
> the origin. No setting, no ring, no mount, no base, no ground plane, no scene, no
> text.

*Ship 10a and 10b as two separate 128 px PNGs. The engine spins the ring at
`glow * 0.6` and leaves the gem still — they cannot be one image.*

**11 · Vault Heart** — `#ff6b8a`

> A large raw crystalline heart held in a heavy gold cradle. The heart is a rough
> faceted mass of deep rose-pink crystal `#ff6b8a`, lit from within, its facets big
> and irregular like broken quartz rather than cut stone. The cradle is four thick
> ornate gold claws gripping it from below and behind. This is the single most
> valuable object in a vault — visibly bigger, denser and more ornate than any other
> treasure. Stylised low-poly game asset: bold simplified forms, heavy dark edge
> definition. The silhouette must be the LARGEST AND HEAVIEST MASS IN THE SET by a
> clear margin — a broad rounded body gripped by claws, unmistakable with all colour
> stripped out. Single isolated object. No plinth, no ground plane, no scene, no
> text.

### 5.3 Baking them — set once, not per prompt

Whatever renders the generated models to sprites must use **one camera and one
light rig for all eleven**, or they will not look like a set:

- **Camera:** orthographic, **35° elevation**, straight-on azimuth — the shallow
  3/4 top-down the rest of the game reads in. No per-object framing, no
  perspective, no dolly.
- **Light:** neutral key from upper-left, cool fill from the right, one warm gold
  rim from behind. Same intensities every time.
- **No shadow catcher, no ground plane, no bloom, no ambient occlusion ground
  contact.** The engine draws the shadow and the halo (§2).
- **Export:** 128 × 128 PNG, straight alpha, object centred on pixel (64, 64),
  body occupying 40–90 px (§3).
- **Outline:** if the render doesn't carry a hard dark edge, add it in post —
  `#050404`, ~8 px at this scale. It is what keeps a 6.5 pt object legible on a
  near-black floor, and it is the one thing every piece must share.

### 5.4 Judge in greyscale first

Before any detail pass, render the set as **flat greyscale silhouettes at 20 px**
and look at them together. If two are not separable — 08 excepted, which is
*supposed* to clone 03 — the shape is wrong and no amount of material work will
save it. That is precisely how the current vector set fails, and it is the whole
reason this document exists.

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
