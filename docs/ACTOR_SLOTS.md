# Greedrun — Guards & the Threshold Offering

Art brief for the four guard variants and the three pedestals at every vault door.
Same pipeline as `docs/LOOT_SLOTS.md` — `tools/loot-bake/`, 128px cells, the
engine keeps drawing everything that signals state.

Numbers read from `web/index.html` @ **2026-08-17.28**: `drawGuard()` ~L4600,
`inkCloak`/`inkHood`/`inkOrb`/`inkHorns`/`inkCrown`, `DOOR_PERKS` ~L1216.

## Two things to know before drawing

**Guards are not humanoid.** Each is a hooded near-black **orb** with one glowing
eye — `r = 14` world units, the same radius as Jo's collision. That abstraction is
deliberate and it works: sinister, readable, and it rotates. Do not replace it
with a person.

**They rotate, they don't face.** The engine draws each guard through
`ctx.rotate(g.face)` — full 360°, not four directions. So each variant is **one
sprite baked from overhead**, not a directional set. That makes them cheaper than
the Skitterjewel, not dearer.

## The eye stays code-drawn

`inkOrb` puts a radial glow at `0.42r` along the facing, and its colour *is* the
threat state:

| state | accent | glow | pulse |
|---|---|---|---|
| patrol | `150,124,80` dim tan | 0.5 | steady |
| investigate | `232,168,70` amber | 0.9 | 520 ms |
| chase | `224,80,63` red | 1.0 | 200 ms |

Also code-drawn and out of the art: the vision-cone gradient, the `!` / `?` / `✶`
markers above the head, and the ground shadow. **Leave the eye socket dark and
empty** — the glow lands in it. With the sprite rotated by `face`, that socket
sits at 42% of the radius toward the sprite's right (+X).

## Guard slots

| # | file | variant | units | what it is |
|---|---|---|---|---|
| G1 | `guard_watchman` | default | 34 | robed watchman — cloak drape + pointed cowl |
| G2 | `guard_elite` | Royal-summoned | 34 | crowned, pink accents |
| G3 | `guard_hunter` | Bounty Hunter | 38 | brute, `1.14r`, curved horns |
| G4 | `guard_dog` | watchdog | 38 | low lean hound, amber eye |

### G1 · Watchman — `#171310`

> A hooded sentinel seen from directly overhead: a near-black sphere of a body
> wrapped in a heavy dark robe, with a pointed cowl rising behind it and the robe
> drooping into a wide drape below. One empty circular eye socket set into the
> front of the hood, unlit and hollow. Deep charcoal-brown `#171310`, almost
> black, with a cool grey rim-light catching the top edge of the sphere. Stylised
> low-poly game asset, bold simplified forms, heavy near-black outline. Read from
> a bird's-eye camera looking straight down; the silhouette must be a ROUNDED
> MASS WITH ONE POINTED COWL — recognisable at 30px and unambiguous about which
> way it is facing. Single isolated object. No face, no eyes, no limbs, no
> weapon, no base, no ground plane, no scene, no text.

### G2 · Elite — `#1e111b`, crown `#ff7ab8`

> The same hooded sentinel from directly overhead, but crowned: a spiked regal
> band of five points sits across the front of the cowl, three of its tips set
> with rose-pink gems `#ff7ab8`. Body in dark plum-black `#1e111b`, robe deeper
> and more ornate than a common watchman's, cool grey rim-light on the top edge.
> One empty circular eye socket, unlit and hollow. Stylised low-poly game asset,
> bold simplified forms, heavy near-black outline. The silhouette must be the
> WATCHMAN PLUS A SPIKED CROWN — the crown is the only thing that distinguishes
> them at 30px, so its points must break the outline clearly. Single isolated
> object. No face, no limbs, no weapon, no base, no ground plane, no text.

### G3 · Hunter — `#131019`, horns near-black

> A heavier brute of the same family, seen from directly overhead: a broader
> near-black sphere in cold blue-black `#131019`, and two thick curved horns
> sweeping up and outward from the front of the skull, tapering to points.
> Armoured rather than robed — plated segments instead of cloth. One empty
> circular eye socket, unlit and hollow. Cool grey rim-light on the top edge.
> Stylised low-poly game asset, bold simplified forms, heavy near-black outline.
> The silhouette must be a MASS WITH TWO CURVED HORNS, visibly bigger and meaner
> than a hooded watchman at a glance. Single isolated object. No face, no limbs,
> no weapon, no base, no ground plane, no text.

### G4 · Watchdog — `#161210`

