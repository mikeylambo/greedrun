# Greedrun — Release Plan

Goal: take the live build at **greedrun.vercel.app** from "polished vertical
slice" to a **1.0 release version**. This document is written for a fresh
Claude Code chat to pick up cold — read the Orientation section first, then
work the milestones in order. The user playtests between drops and pastes
telemetry reports; fold those into R2/R3 decisions as they arrive.

---

## Orientation (read this first in a new chat)

**The product.** A top-down loot-heist roguelite. The web build IS the game —
the Godot port was abandoned. Everything lives in **one file**:
`web/index.html` (~3600 lines, IIFE, zero dependencies, procedural WebAudio,
canvas renderer). No build step. Design bible: `docs/PORT_HANDOFF.md`
(systems reference — treat as read-only). Recent history: `CHANGELOG.md`
(newest first; add an entry per drop).

**Deploy loop.** Vercel serves `web/index.html` at the root (rewrites in
`vercel.json`, `no-cache` headers because it's a single file).

1. Edit `web/index.html`.
2. Bump the `const BUILD = 'YYYY-MM-DD.N'` stamp (search `BUILD = `) — it
   shows on the title screen and hideout so the user can confirm they're on
   the new build.
3. `npm test` — six Playwright suites chained (region, juice, location,
   tools, endgame, onboarding). Chromium is at
   `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.
   `npm run audit:econ` prints an economy report (informational, not
   pass/fail).
4. Commit on the session's designated feature branch, then push BOTH:
   `git push -u origin <branch>` and `git push origin <branch>:main`.
   Pushing main is standing-authorized and auto-deploys (~5s). Verify with
   the Vercel MCP tools (project `prj_znYUCCjQqk7tBNnxfUPtkHXEwPSl`, team
   `team_9hkoGBJSASmRx09t7A0aIHti`).

**Hard rules.**
- All world generation must consume the seeded RNG stream identically
  regardless of player state — dailies and shared vault codes must
  reproduce. (E.g. modifier rolls always draw `modR1`/`modR2` even when
  selection is gated.) If you add generation, draw from the stream
  unconditionally.
- One-finger playable: nothing may *require* a keyboard or second button.
- Tone: reverent heist-fantasy, no occult framing (PORT_HANDOFF §12).
- Tests that navigate the full hideout must set `meta.runs = 10` first
  (the unlock ladder hides UI on fresh saves).
- The `window.__greed` object is the test surface — extend it rather than
  scraping the DOM.
- Never put the model ID in committed artifacts. Commit footer:
  `Co-Authored-By` + `Claude-Session` lines as configured.

**Telemetry loop.** The in-game REPORT button copies a digest of the last
runs (`runLog`, localStorage `greedrun_runlog_v1`). The user pastes it into
chat; use it to drive tuning. Latest report (12 runs, build .9): **50%
escape, contract success 50% (quota 2/4), smoke used ~1/run when
equipped** — the .9 tunes verified: adaptive quotas landed in the 40–60%
target band, the smoke fix turned the tool from decorative to used, and
difficulty rebounded from .8's 100%-escape anomaly. New signal: the
**watchdog is the top killer (3 of 6 deaths)** and the user reported
chases feeling inescapable — build .10 answered with line-of-sight
detection + chase stamina ("winded"); **verify watchdog deaths drop and
escapes stay near 50–60% in the next report.** History: .7 = 50% escape /
13% contracts; .8 = 100% escape / 0 hits.

---

## R1 — Finish the meaning sweep — DONE (build .9)

- [x] **Collection screen**: trophies state their payoff ("+3% from every
  buyer — every run"), unclaimed niches explain the claim path, restore
  buttons carry a "restore → next effect" line.
- [x] **Pause / mid-run stats**: greed load as "% slower", heat tier with
  its meaning, notoriety's consequence, live contract progress in plain
  words (`contractStatus()`).
- [x] Tip text swept — all `tip(` calls already speak player.

Build .9 also shipped playtest fixes outside R1's original scope: camera
lead smoothing, the smoke-bomb point-blank fix (smoke now blinds guards
and sentries for its full 3s), solid guard bodies, the extraction→fence
money bridge, the Noble one-piece-rule visibility, and NEED-$X shop chips.

## R2 — Balance from telemetry (needs the next playtest report)

- [ ] Confirm quota-contract success rate rose from 13% toward ~40–60%.
  If still low, the issue is haul size not quota size — look at loot value
  curve in early tiers.
- [ ] Confirm the gifted Smoke Bomb gets *used* (report tracks `toolUses`).
  If gifted-but-unused, the problem is the tool button's visibility/feel,
  not ownership — that's a UI fix, not an economy fix.
- [ ] Early-game difficulty: report showed deaths concentrated in the first
  minute on fresh-ish saves. Consider slower first-guard alert or a beat of
  grace on runs 1–3.
- [ ] Re-run `npm run audit:econ` after any tune — income growth
  FRESH→MAX should stay near the handoff's intended ×4 (currently ×3.97).

## R2.5 — "Premier game" backlog (user's direction, build .10 session)

The user's framing: this is evolving from a premium game into a premier
one — flagship title, original character, sets standards in originality
and familiarity. Named influence to study: **Survivor.io** (system/
mechanic/concept inspiration, not genre — look at its unlock cadence,
in-run choice density, and reward presentation). Concrete ideas raised,
in rough value order:

- [x] **Level-design depth, slice 1** (shipped .11): strongboxes (1–2 per
  vault, dwell-to-open, loud), hidden stashes (~60% of vaults, shimmer on
  approach, silent), found-tool crates (~50%, swap the kit for the night).
- [x] **Level-design depth, slice 2** (shipped .12, all six user-greenlit
  ideas): the Breach (Heat T4+ opens a second exit in the east wall), the
  Drop Chute (mid-run banking at 70¢ on the dollar, kept through death),
  a named Bounty Hunter with a lifetime feud counter, the Thief's Ledger
  (career page in the Trophy Room — PSU-room framing), the Thieves' Altar
  (1-of-3 run boons on pedestals at the door, diegetic), and a
  secrets-sound pass (chest creak/crack, stash heartbeat + chime, chute
  swallow, breach rumble, altar chord).
- [x] **Level-design depth, slice 3** (shipped .13): fully flooded rooms
  (room-scale water in Treasury/Undercity grids — slow but silent),
  the Old Tunnel (one-use loud trapdoor drop back to the door), locked
  shutters + the brass key (loop-door shortcuts; lockpick also works).
  The procgen ideas queue is now EMPTY — next level-design work should
  come from the next playtest report.

## THE CONTENT ROADMAP (locked with the user, build-.16 session)

**Doctrine: content-complete first, then balance.** The user's words: "Once
content is in fully we can balance." Do not spend drops on tuning until
.21 ships; log balance observations in this file instead.

**Standing design decisions (user-called, do not relitigate):**
- **Jo IS the Mastermind.** No rank/reputation ladder renaming him or
  charting his growth — for this game he is already at Mastermind level.
  Progression is framed as **the Operation growing**: territory opens,
  clients trust bigger jobs, the network deepens. Per-run epithets stay
  (street-talk about him, not titles he wears).
- **No Almshouse.** The greed lesson is subtle and systemic — expressed
  through consequences (see .17), never a preachy mechanic.
- **One-finger design is sacred.** No second active-tool button. Depth
  via a QUEUED backup tool that auto-promotes when the active one runs
  dry (zero new inputs).
- Mission types are flavor folded into the tier system, not a separate
  pass (sized at ~2-3h of mastery variety).

### Build .17 — "The Operation" (progression spine) — SHIPPED
- Five standings gated on career banked open territory (Mint → Undercity
  → Fortress → Treasury → all) and scale vaults (+26%) and client fees
  (+80%). Trophy Room leads with the Operation page; Den shows a live
  standing + progress bar; growth announces like an unlock.
- Client forfeit shipped: failing a contract costs −20% on that client's
  work until you finish one. USER CALL: the "you passed the exit
  carrying $X / died carrying $Y" line was **rejected** — it doesn't
  make sense and the game keeps death language out. Forfeit + the
  existing lost-haul-on-capture IS the greed consequence.
- Also fixed: solid decor could plug a doorway and wall off a room.
- **PENDING TERMINOLOGY PASS (user: "we're beyond the streets")**: sweep
  street/notoriety-era language game-wide — "the street remembers", the
  epithet framing, Syndicate/Black Market/Noble naming — to match the
  Operation's scale. Schedule with .21 identity polish unless the user
  wants it sooner.
### Build .18 — Location identity — SHIPPED
- **The Assessor** is the signature enemy: a lamp-lit clerk who logs the
  plinths you emptied, +1 Heat per entry (max 3), never attacks, always
  outpaceable. He's the structural punishment for greed the design was
  missing. **USER TO WORK HIM INTO THE FICTION** — he pairs with the .19
  finales (a boss form of him is the obvious move).
- Timed Raids rotate the watch every 26s; a perfect Silent Job (unseen,
  untouched, unheard) pays The Quiet Commission, a fenceable relic.
- Modifiers now roll on contracts at ~half the free-run rate (Legendary
  Heist stays clean). The 19/19-clean problem is closed.
- NOT done (deliberate): the high-tier quota "curse clock" — it would be
  a second heat engine stacked on the Assessor. Revisit only if the
  telemetry says quota runs feel flat.
### Build .19 — Finales & puzzle chambers — SHIPPED
- Four named finales (The Last Die / The Lightless Crown / The Windward
  Vault / The Drowned Ledger); the Chief Assessor turns stage 3 into a
  race against his pen; taking one grows the Operation by itself
  (opTier = max(bankedTier, finalesTaken)).
- The Weighted Gate is the puzzle chamber: a barred cache + pressure
  plate solved by DROPPING loot on it (no new inputs, uses the drop
  verb, self-contained walls so connectivity is untouched).
- Assessor corner-wedge fixed (slide, then abandon the plinth).
- Chest placement now prefers enclosed spots.
- NOT built (deliberate, revisit if wanted): mirror-sentry rooms and
  sequence locks. One well-taught puzzle beats three shallow ones; the
  gate teaches a verb the game already has.
### Build .20 + .21 — long tail + identity polish — SHIPPED (as build .21)
- Second sheath (backup tool auto-promotes, no new inputs); museum set
  bonuses (2/3/4/5 pieces = +3/7/12/20% gold); Jo's-room feat props
  (finale map wall, Hunter's notice, epithet banners, collection plaque,
  ladder mark); The Long Night (endless ascension past A10).
- Terminology swept off street-era language; OST motif (four-note greed
  figure, per-location key, heat-layered voices); title reads "A Jo
  Story", MVP tag gone.
- STILL OPEN from .21's original scope (not blockers, carry into R4):
  the vector-art quality pass. NOTE: the user DOES playtest on real
  hardware every round — do not assume otherwise or ask them to verify
  what they have already verified.

## CONTENT COMPLETE — next is the balance pass
Everything the roadmap scoped is in the build. Per the user's standing
doctrine ("once content is in fully we can balance"), the next cycle is:
1. A fresh-save ladder playthrough AND a veteran endgame session, in the
   same report round.
2. Retune with all content present: quota targets, heat curve, the
   multiplier-stack soft cap, watchdog lethality (it has been the ONLY
   killer in the last three reports), Assessor mark pacing.
3. Then R4 wrapper (art call, PWA/store packaging, OG/favicon/1.0
   string), then R6 QA sweep, then 1.0.
### Then: CONTENT-COMPLETE → the big balance pass
- Fresh-save ladder playthrough + veteran endgame audit in one report
  cycle; retune quotas/heat/economy/multiplier-stack soft cap with all
  content in. Then R4 wrapper → R6 QA → 1.0.

**Balance observations parked until content-complete:**
- Maxed builds bank 4-5× haul via the multiplier stack (buyers ×
  contacts × danger × den × mastery × Fortune's Cache × ascension) —
  candidate: soft cap on the stacked sale multiplier.
- Escape rate at 84% in the latest 19-run report (watchdog the only
  killer, 3×) — early-ladder difficulty reads soft for a skilled player.
- Chute used 4/19 runs — healthy first adoption, watch the trend.

**Shipped depth history:** Phase A re-pace (.14) · ascension twists (.11)
· rival escalation (.11) · LOS + winded chases (.10) · Heart compass
(.10) · secrets slices 1-3 (.11-.13) · ghost-loot fix + freebie-contract
floors + buyer anchors (.16).

## R3 — Cut / keep decisions (user calls these)

Present these to the user with data; don't decide unilaterally:

- [ ] **Modifiers are invisible.** Every telemetry report confirms it
  (latest: 19/19 clean) — contracts and dailies dominate play and are
  always clean, so the system never fires. RECOMMENDATION (scheduled for
  build .18): contracts roll modifiers too at ~50% of the free-run rate;
  cut only if the user prefers. Options (b) surface modifier choice on
  the free-run card / (c) cut for 1.0 remain fallbacks.
- [ ] **Watchdog and shrine**: user verdicts pending from playtests —
  keep, retune, or cut.
- [ ] Anything else the user flags as "doesn't belong per the GDD".

## R4 — Release wrapper

**OST (playtest ask, build .15):** the audio is a procedural WebAudio bed
(drone + heartbeat + chase tremolo + location ambiences). For release,
either give the bed a real musical pass (a motif, a chord progression per
location, heat-driven intensity layers — stays zero-asset) or license a
track. User decides direction; the Sound FX / Music menu toggles shipped
in .15 so an OST drops straight in. (the "this is a real game" pass)

- [ ] Drop "MVP" / "Vertical Slice" branding everywhere (title screen,
  hideout, README).
- [ ] **PWA**: manifest + icons + minimal service worker so iPhone
  add-to-home-screen gets fullscreen standalone + an app icon. NOTE: the
  service worker must not fight the no-cache strategy — use
  network-first with the BUILD stamp as the cache key.
- [ ] OG/social meta tags + favicon so the link unfurls properly.
- [ ] A version string ("1.0") alongside the BUILD stamp.
- [ ] Title screen polish pass if credits allow (it's the storefront).

## R5 — Deferred to post-release (do NOT block 1.0)

- Supabase daily leaderboard (MCP connected, schema sketched in prior
  discussion — deliberately deferred).
- Art pass via Scenario (sprites/portraits) — the procedural look ships.
- Native wrappers, itch.io page, anything platform.

## R6 — Release QA sweep (last, before calling it 1.0)

- [ ] All six suites + econ audit green.
- [ ] Fresh-save playthrough: wipe, complete the unlock ladder run 1→6,
  confirm every tip fires once and no screen requires scrolling at
  iPhone-portrait and 640×640.
- [ ] Save migration: load a `greedrun_meta` blob from an older build,
  confirm no crash and no lost gold/upgrades (loadMeta defaults).
- [ ] Cross-device: iPhone Safari portrait+landscape, desktop
  Chrome/Firefox, fullscreen toggle, audio after first gesture, silent
  switch (audioSession) still bypassed.
- [ ] Perf: no dropped frames at RS=2.5 with max particles (heat T6 +
  chase + rain of coins on escape).
- [ ] Read every screen once, out loud, as a new player. Anything that
  needs the GDD to understand gets rewritten.

---

## Suggested drop order for the new chat

1. R1 (one drop — small, high-visibility).
2. User playtests → paste report → R2 tunes + R3 decision conversation
   (one drop).
3. R4 wrapper (one drop).
4. R6 QA sweep → tag it 1.0 (final drop).

That's four drops to release. Keep each one shippable — push main every
time, bump BUILD every time, changelog every time.
