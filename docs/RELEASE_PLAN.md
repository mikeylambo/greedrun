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
4. Commit on `claude/friendly-dijkstra-yn1ztf`, then push BOTH:
   `git push -u origin claude/friendly-dijkstra-yn1ztf` and
   `git push origin claude/friendly-dijkstra-yn1ztf:main`.
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
chat; use it to drive tuning. Latest report (10 runs, build .7):
50% escape rate, avg run 1:14, **contract success 13%**, tools never
purchased, deaths spread across guard/hunter/elite/watchdog, heat routinely
peaked T5–T6. Build .8 already responded with a quota-contract retune
(900–1600, was 1400–2400) and a free Smoke Bomb gifted at the Workbench
unlock — **verify both moved the needle in the next report.**

---

## R1 — Finish the meaning sweep (small, do first)

The fence screen, decision cards, and results screen now speak in player
consequences ("~9% slower · Heat +1 — the vault will remember"). Two
screens still speak programmer:

- [ ] **Collection screen**: restore buttons say the mechanic, not the
  payoff. Give each trophy the fence treatment — what restoring it does for
  the player, in one plain line, plus the "keep vs restore" tradeoff.
- [ ] **Pause / mid-run stats**: currently raw numbers. Same treatment —
  carried value, weight penalty as "% slower", heat tier with its actual
  meaning, contract progress as "2 of 3 relics".
- [ ] Sweep any remaining toast/tip text for jargon (grep `tip(` calls).

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