> A lean hound seen from directly overhead, stretched nose-to-tail: a low
> elongated body in near-black `#161210`, a wedge-shaped snout pushing forward
> past the shoulders, two sharp swept-back ears, the whole thing built long and
> narrow rather than round. One empty circular eye socket at the head end, unlit
> and hollow. Cool grey rim-light along the spine. Stylised low-poly game asset,
> bold simplified forms, heavy near-black outline. The silhouette must be
> UNMISTAKABLY AN ANIMAL and clearly LONGER THAN IT IS WIDE — the one guard that
> is not a rounded mass. Single isolated object. No collar, no legs needed, no
> base, no ground plane, no text.

---

## The Threshold Offering

Three pedestals at every vault door; take one gift. Today each is a `14 × 10`
brown block with a coloured **dot** floating 9 units above it, and the player has
to read a serif nameplate to know what any of them do.

**That is the real problem, not the fidelity.** Six perks, six coloured circles.
Give each trinket a shape that *means* its gift and the choice becomes glanceable
— the same move the Den and One More Thing already made.

Two files plus six: one plinth, six trinkets. They are drawn separately with
their own offsets (plinth at `+3`, trinket at `-9`), so each is baked in its own
frame — no shared-frame trick needed.

| file | units | notes |
|---|---|---|
| `door_plinth` | 14 | one block, shared by all three pedestals |
| `perk_fleet` | 9 | `#8fe39a` · Fleet Night · +10% move speed |
| `perk_soft` | 9 | `#8fc7e3` · Soft Boots · haul 35% quieter |
| `perk_eye` | 9 | `#f5c542` · Greedy Eye · buyers pay +8% |
| `perk_heart` | 9 | `#e0503f` · Thick Skin · +1 heart |
| `perk_calm` | 9 | `#c9b37a` · Cold Blood · start one Heat tier calmer |
| `perk_feather` | 9 | `#c86bff` · Feather Step · ledge drops silent |

### P0 · The plinth — `#241d12`

> A small squat offering pedestal seen from a low three-quarter angle: a plain
> dark stone block, wider than it is tall, with a shallow bevelled top and a
> single carved groove running around its waist. Cold brown-black `#241d12`,
> unlit and unglamorous — it is a stand, not a treasure. Stylised low-poly game
> asset, bold simplified forms, heavy near-black outline. Nothing on top; the
> surface is bare. Single isolated object. No offering, no glow, no ground plane,
> no scene, no text.

Each trinket below floats above that block. All six share one instruction, which
is why they are written short:

> …seen from a low three-quarter angle. Stylised low-poly game asset, bold
> simplified forms, heavy near-black outline, one dominant colour, no detail that
> dies below 20px. It floats — no stand, no base, no shadow, no glow. Single
> isolated object on transparent, no scene, no text.

- **P1 · Fleet Night** `#8fe39a` — a single winged anklet: a slim green-jade band
  with one small feathered wing swept back from it. Speed, worn light.
- **P2 · Soft Boots** `#8fc7e3` — one soft suede ankle boot, slouched and
  unlaced, pale blue-grey, with a visibly thick padded sole. Quiet, not fast.
- **P3 · Greedy Eye** `#f5c542` — a gold coin struck with an open eye where a
  face would be, tilted to catch the light. Money that looks back.
- **P4 · Thick Skin** `#e0503f` — a small deep-red heart charm bound in dark iron
  bands, like something armoured rather than something soft.
- **P5 · Cold Blood** `#c9b37a` — a stoppered glass phial of pale amber liquid,
  frost creeping up its outside. Calm you can drink.
- **P6 · Feather Step** `#c86bff` — a single long violet feather, curved, its
  quill wrapped in dark thread. Weightlessness.

---

## Bake settings

Guards use a **different camera from the loot** and that is deliberate: they are
rotated by the engine, so they must be shot from overhead or the rotation reads
as a figurine spinning on a table.

```bash
# guards — near bird's-eye
node tools/loot-bake/bake.mjs <dir> Watchman.obj /tmp/raw.png 80 0 amb=0.24 key=0.95 rim=0.5 shine=8
python3 tools/loot-bake/post.py /tmp/raw.png web/assets/loot/guard_watchman.png --units 34 --outline 2

# plinth and trinkets — the loot camera, they never rotate
node tools/loot-bake/bake.mjs <dir> Plinth.obj /tmp/raw.png 35 0
```

Lighting is otherwise the loot rig. Judge the four guards as greyscale
silhouettes at 30px before any detail pass: cowl, crown, horns, hound. If those
four are not instantly separable, nothing else matters.

## Wiring

Guards need one addition the loot layer does not have: `drawGuard` must
`ctx.rotate(g.face)` around the sprite, then draw the eye glow on top **unrotated
in colour but rotated in position** — i.e. keep the existing `inkOrb` eye maths
and only replace the body/hood/cloak fill beneath it. Everything else — vision
cone, markers, shadow, stun — stays exactly as it is.
