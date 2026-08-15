# Changelog

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
