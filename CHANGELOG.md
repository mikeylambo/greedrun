# Changelog

## Web build — ONE THUMB AGAIN: the decompression pass (build 2026-08-17.25)

.24 found Jo's identity and then showed the player too much of the design
document. This build hides the machinery again. **Greedrun is deeper than it
looks, not deeper-looking than it plays** — that is now a hard rule in
`docs/RELEASE_PLAN.md`, along with the rest of the doctrine below.

- **Heist Profiles are gone, root and branch.** The names, the pre-run INTEL
  card, the Tact, the pause row, the telemetry field, the generation weightings
  and the RNG draw. A vault is now simply what it contains, and you read it with
  your eyes instead of a briefing. The economy audit comes back **byte-identical
  to the pre-.24 baseline**, which is the proof the removal is clean.
- **The Tact codex is gone.** A Tact is a *moment*: it appears the first time a
  thing happens, says the one thing worth knowing, and leaves. No archive, no
  review screen, no collectible quotes — an archive creates pressure to write
  archive-worthy lines, which is exactly how prose crept back in.
- **Every Tact rewritten to a seven-word budget**, and the budget is now
  enforced by the test suite rather than remembered:
  *"They're adjusting to me. Expect a tighter watch."* → **"They're tightening
  the watch."** · *"Break the line. They lose what they can't see."* →
  **"Break sight."** · *"Banded, not sealed. It opens loud — so pick the
  moment."* → **"Opens loud. Pick the moment."** The ones that were already
  right stayed: *"They tire. I don't have to."*, *"It wants weight. Fine."*
- **THE FIRST JOB — an authored, skippable tutorial.** Run one is no longer
  procedural. It is a hand-placed floor that teaches by *layout*: three free
  coins in the entry hall so TAKE lands with no risk attached, a doorway, two
  gems past it, and one heavy idol in the guard's half so you FEEL the load
  before anything explains it. Four beats — TAKE, WATCH, LOAD, LEAVE — each
  fired by what the player just did, never by a timer. One guard, one readable
  loop, no hazards, no modifier, no Assessor, no rival, no Vault Heart (so One
  More Thing never fires with nothing to reveal). **Skip is one tap**, always
  visible, and drops you straight into a real vault. Sized so it never
  letterboxes on a portrait phone.
