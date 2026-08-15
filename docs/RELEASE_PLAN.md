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
  Remaining ideas for slice 3: fully flooded rooms (extend the treasury
  pool system to room-scale water), trapdoors/one-way travel, locked
  doors + keys.
- [x] **Ascension twists** (shipped .11): every level adds a named,
  cumulative mechanic (Second Hound → Bright Eyes → Rival's Hour → Curfew
  Bell → Light Sleeper → Doubled Watch → Kennel → Sharper Steel → Sealed
  Night → The Vault's Own). Still open: an ascension-only *reward* track
  (cosmetics/titles) if twists alone don't make climbing feel worth it.
- [x] **Rival escalation** (shipped .11): guards chase him on sight
  (player sighting wins), he flees, a collar drags him off and drops his
  stolen haul as a reclaimable sack. Still open: rival contesting the
  player directly (shove/snatch).
- [x] **Oust pursuers** (shipped .10): detection now requires line of
  sight, and chases tire — watchdog gives up winded after 4.5s of failing
  to catch you, grunts 8s, Hunter 12s.
- [x] **Vault Heart findability** (shipped .10): Treasure Sense now draws
  a gold compass arrow to the Heart (it was "revealed" but unfindable —
  the user maxed the tree without ever seeing it).

## R3 — Cut / keep decisions (user calls these)

Present these to the user with data; don't decide unilaterally:

- [ ] **Modifiers are invisible.** All 10 reported runs were "clean" —
  because contracts and dailies dominate play and are always clean, the
  modifier system effectively never fires. Options: (a) let twists apply to
  contracts at reduced rate, (b) surface modifier choice on the free-run
  card, (c) cut the system for 1.0. Needs a decision.
- [ ] **Watchdog and shrine**: user verdicts pending from playtests —
  keep, retune, or cut.
- [ ] Anything else the user flags as "doesn't belong per the GDD".

## R4 — Release wrapper (the "this is a real game" pass)

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
