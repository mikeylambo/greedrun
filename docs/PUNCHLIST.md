# GreedRun — Release Punch-List

Where the web build (`web/index.html`, greedrun.vercel.app) stands and what's
left to reach a marketed 1.0. Ordered by impact. Status as of this pass:

- **Live in production:** HUD chrome, map textures, menu icons (contracts +
  trophies), trophy-name placards, loot art.
- **On `main`, tested, awaiting deploy:** the per-run floor dim/vignette
  treatment (blocked only by Vercel's 24h Hobby deploy cap).

---

## P0 — release-blocking / highest impact

- [ ] **Deploy the floor treatment.** Merged to `main`; promotes on the next
      redeploy once the Vercel quota window clears. No code change needed.
- [ ] **Jo character art.** He's still a procedural blob — the single most
      obvious unfinished element. Blocked on a character-animation-model
      decision (Scenario kept failing on characters, which is what pivoted the
      art effort to maps/UI). Needs: base sprite + load-tier variants, or a
      deliberate stylized-silhouette treatment if we keep him abstract.
- [ ] **Level structure / geometry.** The play space reads as an open textured
      plane. Stealth wants walls, rooms, corridors, and cover so line-of-sight
      and routing become tactical and legible. This is gameplay *and* art.

## P1 — strong polish, pre-release

- [ ] **Wall vs. floor balance after the floor treatment.** With the floor now
      dimmed/vignetted, re-check that walls don't read brighter than the floor;
      rebalance wall opacity/overlay to keep the hierarchy.
- [ ] **Enemy readability in-world.** Guards are near-black orbs with a
      code-drawn glowing eye. Confirm they read as threats *before* contact
      across all floor treatments (incl. the bright A roll) and on mobile.
- [ ] **Stairs / exits / extraction portal.** Confirm the stair treatment reads
      at a glance on the dark floors; build proper edge/autotile pieces for
      walls and the extraction portal (diffusion can't do edge-matching).
- [ ] **Fix the flaky commission-card test.** Seed-dependent 2-vs-4-line
      assertion in `tests/web_mastermind_test.mjs`; make the card robust or the
      test tolerant so CI is trustworthy.
- [ ] **Mobile pass.** Play the core loop + all menus on real iOS Safari and
      Android Chrome at true device sizes, not just an emulated viewport.

## P2 — identity & finish

- [ ] **Tier-3 identity art:** title logo, screen backdrops, app icon, key art.
- [ ] **Heat meter per-state art** (engine-composite from the flame gauge).
- [ ] **VFX + audio** — separate track, out of image-gen scope; scope it.
- [ ] **Godot port decision.** The parallel wiring exists but deploys nowhere.
      Decide: web-only shipping target, or invest in Godot. Don't maintain both
      silently.

## Process notes

- **Batch deploys.** The Hobby plan caps 100 deploys/project/24h. Trickling
  merges (branch previews + per-merge production builds) burns it fast — stack
  changes into fewer merges.
