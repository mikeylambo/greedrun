# Greedrun — Loot Slots

Spec for commissioning loot art. Companion image: **`docs/loot-reference.png`** —
all eleven kinds rendered through the game's own `drawLoot()`, plus a 1:1 strip at
true phone pixel density. Regenerate with `tools/loot-sheet/`.

Numbers read from `web/index.html` @ **2026-08-17.27**: `LOOT_TYPES` ~L1472,
`lootColor()`/`drawLoot()` ~L4515, `TROPHY_GEM` ~L5410.

## Constraints

- **One world unit = 0.65 pt on a phone.** Bodies land at **6.5–13.5 pt**. A tap
  target is 44. These are jewellery-sized.
- **The glow is 4× the body and the engine draws it.** 26 pt of halo around 6.5 pt
  of object. At a glance the player reads the halo; the object confirms it.
- **Six of eleven kinds share one silhouette today** — `loud`, `cursed`, `royal`,
  `fragile`, `fake`, `mythic` all fall through to the same arch, separated only by
  hue and three sizes. Fixing that is worth more than fidelity on any one piece.

## The slots

| # | kind | id | Name | Value | Wt | Noise | Curse | Colour | Body (world u) | Glow r |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | `common` | `coin` | Loose Coin | 60 | 1 | 0 | 0 | `#e9c15a` | 10 × 10 | 20 |
| 02 | `valuable` | `gem` | Cut Gem | 170 | 2 | 1 | 0 | `#7fe3d0` | 10 × 10 | 20 |
| 03 | `loud` | `idol` | Golden Idol | 460 | 5 | 4 | 0 | `#f5c542` | 9.8 × 16.1 | 20 |
| 04 | `cursed` | `mask` | Marked Relic | 900 | 6 | 2 | 3 | `#a98bff` | 9.8 × 16.1 | 20 |
| 05 | `living` | `living` | Skitterjewel | 380 | 3 | 2 | 0 | `#7fd88a` | 16 × 13 | 18 |
| 06 | `royal` | `royal` | Crown Jewels | 720 | 5 | 3 | 0 | `#ff5da8` | 7 × 11.5 | 20 |
| 07 | `fragile` | `fragile` | Porcelain Relic | 560 | 2 | 0 | 0 | `#dfeaf5` | 7 × 11.5 | 20 |
| 08 | `fake` | `fake` | Gilded Fake | 520 | 2 | 0 | 0 | `#ffd27a` | 7 × 11.5 | 20 |
| 09 | `shrine` | — | Offering Shrine | 0 | 0 | 0 | 0 | `#a98bff` | 18 × 24 | 18–22 |
| 10 | `artifact` | — | Bound Relic (×12) | 700–1149 | 0 | 0 | 0 | `#a98bff`→`#ffe9a8` | 28 × 28 | 30 |
| 11 | `mythic` | `heart` | Vault Heart | 2600 | 11 | 6 | 6 | `#ff6b8a` | 12.6 × 20.7 | 20 |

- **09 and 10 aren't in `LOOT_TYPES`** — `build()` places them directly. Both are
  destinations the player crosses a floor for; the art should carry that.
- **Skitterjewel moves.** It scuttles and flees, and its pupils point along the
  flee vector — keep a readable front and eyes.
- **Porcelain Relic needs no shattered sprite.** A hit sets `got=false` and the
  piece returns to its spawn intact. (`ASSET_MANIFEST.md` §2 says otherwise; stale.)
- **Vault Heart** is weight 11, top noise, top curse — the run's biggest decision.
  It currently looks like a pink Crown Jewel.
- **Collection palette diverges** for Bound Relic (`#ff9a4a`) and Vault Heart
  (`#e0503f`). When art lands, the niche adopts the world colour, not the reverse.

## The engine draws these — keep them out of the art

| | |
|---|---|
| Glow | radial `colour+'88'` → `colour+'00'`, r20 (r18 living/shrine, r30 artifact), pulsing ±12% |
| Ground shadow | on platforms: ellipse `7 × 3` at `+6`, art lifts `−7` |
| Appraiser's Eye tick | `#7fc98a` dot r2.2 at `(+8, −10)` on a clocked fake |
| Artifact rotation | ring spins at `glow * 0.6`; ring and gem are separate layers |
| Ink outline | `#050404` @ `lineWidth 2` — **bake this one in.** It's what keeps a 6.5 pt object legible on a near-black floor. |

## Export

- **128 × 128 PNG**, straight alpha, no matte, no fringe.
- Cell = **32 × 32 world units** (4 px/unit). Engine never exceeds 2.5 px/unit.
- **Centre-anchored** at pixel (64, 64). Not Jo's contract — Jo is feet-baselined
  at `y = 118`. Don't mix them up.
- Bodies 40–85 px. Exception: the artifact halo ring fills ~112 px, which is fine —
  it's circular and spins about the centre.
- Hold the hero colour. The palette does mechanical work: teal = valuable, violet =
  cursed/sacred, green = it runs away.
- Drop path: `web/assets/loot/<kind>.png`.

## Prompts

Paste one, generate, next. They describe object, material and silhouette only —
camera and lighting are a render setting you configure once (below), and telling a
3D generator about cameras tends to get you a modelled plinth.

Shapes are assigned up front so the set separates. Ten distinct, one deliberate clone:

| # | Slot | Silhouette | Reads at 20 px as |
|---|---|---|---|
| 01 | Loose Coin | wide and low | the flattest thing in the set |
| 02 | Cut Gem | tall narrow spike | the sharpest point |
| 03 | Golden Idol | heavy top-wide trapezoid | dense, blocky, no gaps |
| 04 | Marked Relic | flat oval pierced by voids | you can see through it |
| 05 | Skitterjewel | round mass, thin legs out | a bug |
| 06 | Crown Jewels | open ring with rising points | the hole in the middle |
| 07 | Porcelain Relic | curved hourglass | the only curves in the set |
| 08 | Gilded Fake | **deliberately clones 03** | nothing — that's the point |
| 09 | Offering Shrine | wide block, shape floating above | the gap between them |
| 10 | Bound Relic | open circle around a gem | ring plus contents |
| 11 | Vault Heart | broad mass in claws | biggest and heaviest, by a margin |

Gold is money (01, 03, 08). Violet is other — cursed, sacred, bound (04, 09, 10).
The rest own their hue outright.

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


### Bake settings — once, not per prompt

One camera and one light rig for all eleven or they won't look like a set.

- **Camera:** orthographic, **35° elevation**, straight-on azimuth. No per-object
  framing, no perspective.
- **Light:** neutral key upper-left, cool fill right, one warm gold rim behind.
- **No** shadow catcher, ground plane, bloom, or AO ground contact.
- **Export** per §Export above.
- **Outline:** if the render doesn't carry a hard dark edge, add it in post —
  `#050404`, ~8 px at this scale.

### Before any detail pass

Render the set as flat greyscale silhouettes at 20 px and look at them together.
If two aren't separable — 08 excepted — the shape is wrong and material work won't
save it. That's exactly how the current vector set fails.

## Wiring art in

- `let LOOT_STYLE = 'vector'` beside `JO_STYLE` (~L1001); expose it on `window.__greed`.
- Load `web/assets/loot/*.png` at boot, falling back to vector on any load failure.
- In `drawLoot()`, keep glow / shadow / tick / rotation as-is; swap only the body
  for `drawImage(img, -16, -16, 32, 32)`.
- Nothing in the simulation moves — pickup keys off `player.r + 16` and the loot's
  world `(x, y)`, never its drawn size.