- **How to Play is back** — as a *voluntary reference*, on the title and pause
  screens, never in the path to playing. Two pages, one sentence a row, and the
  vocabulary is current (it no longer describes "the Workbench" selling "smoke,
  decoy, grapple").
- **Commission cards are four lines**: client, objective, location (plus the one
  condition that isn't already obvious), fee. Gone: the location lore paragraph,
  the client's quotation, and the sentence restating the objective. A card now
  reads in about two seconds — *"SPECULATOR / Escape at Heat 4+ / The Sunken
  Treasury / $2,174"* where .24 spent six layers of copy on the same choice.
  Objectives are imperatives (`Take $1,300`, `Clear the floor`, `Return a marked
  item`), and clients dropped their articles (POWER BROKER, CUSTODIANS).
- **The vocabulary is rationed.** Five branded terms carry the game — GREED,
  HEAT, TACT, MIRAGE TOOLKIT, OPERATION. Jo's names go on things you *choose
  between*; plain language describes what things *do*. The pause screen is back
  to "Move speed" and "Footsteps" instead of "Strider · pace" and "Mirage
  Cloak" — once you're looking at a number, the number just says what it is.
- **Toolkit subcopy to one phrase each**: *Vanish from pursuit. Your haul goes
  quiet.* · *A double they go and look at.* · *Pull the nearest valuable to your
  hand.* · *Open a sealed route.* · *Mark a spot. Return to it.*
- The four locations' fiction moved off the commission card and into the Trophy
  Room's territory list, where lore is voluntary.
- `tests/web_mastermind_test.mjs` rewritten: profile coverage removed, and it
  now **fails the build if any Tact, Toolkit line or commission objective goes
  over seven words**, if the codex returns, if a commission card grows a fifth
  line, if discipline names creep back onto the pause screen, or if the authored
  first job stops being authored, skippable or phone-sized.

## Web build — JO IS THE MASTERMIND: Tact, the Mirage Toolkit, disciplines, commissions & Heist Profiles (build 2026-08-16.24)

An identity pass, not a systems pass. Greedrun was already content-complete and
the loop was already good — but it still read as *a thief getting better*. Jo
finished that arc before this game starts. He is who powerful people call when
obtaining something is the problem. The Operation grows; Jo does not rank up.
Nothing here redesigns art, and the economy was deliberately left alone (the
audit moves 1–4%, entirely from seed reshuffling; every sink is byte-identical).

- **TACT replaces the manual.** The two-page How to Play reference is gone. The
  first run teaches exactly three verbs — **MOVE / TAKE / LEAVE** — and nothing
  else. Everything after that arrives as a **Tact**: a short read in Jo's own
  voice, fired once, the first time a situation actually happens.
  *TACT — LOAD · "Heavy haul. Loud feet. Drop what isn't worth carrying."*
  *TACT — ASSESSOR · "He's not chasing me. He's counting."*
  24 entries cover load, Heat, the Assessor, the Weighted Gate, water, wind, the
  dark, the presses, shutters, strongboxes, stashes, the chute, the tunnel, the
  breach, the second sheath, the rival and more. Every read is reviewable from
  pause or the title under **Tact** — optional, never forced into the flow.
  Old saves keep their state: a teaching moment already seen never fires again.
- **THE MIRAGE TOOLKIT.** The Workbench is now Jo's kit, and the pieces have his
  names, with the plain mechanical line underneath where the name used to have
  to do the explaining: **Shadow Step** (break pursuit and vanish), **Illusion**
  (a glittering double guards go and look at), **Strider's Line** (reel the
  nearest valuable to your hand), **Subversion Kit** (turn a sealed shutter back
  open), **Mirage Gate** (plant a marker, return to it from anywhere). Same five
  ids on disk — every owned tool survives the rename.
- **Progression is four Mastermind disciplines**, not a flat list of stat buys.
  The same ten upgrades and the same five capstone effects, reorganized into
  **STRIDER** (movement, load, traversal, landing → *The Long Walk*),
  **MIRAGE CLOAK** (concealment, silence, exposure → *Cold Trail*),
  **SUBTERFUGE** (setup and contingency → *The Grand Scheme*) and
  **CALCULATE** (information advantage → *Appraiser's Eye*), with the Toolkit as
  its own axis (*Sleight of Hand*). Each header states the method, how deep it
  runs, and what waits at the end of it. No power added, none removed.
- **Jobs are COMMISSIONS.** The board is clients who bring impossible acquisition
  problems: a Power Broker, a Political Operator, a Collector of Unusual
  Importance, the Custodians, an Institution, a Private House, a Speculator, a
  Rival Operator, and a party that does not give its name. Each card carries five
  facts and one line of the client's voice — **CLIENT / Acquire: TARGET /
  LOCATION / CONDITION / Fee** — and named work names a real piece (the Meridian
  Key, the Last Die, the Lightless Crown, the Windward Key…). No paragraphs
  before you have even chosen.
- **HEIST PROFILES: procgen rolls situations, not only rooms.** Every seed now
  opens with an operational setup, built purely by weighting systems the game
  already had: **Accounted House** (the Assessor starts early and writes fast),
  **Locked House** (a shutter locked from the start, and they close faster),
  **Flooded Route** (standing water wherever the job is), **Rival Claim**,
  **Hot Vault** (two Heat tiers before you touch anything — and danger pays),
  **Deep Storage** (thin floors, extra strongboxes, a stash and a gated cache),
  **Clean Commission** (one standout piece, less around it worth the weight),
  and the plain Working House. The roll is the FIRST draw of the vault stream and
  depends on the seed alone, so a shared code is the same job for everybody at
  any standing. Read as **INTEL** at the start of the run; owning **Treasure
  Sense** turns the read into the stated mechanical fact — Calculate finally
  buys information instead of a marker.
- **The Generous Gift.** At the fence, one piece per haul — the one whose value
  you can actually feel — can be given away instead of sold. It pays no gold. It
  pays **twice its appraisal in Operation reach**, quiets the talk by a
  notoriety, and makes you good with every client you left waiting. Not an
  alignment meter, no `GOOD +10`: an option a Mastermind has because he settled
  this question a long time ago. Reach counts toward territory exactly like
  banked gold — no new currency.
- **The four addresses have reasons to exist.** The Old Mint is a financial
  machine that never fully stopped — dies, reserves, sealed assets, state proofs.
  The Undercity Vaults are hidden infrastructure. The Cliffside Fortress holds
  what justifies a garrison. The Sunken Treasury was cut off long enough that
  exceptional things survived inside it. Every commission card says so.
- **The HUD says less at once.** Four things persist — **health, haul, load,
  Heat**. Noise appears when it is actually costing you (a clinking bag, or eyes
  already turning). The objective announces the job and then stands down; live
  progress lives on the pause screen, on request. The secured count speaks when
  it changes. The Assessor rides the Heat label while he is working, with no new
  chrome. Keyboard hints retire after the fourth job. Nothing was shrunk to fit.
- **Title screen**: A JO STORY / GREEDRUN / HOW MUCH CAN YOU TAKE? / **Play**.
  The explanatory paragraph is gone — the game teaches its own premise now.
- **Terminology sweep**: the street-legend epithets became how the trade refers
  to him (*THE QUIET HAND*, *NOTHING LEFT*, *THE IMPOSSIBLE ONE*, *THE FULL
  MEASURE*, *IN AND OUT*), migrated in place so no earned standing is lost. The
  Thieves' Altar is the Threshold Offering, the rival is a Rival Operator, the
  den grows from a borrowed room to the whole board rather than alley to kingpin,
  and the Thief's Ledger is the Operation Ledger.
- **Saves are preserved.** Nothing was renamed on disk: upgrade ids, tool ids,
  collection ids and seen-Tact keys are untouched, reputation keys migrate, and
  the two new fields default cleanly on an old save.
- New suite `tests/web_mastermind_test.mjs` (`npm run test:mastermind`) covers
  the title, the Tact system, the Toolkit vocabulary, the discipline
  reorganization, the commission card's five facts, profile determinism *and*
  that each profile bends the system it claims to, the Gift's economics, the
  contextual HUD, and a full pre-pass save surviving every rename.

## Web build — THE ECONOMY PASS + phone density (build 2026-08-15.23)

The 24-run report showed the real problem: hauls of $2,230-$5,170 banking
$7,000 / $19,677 / $13,907 / $50,434 / $46,646. Every bonus multiplied
every other bonus, so a maxed build turned a $5k haul into $50k and no
sink could ever keep up.

- **The fence has a ceiling now.** Gear x collection x den x mastery x
  danger x perfect heist x ascension x operation fees used to compound
  without limit. The first 2x still rides free and every bonus still
  counts — more is always strictly better — but the stack now bends
  toward a 5x asymptote instead of running to 20x and beyond. Danger and
  skill stay the story instead of the spreadsheet.
- **The fence says so out loud**: when the stack is being bent, a chip
  reads "Fence ceiling — x4.6 of x12.3, the trade only pays so much". No
  hidden math.
- **One payout formula, three call sites.** The multiplier chain was
  duplicated in the bank, the fence preview, and the bulk-only path — a
  standing invitation for them to drift apart. They now share
  `payoutOuter()`.
- **Gear costs rebased** (x2 -> x2.15 per level) against the corrected
  income curve, so the tree outlasts the first 25 jobs.
- **Phone density pass** (playtest: "it gets crowded on phone"). Every
  screen has gained rows since launch — the Operation line, the ledger,
  the fence ceiling, the Assessor tally. On coarse-pointer screens the
  chrome tightens — stat cells, buyer chips, ledger rows, fence cards,
  legends — so nothing has to be hidden. The Den still measures to a
  single screen.

## Web build — duplicate trophies count, deeper collection ladder (build 2026-08-15.22)

- **FIXED: a second trophy of the same kind vanished.** The "Keep it"
  option was offered whenever you owned none of that trophy — decided
  when the fence screen built — so two Bound Relics in one haul both
  showed it, the first claimed Fortune's Cache, and the second silently
  did nothing (playtest: "picked up 2 Fortune's Cache and the hideout
  only reflected one"). Duplicates now **restore the trophy a level for
  free**, and the chip says so ("restores it to Lv2 — +8% on all gold,
  free").
- **Trophies go to Lv8 instead of Lv5.** Restores cost x1.8 per level, so
  the last few run $10k-$35k each — roughly a quarter-million of new
  sink across the collection, for a player who had nothing left to buy
  by run 24.

## Web build — the long tail + identity polish · CONTENT COMPLETE (build 2026-08-15.21)

The last two content drops, together. Everything the roadmap scoped is in.

**The long tail (.20)**

- **The second sheath.** Find a tool while your belt still has charges and
  it no longer overwrites what you're holding — it rides as **backup** and
  takes over by itself the moment your active tool runs dry. Tool order
  becomes something you plan, and it cost exactly zero new buttons: the
  one-finger rule holds.
- **Museum sets.** A collection is worth more than its pieces. Two
  trophies is *A Beginning* (+3% on all gold), three *A Proper Cabinet*
  (+7%), four *A Private Museum* (+12%), all five *The Whole Story*
  (+20%) — a real reason to keep a piece instead of fencing it, and the
  Trophy Room shows the next set and what it pays.
- **Jo's room earns its furniture.** The hideout scene now fills in with
  what you've actually *done*: a map wall marked with each finale you've
  taken, the Hunter's notice nailed up once your feud starts, banners for
  the names you've earned, a plaque when the collection is complete, and
  a mark for reaching the top of the ladder. Nothing here is for sale.
- **The Long Night.** Past Ascension 10 the ladder keeps climbing — every
  twist live, the Hunter waiting inside from the first second, and the
  pay curve rising forever. A finished player always has a next number.

**Identity polish (.21)**

- **Terminology sweep**: the street-era language is gone — "the street
  remembers" is now "word travels", "the street calls you" is "they call
  you", notoriety reads as talk in the trade. The Operation is past the
  streets.
- **The game has a theme now.** A four-note figure — a minor-seventh
  climb, the greed motif — plays over the ambient bed, transposed into
  its own key per location (the Mint, the Undercity, the Fortress, the
  Treasury each sound different), thickening with an octave voice at
  Heat T2 and a low saw at T4. Still zero audio assets: the same
  oscillators, finally playing a tune.
- Title drops the "Vertical Slice" tag and reads **A Jo Story**.

## Web build — the Weighted Gate, per-location finales, Assessor unstick (build 2026-08-15.19)

- **FIXED: the Assessor could wedge on a corner.** He walks to a fixed
  plinth, so unlike a waypoint guard he had no way to give up on a bad
  approach. He now detects the wedge, slides along the wall to get
  around it, and if the corner really has him, drops that plinth from
  tonight's rounds and moves to the next one. His rounds never deadlock.
- **The Weighted Gate — the first puzzle chamber.** Some vaults hold a
  barred cache with a pressure plate outside it. The plate wants weight,
  and your bag is full of weight: **drop a heavy piece on it**, walk in,
  take the cache, walk out, pick your piece back up. It costs you time
  and leaves your best item lying on the floor while you're inside —
  greed paying its own toll, using the DROP verb you already have and
  not one new button. It never shuts on you while you're inside, and
  it's built as its own four walls so vault connectivity is untouched.
  Opens once the Operation is past its first standing.
- **Every location's Legendary Heist is now its own finale**: *The Last
  Die* (the Old Mint), *The Lightless Crown* (the Undercity Vaults),
  *The Windward Vault* (the Cliffside Fortress), *The Drowned Ledger*
  (the Sunken Treasury) — each announced with its own line as the job
  begins.
- **The Chief Assessor.** When the exit bolts in a finale's third stage,
  the Assessor stops touring and opens his book in earnest — he writes
  nearly twice as fast, and every entry is a Heat tier you have to carry
  to a sealed door. The finale is a race against his pen.
- **Finales grow the Operation on their own.** Taking a location's finale
  is worth a standing by itself, so there are now two roads up: bank the
  money, or take the job nobody else will. The Trophy Room lists all four
  and marks the ones you've taken.
- Chests now prefer enclosed spots — deep rooms and guarded corners
  instead of open floor.

## Web build — THE ASSESSOR + mission identities + modifiers that finally fire (build 2026-08-15.18)

- **The Assessor.** The vault's own bookkeeper walks his rounds by
  lamplight with a ledger. He never chases you and never lays a hand on
  you — he walks to the plinths you emptied, inspects them, and **writes
  them down**. Each entry adds a Heat tier (max 3), so a greedy night
  tightens the whole building around you. He arrives 16s into the run,
  moves deliberately (you can always outpace him), and his lantern pool
  makes his next stop readable across a dark room. Pure routing
  counterplay, zero cheap losses — and the first threat that punishes
  greed *structurally* rather than by chasing it.
- **Timed Raids rotate the watch.** Every 26 seconds the guards abandon
  their posts for new ones — the floor you scouted on the way in is not
  the floor on the way out. Nobody drops a live chase to rotate.
- **A perfect Silent Job pays a relic.** Never seen, never touched, never
  heard, and the client parts with **The Quiet Commission** off their own
  shelf — a fenceable piece that scales with the Operation, on top of the
  fee.
- **Modifiers exist again.** Every telemetry report came back 19/19
  "clean" because contracts dominate play and never rolled a twist — the
  system may as well not have shipped. Contracts now roll modifiers at
  about half the free-run rate. The Legendary Heist stays clean; its
  three stages are its twist.
- The Assessor's tally shows on the pause screen; How to Play gains a
  row for him.

## Web build — THE OPERATION (build 2026-08-15.17)

Jo is already the Mastermind — nothing here ranks him up. What grows is
the **job**. Gated on career gold banked, the operation's own ledger:

- **Territory opens as the Operation grows.** Five standings, each opening
  a location and widening the vaults:
  *A Quiet Arrangement* (the Old Mint alone) → *The Standing Crew*
  ($8k — the Undercity Vaults) → *The Wide Net* ($30k — the Cliffside
  Fortress) → *The Long Reach* ($80k — the Sunken Treasury) → *The Grand
  Design* ($200k — every door, the biggest jobs). Vaults grow up to 26%
  wider and client fees up to +80% along the way. Growth is announced in
  the hideout like an unlock.
- **The Trophy Room leads with The Operation**: current standing, vault
  reach, client fees, the full territory list (locked entries show their
  price), and any unfinished business — with the Thief's Ledger below it.
  The Den carries a live standing line with a progress bar to the next.
- **Walking out on a client costs you.** Fail a contract and that client's
  work pays **−20% until you finish one of theirs**. The jobs board marks
  it ("you left them hanging"), the results screen names it, and making
  good is called out when you do. This is greed's lasting price alongside
  the haul you drop — no lecture, just a ledger.
- Contract failure now reads "unfinished" rather than "failed", in
  keeping with the game's language.
- **Fixed a latent generation bug**: a solid prop (crate/barrel/urn/pillar
  base) could be placed inside a doorway gap — `isOpen` sees open space,
  not a passage — walling off a room behind it. Solids now keep clear of
  every doorway. The Operation's territory gating surfaced it by pinning
  test seeds to one location.

Fair play holds: dailies and shared vault codes always build at full
reach, so the same code is the same vault for everyone, and the seeded
RNG stream is byte-identical at every tier.

## Web build — the ghost-loot fix + the 19-session notes round (build 2026-08-15.16)

- **FIXED: "everything I picked up dropped and respawned on the path."**
  It was the Drop Chute. A mid-fight dwell dumped the bag; stashed items
  kept their original coordinates, and the draw/pickup/rival/grapple
  loops never learned to skip them — so the whole haul re-rendered at its
  spawn points and could be picked up again for double credit. Every
  loot filter now excludes stashed goods, and a regression test dumps,
  re-dwells, and proves no second credit.
- **No more freebie contracts.** Silent Job, Timed Raid, and Ghost Job
  now demand a real haul, scaled to your recent averages: "Extract
  unseen carrying at least $700", "collapse in 96s — out in time with at
  least $1,100", "no hits — and don't come back light." The pause screen
  tracks both halves ("clean · $400 of $700").
- **Buyers anchored in dollars**: every fence chip now reads against the
  Black Market — "+$348 over the market · takes one piece a visit",
  "$276 under the market · the honest road" — so the choice is a number,
  not a vibe.
- **Found-tool crates are a choice, not an ambush**: stand 0.6s to swap
  (progress arc, "stand to swap for Decoy ×2" label); walking past costs
  nothing.
- **Artifact pool more than doubled**: heirlooms, blades, maps, seals —
  the Widow's Heirloom, Blade of the Last Auction, the Cartographer's
  Regret, the Choir of Coins, the Locksmith's Confession, the Sleeping
  Signet, the Glutton's Chalice.
- Copy: Reinforced Straps ("EVERY piece slows you a little less") vs
  Deep Pockets ("a speed you NEVER drop below") finally read as
  different upgrades.
- Landscape phones: notch-side safe-area padding on the HUD and overlays.
- Release plan absorbs the PDF's design directions: Jo's canonical rank
  arc (Thief → Strider → Mastermind) drives Phase B next build; mission-
  type identities + puzzle chambers land in Phase C; "The Almshouse"
  (give gold away — the greed lesson made mechanical) proposed for
  greenlight.

## Web build — the stuck-on-platform fix + playtest notes (build 2026-08-15.15)

- **FIXED: bumped onto a platform and stuck (twice-reported).** Three
  direct position writes bypassed the climb logic: the guard body-shove,
  the hit knockback, and the wall-unstick spiral could all move Jo onto a
  platform footprint while his state said "ground" — after which every
  move was blocked. All forced moves now go through an elevation-safe
  path (a shove can never push you up or through a ledge; a cornered
  guard gives ground instead), and `unstick` self-heals: if Jo ever ends
  up in a broken elevation state it adopts the correct level instead of
  leaving him stranded. A regression test corrupts the state exactly like
  the report and proves both the heal and the refusal.
- **Water slows everyone properly**: guards wade at 0.7× (slower than
  Jo's 0.75 — flooded rooms are now a genuine escape route), and the
  rival wades at 0.75× in both his looting and fleeing.
- Copy: the greed meter reads Light / Loaded / Heavy / **Super Heavy**
  (was "Backbreaking").
- **Notoriety on the Gear screen**: the Syndicate's ledger now reads
  where you spend — "Notoriety 4/10 · jobs start at Heat T2 · the Hunter
  enters at T3 — 'Return it' at the fence cools it."
- **Sound settings on the menu**: separate Sound FX and Music toggles,
  persisted, alongside the existing mute (M).
- OST noted for the release wrapper phase (R4): the procedural bed gets
  a proper motif pass, or a licensed track — user call.

## Web build — Phase A: the depth re-pace (build 2026-08-15.14)

The 18-run report proved the diagnosis: a skilled player maxes everything
in 1–2 hours, and a maxed build banks 4–5× its haul at permanent T6. The
content existed — the pacing spent it in an afternoon. Phase A restructures
the arc without adding content:

- **The unlock ladder now runs to ~24 jobs, and the vault's secrets are
  the rungs.** Fresh saves start with bare vaults; systems arrive as
  announced discoveries: Fence (1), Jobs Board (2), Modifiers (4), Trophy
  Room (6), Workbench (8), **Strongboxes (10), the Drop Chute (12), Daily
  (14), the Thieves' Altar (16), the Breach (18), Hidden Stashes (20),
  the Old Tunnel (22), Locked Shutters (24)** — each with its own gold
  banner and a "next unlock" teaser. Existing saves with 24+ runs see
  everything immediately.
- **Shared vaults play fair**: ranked dailies and shared/practice codes
  force every feature on regardless of unlock state, so the same code
  builds the same vault for everyone.
- **Upgrade levels now cost double per level** (was ×1.55). Level-1
  prices are untouched — the first hour still showers you with upgrades —
  but maxing the tree is now a 6–8 hour arc instead of 2.
- **Trophy restores cost ×1.8 per level** (was ×1.5) — the Collection is
  the long-tail gold sink.
- **Heat re-centered again (900 → 1050 value/tier)**: chest and stash
  loot re-inflated vault totals (runs hit 36→45 pieces), pinning greedy
  runs at T6 and flattening danger pay. T6 is a push again, not a default.
- Region suite: fresh saves verifiably start bare (no gated secret
  spawns), veterans get everything, and the altar/chest/chute/tunnel/
  lock tests all run as a full veteran.

## Web build — flooded rooms, the Old Tunnel, locked shutters + the brass key (build 2026-08-15.13)

Level-design depth, slice 3 — the last of the queued procgen ideas:

- **Fully flooded rooms.** In room-grid Treasury and Undercity vaults, one
  or two whole rooms now sit under water — room-scale, not puddles.
  Crossing is slow (0.75× wade) but your clinking drowns (noise ×0.45),
  so a flooded room is both a moat and a stealth route. Guards wade
  slowly too.
- **The Old Tunnel.** ~60% of vaults keep a plank trapdoor deep inside.
  Dwell on it and you drop — spat out next to the entrance, LOUD (nearby
  guards come to the landing), and the tunnel collapses behind you. One
  use. The return trip is the dangerous half of every heist; this is the
  found shortcut through it, priced in noise.
- **Locked shutters + the brass key.** ~70% of room-grid vaults start with
  one loop-door shortcut locked behind a brass padlock (gold-lit plug, a
  padlock at its center). A brass key glints somewhere on the floor —
  pocket it, touch the door, it turns once and the shortcut grinds open.
  A Lockpick charge also cracks it. Loop-only, so nothing is ever walled
  off; guards path around it like any sealed door.
- Sounds: the hatch slam-slide-thud of the tunnel, the key's jingle and
  the lock's turn. Pause screen tracks the key and the unused tunnel.
- Region suite: flooded rooms are room-scale, the tunnel teleports and
  collapses, locks close at gen / open by key, and the doorway-passable
  check now proves a locked door is always a loop door (never
  disconnecting).

## Web build — the Breach, the Drop Chute, a named Hunter, the Ledger, the Altar (build 2026-08-15.12)

All six greenlit "premier" ideas in one drop:

- **The Breach.** Every vault carries a cracked seam in its east wall
  (hairline cracks foreshadow it; at Heat T3 they glow). At T4+ the wall
  gives way — a second exit, no "one more thing" temptation attached, with
  its own green compass arrow. Danger literally opens doors.
- **The Drop Chute.** One brass-rimmed grate per vault, mid-depth. Dwell
  on it and your bag goes down the hole at 70 cents on the dollar —
  banked THE MOMENT it drops, kept even if you die or abandon. It also
  sheds weight, noise, and Heat: greed's pressure valve. The Vault Heart
  won't fit — legends travel by hand.
- **The Hunter has a name.** Rolled once per save (Vex, Marrow, Silas
  Grey, The Magpie…), announced when he enters, credited when he ends
  you — "Marrow — the Bounty Hunter — ended the run. That's 3 now." The
  feud is tracked for life.
- **The Thief's Ledger.** The Trophy Room is Jo's own room now: below the
  trophies sits a ledger page with career numbers (jobs, escape rate,
  career banked, best haul), every epithet the street has given you (dim
  until earned, with its perk tag), the nemesis feud line, and how the
  bad nights ended. Career stats migrate once from the existing run log.
- **The Thieves' Altar.** Once the Jobs Board is open, three glowing
  gifts wait on pedestals at the vault door — take ONE, run-scoped: Fleet
  Night (+10% speed), Soft Boots (35% quieter), Greedy Eye (+8% at the
  fence), Thick Skin (+1 heart), Cold Blood (−1 starting Heat), Feather
  Step (silent drops). Names always visible; effects readable up close.
  Diegetic, not a menu — walk up and choose with tonight's route in mind.
- **Secrets sound like themselves.** Chest lids creak while Jo works them
  and crack open in wood + coin-shimmer; stashes tick a proximity
  heartbeat before your eyes find them and chime crystalline when pried;
  the chute swallows with a coin-cascade; the breach is masonry giving
  way; the altar hums a chord.
- Pause screen tracks it all: chute money banked, altar gift, breach
  status ("cracks at Heat T4 — now T2"). Telemetry gains a chute line.

## Web build — level-design depth: strongboxes, stashes, found tools, ascension twists, living rival (build 2026-08-15.11)

The "premier game" drop — the first slice of the R2.5 backlog.

- **Strongboxes.** Every vault hides 1–2 banded chests deep inside. Stand
  close and Jo works the lid (progress arc); when it gives, the CRACK
  carries — loot spills out, the nearest guard comes to look. Contents
  count toward Clean Sweep, so a real sweep cracks every box.
- **Hidden stashes.** ~60% of vaults keep a secret: invisible until you're
  near, then a shimmer of glints in the floor. Walk it to pry it out —
  silently. Sweeps just got more interesting.
- **Found tools.** Half of vaults hold a lost thief's crate. Walking over
  it swaps your kit for tonight only — fresh charges, works even if you
  don't own the tool, your equipped tool comes back next run. First taste
  of every tool in the shop, free.
- **Ascension twists.** Every ascension level now adds a named, cumulative
  mechanic on top of the number scaling: A1 The Second Hound (another
  watchdog), A2 Bright Eyes (faster, farther sentries), A3 The Rival's
  Hour (rival every night, quicker), A4 The Curfew Bell (150s collapse on
  free runs), A5 Light Sleeper (vault remembers at T5), A6 Doubled Watch,
  A7 The Kennel, A8 Sharper Steel (pursuers tire slower), A9 Sealed Night
  (double escape hold), A10 The Vault's Own (Hunter from the start). The
  ascension picker names each twist and what it carries. Response to the
  playtest verdict that post-max play "felt kind of worthless".
- **The rival is alive.** Guards that spot him give chase (you are always
  the better prize — sighting you takes priority). He drops his job and
  runs; if the watch collars him, he's dragged off for the night and
  everything he stole hits the floor as one sack you can reclaim. Bait
  the watch into him and his haul becomes yours.
- How to Play gains a Secrets row; telemetry reports found tools.

## Web build — escapable chases, findable Heart, eventful rival (build 2026-08-15.10)

- **You can finally shake a chase.** Two changes, one promise kept:
  detection now requires actual line of sight (the game always taught
  "break line of sight and they'll lose the trail" — but detection was
  pure distance, so walls did nothing), and pursuers have lungs — a chase
  that can't catch you gives up winded (watchdog after 4.5s, guards 8s,
  the Hunter 12s; winded = 3s at 3/4 speed, can't re-acquire). A landed
  grab resets the clock. The watchdog's wall-piercing hearing is
  unchanged — that's its identity. Telemetry drove this: watchdog was 3
  of 6 deaths and chases were reported as feeling impossible to escape.
- **Treasure Sense keeps its promise.** The Vault Heart spawns in the
  deepest room of every vault, and "revealed" only meant not-invisible —
  a maxed player had literally never seen it. The upgrade now draws a
  gold arrow on the offscreen-threat compass pointing to the Heart, with
  a one-time tip saying so.
- **The rival became an event.** He now works ~55% of nights (seeded per
  vault — dailies and shared codes reproduce) and his presence is
  announced at the door: "A rival thief works this vault tonight — beat
  him to the goods." Constant presence had made him read as furniture.
- Region test now asserts the rival gate: present on some seeds, absent
  on others, deterministic per seed.

Telemetry verified from the 12-run build-.9 report: adaptive quotas hit
50% success (target 40–60%), smoke went from unused to ~1 use/run, escape
rate back to a healthy 50%.

## Web build — R1 meaning sweep + playtest fixes (build 2026-08-15.9)

Playtest-report fixes:

- **Camera no longer jerks on direction changes at speed**: the look-ahead
  offset used to snap ~300px across the moment you reversed, and the camera
  chased it. The lead vector is now eased through zero on its own (capped at
  130px), so flips glide instead of yanking.
- **Smoke Bomb actually works point-blank**: guards re-spotted you the frame
  after the smoke burst because detection is distance-based. Smoke now
  blinds every guard and sentry for its full 3 seconds, blinded guards
  can't land a grab, and the cloud trails you so the window is visible.
  Toast says what you get: "no one can see you. 3 seconds. GO."
- **Enemies are solid**: you can no longer phase through a guard on your
  level (post-hit invulnerability used to let you walk straight through,
  which read as "no collision"). Bodies now push apart; a cornered guard
  gives ground.
- **The fence total is the haul growing, not a new number**: the header now
  reads "Your $2,657 haul — buyers pay $5,463", and a completed contract
  shows as its own line ("the client pays on delivery") so the amount that
  lands in the bank is the amount the screen promised.
- **The Noble's one-piece rule is visible before you tap**: with a piece
  already picked for him, his chip on other items dims to "his hands are
  full with your Golden Idol — tap to switch", and switching announces
  where the bumped piece went.
- Shop cards you can't afford now say "NEED $250" instead of "SAVE UP".
- When first seen with a tool on your belt, a one-time tip points at the
  TOOL button (telemetry: smoke was gifted but unused in 5 of 6 runs).

R1 meaning sweep (release plan):

- **Collection screen speaks payoff**: trophies read "+3% from every buyer —
  every run", unclaimed niches explain the claim path ("escape with a
  Golden Idol, then choose 'Keep it' at the fence"), and each restore
  button carries a "restore → next effect" line.
- **Pause screen answers "so what?"**: greed load as "% slower", Heat with
  its tier meaning ("T4 — the Hunter is out"), notoriety's consequence, and
  live contract progress in plain words ("$1,300 of $1,800 smuggled",
  "42s before the collapse", "blown — you were seen").
- **Results screen got its dopamine pass**: the money still rolls up, then
  each stat lands in a staggered cascade with a little overshoot, and the
  epithet stamps itself last.

Telemetry tune (10-run report, build .8): quota contracts flipped from 13%
to 100% success because the static $900–1,600 band fell below your grown
~$2k average haul. Quotas now track your last 10 escaped hauls
(×0.9–1.25, clamped $900–4,000), aiming at 40–60% success at any skill
level.

## Web build — decisions and results speak player + first telemetry tunes (build 2026-08-15.8)

- **Artifact decision cards state real consequences**: the greed option now
  computes the actual outcome of taking the piece — "+2,400 · ~9% slower ·
  louder · Heat +1", with "— the vault will remember" when it would push
  heat to T6 — using the live weight-penalty and heat formulas (upgrades and
  capstones included). The safe option answers it: "light and silent — the
  vault won't notice."
- **The results screen names your killer**: losses read "The Bounty Hunter
  ended the run — the vault keeps everything you were carrying" (per-cause
  names for guards, elites, watchdogs, presses, falls, the collapse), and
  the value stat flips to "Left behind $X" in heat-red. Escapes now read
  "Haul", "Danger pays · peaked T5", "Looted 7 of 12", and "The rival made
  off with $X" instead of raw counters.
- **Telemetry tunes (10-run report, build .7)**: quota contracts asked for
  $1,400–2,400 against ~$1k average hauls — contract success was 13%, so
  quotas now roll $900–1,600. And since tools went entirely unbought, the
  Workbench unlock now throws in a free Smoke Bomb, pre-equipped, so the
  tool button exists on the next run without a purchase decision.
- Added `docs/RELEASE_PLAN.md` — the roadmap from here to a 1.0 release.

## Web build — the Fence speaks player (build 2026-08-15.7)

- Every buyer chip now states its consequence in plain words: "no questions
  asked", "takes one piece a visit", "word spreads · +1 notoriety", "the
  honest road · −1 notoriety" — and reputation's "knows your name · +10%".
- **Keep it finally explains itself**: the chip shows the trophy passive's
  actual effect ("+3% from every buyer, forever — restore it later for
  more") instead of a bare passive name.
- Items got their character back: a flavor blurb per kind (artifacts keep
  their own flavor text) and an "appraised $X" so premium offers read as
  deals; the highest cash offer wears a TOP $ badge.
- The bonus math is labeled chips (Danger T3 +27% · Perfect heist +40% ·
  Safehouse +4% · Mastery · Fortune's Cache · modifier/ascension ×) instead
  of a run-on sentence, and the haul total rolls when selections change.

## Web build — desktop playtest round: fullscreen, physical props, smooth camera (build 2026-08-15.6)

- **Big-screen desktop**: the stage now grows to the viewport (up to 1560px,
  was capped at 960) and F / the new ⛶ HUD button toggles true fullscreen —
  the canvas buffer re-derives its aspect from the stage's real shape, so
  nothing stretches at any size, and render scale now covers the stage's
  actual physical pixels (crisp at 1080p/1440p/retina).
- **Props are physical**: crates, barrels, pillar bases and urns block
  movement for everyone — juke chases around them, use them as cover lanes.
  They're placed before loot/guards so pathing and the reachability
  guarantee account for them; they never block sight (low cover).
- **Camera smoothing fixed**: the lead term came from per-frame velocity
  (which shrinks at high refresh rates and jittered on uneven frames) and
  the ease was frame-rate dependent — both are now dt-normalized, so
  60/120/144Hz all glide identically. This was the "choppy camera" report.
- **Location ambience**: a per-theme sound bed — water lap in the Treasury
  (swells while wading), rampart wind in the Fortress, cave hush under the
  Undercity's drips, and the Mint's distant press machinery on a loop.
- **Card UI redesign**: upgrade and tool cards get structured rows — name
  with inline LV chip, effect line, then a divider with price left and a
  gold BUY / EQUIP pill right (SAVE UP when short). No more floating tags.

## Web build — design pass C: vault presentation (build 2026-08-15.5)

- **Per-theme floors** replace the one universal grid: broad flagstones with
  tinted slabs (Treasury), staggered stone courses (Fortress), half-bond
  cobbles (Undercity), machined tiles with brass hairlines (Mint).
- **Seeded scatter decor**, a different kit per location: pillar bases, urns,
  crates and puddles; crates, barrels and rubble with wall chains; rubble,
  fallen beams and **lit torches** (visible through the dark — a navigation
  aid); coin piles, cog inlays and barrels. Wall-mounted banners carry each
  location's accent color. Pure visuals — no collision, no gameplay.
- **A landmark per vault** — one big flat floor inlay so it never blocks
  movement: the sunken basin, the great compass rose, the boarded well
  mouth, the Mint's giant coin die.
- **Layout-family wall language**: pillar fields get column caps, corridors
  get lengthwise seams, warrens get rough patches, chambers get corner
  blocks, and room-grid doorways get visible gold jambs. Family structure
  ranges widened too (denser pillar fields, longer corridor lanes, bigger
  chambers, more cramped warrens) so the bones differ, not just the paint.
- All dressing generates off the seeded stream — dailies and shared codes
  reproduce exactly; decor determinism + per-theme kits + landmarks are
  covered in the location suite.
- Fixed the key-hints line overlapping the corner credit in-run.

## Web build — design pass A+B: onboarding & hideout architecture (build 2026-08-15.4)

- **Unlock ladder**: a fresh thief meets only move/grab/escape. Systems open
  one per job — Fence (1), Jobs Board (2), Vault Modifiers (3), Workbench
  (4), Daily (5), Trophy Room (6, or on the first kept trophy) — each
  announced with a gold banner in the hideout, with a "Next: … after N more
  jobs" teaser. Until the Board unlocks, "Begin Tonight's Job" starts a
  clean free run directly.
- **Contextual tips**: four one-time teaching toasts at the actual moment —
  first run, first heavy load (teaches Q/DROP), first Heat, first spotted.
  Persisted; never repeat.
- **Two-tab hideout**: The Den (scene, bank, actions, standing, daily —
  measured to fit one screen with zero scrolling) and Gear & Tools (the
  skill-lane and Workbench catalogs, which may scroll).
- **The Rehearsal**: practice-a-code is its own screen, reached from a
  "⌁ rehearse" chip on the daily card — code input plus replayable recent
  dailies. Unlocks with the Daily.
- Seed-stream stability: modifier rolls are always drawn (selection gated),
  so a shared vault code builds the same vault at any unlock state.
- Fixed: toasts no longer swallow taps/clicks underneath them.
- New suite `tests/web_onboarding_test.mjs` covers the fresh minimal Den,
  direct first run, tip firing, banner-once behavior, tab split, Rehearsal
  flow, and the Den fit; all six suites pass.

## Web build — playtest round 3: desktop UX (build 2026-08-15.3)

- **How to Play is now two tabbed pages** (The Basics / The Deep End), two
  columns on wide screens, measured to fit the stage with zero scrolling.
- **DROP finally taught on desktop**: a persistent key-hint line in the HUD
  (Q drop · Space tool · P pause, hidden on touch) and a "Drop" row in the
  Basics page.
- **⌂ Menu button** in the hideout — first way back to the title screen.
- **Practice-a-code decluttered**: the seed input hides behind a small
  "⌁ code" chip on the daily card (full practice-mode treatment deferred to
  the design pass).

## Web build — playtest round 2: stale-cache killer, jobs-board back, tighter stick

- **Stale builds fixed at the root**: "no report button" turned out to be
  Safari serving an old cached copy — and separately, the report link lived
  in a row that mobile CSS hides entirely. Vercel now sends
  `Cache-Control: no-cache, must-revalidate` (single-file game — a 304
  revalidation costs nothing), and a **build stamp** shows on the title
  screen and hideout so a stale copy is instantly identifiable.
- **📋 Report is a real button** in the hideout action row (visible on
  phones), no longer a hidden hint-line link.
- **Jobs board back button**: "← Back to the Hideout" so you can hop back
  to swap your equipped tool or spend gold before committing to a job.
- **Tighter touch movement**: shorter joystick travel (0.55× ring) with a
  response knee — full speed by 65% deflection — and a snappier camera
  (0.10 → 0.13 ease).

## Web build — playtest round 1 fixes (iPhone)

- **Crisp rendering**: the canvas now oversamples by devicePixelRatio (capped
  2×) and draws through a render-scale transform — landscape on a phone was
  rendering at 600px and upscaling (blurry). Same world view, sharp pixels.
- **DROP actually works**: dropped loot was re-grabbed by the pickup loop one
  frame later, making the button look dead. Dropped pieces now toss slightly
  behind Jo with a 1.2s re-grab grace (live-frame regression test added).
- **Audio on iPhone**: opted into the `playback` audio session so the ring/
  silent switch no longer mutes the game — the likely "no SFX" culprit. Also
  added a distinct "spotted!" sting when any guard first starts chasing
  (rate-limited), and the chase tremolo layer is louder.
- **Undercity readability**: bigger lantern, lighter darkness curve — walls
  and loot glows stay legible on a phone at max brightness.
- **Results fit portrait**: the stat row wraps instead of overflowing
  offscreen; verified zero scroll on a 390×844 viewport.
- **Hideout declutter**: Daily / Choose Job / Collection buttons moved up
  under the banked gold; den perk chips moved below the daily card.
- **Luxuriant feel**: every screen transition now blooms in with a golden
  wash + scale; the extraction number pulses with a win glow and counts up
  from $0; banked gold rolls to its new value instead of snapping.
- **Touch correctness**: the escape prompt says "hold the gold button" on
  touch instead of "Hold E"; long-press no longer pops iOS text selection.
- **Offscreen-threat compass**: pulsing edge arrows track the rival thief
  (violet) and the Bounty Hunter (red) when they're off screen.

## Web build — playtest telemetry & economy re-centering

- **Playtest telemetry**: every run (escape, capture, or abandon) is logged
  locally — location, layout, modifier, job, ascension, outcome and death
  cause, duration, haul vs banked, peak Heat, Vault-Remembers seconds, hits
  taken, loot secured, tool usage, epithet earned. "Copy playtest report" in
  the hideout aggregates it into paste-able text (escape rates, deaths by
  cause, per-location/modifier tallies, tool usage, recent-run lines).
  Kept to the last 80 runs; cleared by Reset progress.
- **Economy audit** (`npm run audit:econ`, committed): drives the real
  run→fence→bank pipeline headless across meta stages and grab policies.
  Findings: income growth FRESH→MAX is ×3.97 (on-target vs the handoff's
  ×4 intent), but every decent haul pinned Heat T6 because vaults roughly
  doubled in value since the 650/tier dial was set — flattening danger pay
  into a constant and making Vault-Remembers routine.
- **Tuning**: Heat re-centered at $900 of carried value per tier (was 650).
  Modest hauls now ride T3–4; T6 and THE VAULT REMEMBERS are reserved for
  genuinely greedy runs. Further economy dials deliberately wait for real
  playtest telemetry.

## Web build — endgame: The Vault Remembers, Legendary Heist & skill lanes

- **THE VAULT REMEMBERS** (Heat T6, the GDD's max-heat tier): at full Heat the
  building itself joins the hunt — a pulse every 2.5s hands your position to
  every guard (visible ripple), sentries sweep 50% faster and see 25%
  further, the vault slams its own loop doors on a timer, and the exit takes
  1.1s to force instead of 0.6s. Shed greed below T6 and it settles. The
  Heat label flips to "THE VAULT REMEMBERS" while active.
- **Legendary Heist is now multi-stage**: intel reveals the Heart from the
  start; Stage 1 case the chamber → Stage 2 take the Heart (the vault locks
  to T6 while you carry it) → Stage 3 the exit BOLTS itself and two
  seal-latches spawn — break both (each screams an alarm) to open the way.
  Reward raised $1,700 → $2,400. Stage progress lives on the HUD objective.
- **Skill lanes** (GDD skill tree): the 10 upgrades are grouped into Thief,
  Smuggler, Mastermind and Treasure Hunter lanes, with the Workbench as the
  Trickster lane. Maxing a lane earns a capstone: Cold Trail (chases give up
  30% sooner), Bottomless Bags (first 8 weight carries free), The Long Game
  (contracts +15%), Appraiser's Eye (a fake can't inflate your Heat — the
  noble scam still works), Sleight of Hand (+1 tool charge per job).
- Fixed a shop-layout bug: once the hideout grew taller than the stage, the
  upgrade/tool grids (the overlay's only shrinkable flex items) collapsed to
  zero height — they now keep natural height and the overlay scrolls.
- New suite `tests/web_endgame_test.mjs` (`npm run test:endgame`) covers the
  T6 wake/settle cycle, all five capstones, and the full heist: stages 1→4
  and extraction through the extended hold, live through real frames.

## Web build — the Workbench, the Gilded Fake & Reputation (GDD items)

- **The Workbench (Jo's tool kit)**: five buy-once tools at the hideout; one
  rides per job with limited charges, fired by Space or the optional TOOL
  touch button (never required — one-finger north star holds):
  Smoke Bomb (break chases, 3s silence), Decoy Bag (glitter bait), Grapple
  Hook (reel in the nearest visible treasure — ledges and Skitterjewels
  included), Lockpick Kit (reopen a severed shutter), Portable Portal
  (free marker, one snap-back from anywhere).
- **Gilded Fake** (Fake Loot from the GDD): spawns in ~70% of vaults, reads
  $520 in the bag (and raises Heat!), fences for $40 — unless you pass it to
  the Noble at full price for +1 notoriety. Dropped, its glitter baits
  nearby guards, same as the Decoy Bag.
- **Reputation-as-system**: escape epithets now accumulate; earned twice, one
  becomes your standing (shown in the hideout). Matching contracts seek you
  out at +25% pay (starred on the board), and your standing's favorite buyer
  pays +10% ("knows your name"). Recorded on the results screen.
- Generator hardening: a seeded reachability pass now guarantees every
  ground item is walkable from the entrance (arena layouts could rarely
  seal a pocket — Clean Sweep is now always possible).
- New suite `tests/web_tools_test.mjs` (`npm run test:tools`) drives all five
  tools, the fake's economy/bait, and reputation board/price shaping.

## Web build — location identity (every map fights differently)

- The four contract locations are no longer just palettes — each has a
  signature hazard, shown on the HUD objective line:
  - **Sunken Treasury** — flood pools: wading is 25% slower but swallows 55%
    of your loot noise (guards wade slower too). Splashes and ripples.
  - **Cliffside Fortress** — telegraphed wind gusts shove every ground
    creature (you and guards alike), plus one extra mesa to climb.
  - **Undercity Vaults** — pitch dark: you see a breathing lantern radius
    around Jo; in exchange, guards spot you 15% later. Distant drips.
  - **Old Mint** — coin presses on staggered warn→slam cycles: getting
    caught under one costs a heart, but a guard caught under one is
    stunned — bait chases through the presses.
- Free runs roll a location too, so the identity shows up everywhere; the
  How to Play screen documents it under "Places".
- New headless suite `tests/web_location_test.mjs` (`npm run test:location`)
  forces each theme and verifies pool slow/muffle ratios, gust cycles that
  move an idle player, the exact 0.85× dark-detection factor, and press
  crush/stun behavior.

## Web build — game-feel pass (audio & juice)

- Procedural audio: a fully synthesized WebAudio kit (no assets) — 22 named
  cues covering pickups (pitch scales with value), hits, shatters, alarms,
  the Hunter's entrance, sever groan/slam/reopen, landings, drops, the
  escape-hold charge, win/loss stingers, cash and UI ticks.
- Ambient bed: a low drone under every run, a heartbeat that quickens with
  Heat, and a tremolo layer that fades in while any guard is chasing.
- Mute: the M key or the new 🔊 HUD button toggles sound; the choice persists.
- Visual juice: expanding impact rings on hits/alarms/door slams, footstep
  dust, squash-and-stretch on Jo for hits and landings, a pulsing last-heart
  vignette, and a visible progress ring while holding the exit.
- New headless suite `tests/web_juice_test.mjs` (`npm run test:juice`) covers
  audio unlock, every cue, the ambient ramp, fx spawn/decay, pickup/drop
  wiring, mute, and silent no-op behavior when audio never unlocks.

## Web build — mobile, modifiers & mastery

- Landscape: the phone stage and canvas buffer now follow device orientation,
  filling the screen instead of shrinking to a portrait strip.
- Mobile controls: scale-correct joystick (orientation-agnostic), a touch DROP
  button (the Q-key verb), and pressed feedback on the touch buttons.
- Vault Modifiers: every free run rolls a risk/reward twist — Still Night,
  Gilded Vault, Curfew, Dead Fog, Heavy Purse, or a no-twist Clean Job.
- Modifier Mastery: bank a haul under each twist for a permanent +3%/twist
  sales bonus; progress persists and shows in the hideout.

## v0.1.3 — Godot 4.7 type-inference hotfix

- Replaced the untyped `Node` vault parameter in guard and sentry AI with `GreedrunVault`.
- Explicitly typed the guard visibility test as `bool`, removing the parser failure at `guard.gd:36`.
- Hardened guard movement locals and sentry cone calculations with explicit Godot types.
- Typed guard waypoint arrays and matching Vault spawn helpers to prevent follow-on inference failures.
- Added explicit types to several Vault locals that depend on duplicated typed arrays or nullable scene instances.
- Re-ran `gdlint` across every autoload and gameplay script.

## v0.1.2 — Godot 4.7 native-member hotfix

- Renamed `GreedrunLoot.hidden` to `GreedrunLoot.is_hidden`. Godot 4.7 exposes `hidden` as a native inherited member, so redeclaring it caused a parser error.
- Updated all Vault references to use `item.is_hidden`.
- Preserved the serialized loot configuration key as `"hidden"`, so generation behavior and save compatibility are unchanged.
- Re-ran `gdlint` across all gameplay and autoload scripts with no reported issues.

## v0.1.1 — Parser hotfix

- Fixed the missing indentation in `scripts/vault.gd` inside `can_move()` at the raised-platform collision return.
- Confirmed all autoload and gameplay scripts pass `gdlint` after the correction.
- The reported `main.gd` load failure was a downstream error caused by the invalid Vault script resource.

## v0.1.0 — Initial Godot port

- Ported the evolved HTML prototype and handoff into a standalone Godot 4 project.
- Implemented the complete hideout-to-fence vertical-slice loop.
- Added procedural vault themes, vertical platforms, stealth/chase AI, Heat, contracts, loot personalities, branching artifacts, extraction, buyers, upgrades, Collection restoration and JSON persistence.
- Added keyboard and touchscreen controls.
- Added parser/linter validation, port notes and a structured first-playtest checklist.
