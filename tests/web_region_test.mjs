// Headless browser verification for the web room-grid procgen.
//   node tests/web_region_test.mjs
// Loads web/index.html, drives buildWorld() across fixed seeds, and asserts
// determinism, connectivity (by construction AND by flood-fill), doorway
// passability, guard doorway-threading, and that the layout flip yields both modes.
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(String(e)));
await page.goto('file://' + root + '/web/index.html');
await page.waitForTimeout(300);

const res = await page.evaluate(() => {
  const G = window.__greed;
  const { isOpen, platAt, navTarget } = G;
  const build = s => G.build(s);
  const gv = () => G.vgraph;
  const out = { fails: [], log: [], mix: { rooms: 0, arena: 0 } };
  const RASTER = 20, SEEDS = [1, 2, 7, 42, 1337, 90210, 5, 88, 314159, 271828];
  const K = (cx, cy) => cy * 100000 + cx;
  function flood() {
    const open = new Set(), W = G.WORLD.w, H = G.WORLD.h;
    const s0 = K((G.player.x / RASTER) | 0, (G.player.y / RASTER) | 0);
    const st = [s0]; open.add(s0);
    while (st.length) {
      const k = st.pop(), cy = (k / 100000) | 0, cx = k % 100000;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy, px = (nx + 0.5) * RASTER, py = (ny + 0.5) * RASTER;
        if (px <= 0 || py <= 0 || px >= W || py >= H) continue;
        const nk = K(nx, ny);
        if (open.has(nk)) continue;
        if (isOpen(px, py, 12) && platAt(px, py) === -1) { open.add(nk); st.push(nk); }
      }
    }
    return open;
  }
  const reach = (open, x, y) => {
    const cx = (x / RASTER) | 0, cy = (y / RASTER) | 0;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (open.has(K(cx + dx, cy + dy))) return true;
    return false;
  };
  const roomReach = (open, R) => {
    let anyOpen = false;
    for (let ix = 0; ix < 6; ix++) for (let iy = 0; iy < 6; iy++) {
      const x = R.x + (ix + 0.5) / 6 * R.w, y = R.y + (iy + 0.5) / 6 * R.h;
      if (isOpen(x, y, 12) && platAt(x, y) === -1) { anyOpen = true; if (reach(open, x, y)) return true; }
    }
    return !anyOpen;
  };

  for (const s of SEEDS) { build(s); gv() ? out.mix.rooms++ : out.mix.arena++; }

  for (const s of SEEDS) {
    build(s); if (!gv()) continue; const g = gv();
    const seen = { [g.exit]: 1 }, q = [g.exit];
    while (q.length) { const c = q.shift(); for (const n of g.adj[c]) if (!seen[n]) { seen[n] = 1; q.push(n); } }
    if (Object.keys(seen).length !== g.cols * g.rows) out.fails.push(`seed ${s}: graph connects ${Object.keys(seen).length}/${g.cols * g.rows}`);
    // every doorway passable — except the one loop door a brass-key lock may hold shut at gen
    const lockedKeys = new Set(G.lockedDoors.map(d => d.key));
    for (const k in g.doors) { const d = g.doors[k];
      if (lockedKeys.has(k)) { if (!g.loopKeys.includes(k)) out.fails.push(`seed ${s}: LOCKED a tree door ${k} — would disconnect`); continue; }
      if (!isOpen(d.x, d.y, 14)) out.fails.push(`seed ${s}: doorway ${k} blocked`); }
    const open = flood();
    if (!reach(open, G.portal.x, G.portal.y)) out.fails.push(`seed ${s}: portal unreachable`);
    for (let i = 0; i < g.cols * g.rows; i++) if (!roomReach(open, g.openRect(i))) out.fails.push(`seed ${s}: room ${i} unreachable`);
    for (const l of G.loot) if (l.plat < 0 && !reach(open, l.x, l.y)) out.fails.push(`seed ${s}: ground loot unreachable`);
  }

  for (const s of SEEDS) {
    build(s); if (gv()) continue; const open = flood();
    if (!reach(open, G.portal.x, G.portal.y)) out.fails.push(`arena seed ${s}: portal unreachable`);
    let ur = 0; for (const l of G.loot) if (l.plat < 0 && !reach(open, l.x, l.y)) ur++;
    if (ur) out.fails.push(`arena seed ${s}: ${ur} ground loot unreachable`);
  }

  build(42); const w1 = JSON.stringify(G.walls); build(42); const w2 = JSON.stringify(G.walls);
  if (w1 !== w2) out.fails.push('determinism: walls differ for seed 42');

  let nav = null; for (const s of SEEDS) { build(s); if (gv()) { nav = s; break; } }
  if (nav !== null) {
    build(nav); const g = gv();
    let far = 0, best = -1; for (let i = 0; i < g.cols * g.rows; i++) { const d = g.dist[i] ?? -1; if (d > best) { best = d; far = i; } }
    const R = g.openRect(far), tx = R.x + R.w / 2, ty = R.y + R.h / 2;
    const gp = { x: G.guards[0].x, y: G.guards[0].y }, startReg = g.regionOf(gp.x, gp.y); let arrived = false;
    for (let step = 0; step < 4000; step++) {
      const n = navTarget(g, gp.x, gp.y, tx, ty); let dx = n.x - gp.x, dy = n.y - gp.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const sp = 200 / 60, cx = gp.x + dx * sp, cy = gp.y + dy * sp;
      if (isOpen(cx, cy, 14) && platAt(cx, cy) === -1) { gp.x = cx; gp.y = cy; }
      else if (isOpen(cx, gp.y, 14) && platAt(cx, gp.y) === -1) gp.x = cx;
      else if (isOpen(gp.x, cy, 14) && platAt(gp.x, cy) === -1) gp.y = cy;
      if (g.regionOf(gp.x, gp.y) === far) { arrived = true; break; }
    }
    out.log.push(`guard nav seed ${nav}: room ${startReg} -> ${far} (dist ${best}) arrived=${arrived}`);
    if (!arrived) out.fails.push('guard could not thread doorways');
  }
  if (out.mix.rooms === 0 || out.mix.arena === 0) out.fails.push('layout flip did not produce both modes ' + JSON.stringify(out.mix));

  // ---- Ascension ----
  const id0 = G.ascMods(0), a10 = G.ascMods(10);
  if (id0.gs !== 1 || id0.det !== 1 || id0.pay !== 1 || id0.heat !== 0 || id0.fromStart) out.fails.push('ascMods(0) is not identity');
  if (!a10.fromStart || a10.hun !== 0) out.fails.push('ascMods(10) HUNTER_FROM_START not resolved');
  if (a10.pay !== 3.40) out.fails.push('ascMods(10) payout wrong: ' + a10.pay);
  // guard speed / detection scale with the active level
  G.ascensionLevel = 0; const gs0 = G.guardSpeed(), dt0 = G.detectRadius();
  G.ascensionLevel = 5; const gs5 = G.guardSpeed(), dt5 = G.detectRadius(); G.ascensionLevel = 0;
  if (Math.abs(gs5 / gs0 - 1.11) > 1e-6) out.fails.push('A5 guard speed mult wrong: ' + gs5 / gs0);
  if (Math.abs(dt5 / dt0 - 1.28) > 1e-6) out.fails.push('A5 detection mult wrong: ' + dt5 / dt0);
  // unlock gate is upgrades-only
  const m = G.meta, savedUpg = JSON.stringify(m.upg), savedUnlock = m.ascUnlocked;
  for (const u of G.UPGRADES) m.upg[u.id] = 0; m.ascUnlocked = 0;
  if (G.isMetaMaxed()) out.fails.push('isMetaMaxed true with zero upgrades');
  G.refreshAscUnlock(); if (G.ascUnlocked !== 0) out.fails.push('unlocked while not maxed');
  for (const u of G.UPGRADES) m.upg[u.id] = u.max;
  if (!G.isMetaMaxed()) out.fails.push('isMetaMaxed false when all upgrades maxed');
  G.refreshAscUnlock(); if (G.ascUnlocked < 1) out.fails.push('Ascension 1 did not unlock at max upgrades');
  m.upg = JSON.parse(savedUpg); m.ascUnlocked = savedUnlock;   // restore
  out.log.push('ascension: identity/sentinel/scaling/unlock all checked');

  // ---- Daily ----
  const dk = G.dayKey();
  if (G.daySeed('2020-5-5') !== G.daySeed('2020-5-5')) out.fails.push('daySeed not deterministic');
  const s7 = G.daySeed('2020-5-5');
  if (G.codeToSeed(G.seedToCode(s7)) !== s7) out.fails.push('seed code roundtrip broken');
  const md = G.meta.daily, saveD = JSON.stringify(md);
  md.playedDay = G.yesterKey(); md.streak = 3; G.dailyMode = true; G.recordDaily(false);
  if (md.streak !== 4) out.fails.push('streak did not increment from yesterday: ' + md.streak);
  if (md.playedDay !== dk) out.fails.push('playedDay not set to today');
  if (!G.dailyPlayedToday()) out.fails.push('dailyPlayedToday false after record');
  if (G.dailyMode) out.fails.push('dailyMode not cleared after record');
  md.playedDay = '2000-1-1'; md.streak = 9; G.dailyMode = true; G.recordDaily(false);
  if (md.streak !== 1) out.fails.push('streak did not reset after a gap: ' + md.streak);
  Object.assign(md, JSON.parse(saveD));   // restore
  out.log.push('daily: seed determinism, code roundtrip, streak inc/reset all checked');

  // ---- Tier 2: mutators + ladder ----
  if (G.weeklyMutator().id !== G.weeklyMutator().id) out.fails.push('weekly mutator not deterministic');
  if (!G.MUTATORS.some(m => m.id === G.weeklyMutator().id)) out.fails.push('weekly mutator not from the table');
  const ladder = G.dailyAscension();
  if (!(ladder >= 0 && ladder <= 10)) out.fails.push('daily ladder out of range: ' + ladder);
  if (JSON.stringify(G.DAILY_LADDER.map(v => v >= 0 && v <= 10)).includes('false')) out.fails.push('ladder table has out-of-range values');
  G.dailyMutator = { layout: 'rooms' };
  let anyArena = false; for (const s of SEEDS) { build(s); if (!gv()) anyArena = true; }
  if (anyArena) out.fails.push('mutator layout:rooms did not force a room grid on every seed');
  G.dailyMutator = { layout: 'arena' };
  let anyRoom = false; for (const s of SEEDS) { build(s); if (gv()) anyRoom = true; }
  if (anyRoom) out.fails.push('mutator layout:arena did not force an arena on every seed');
  G.dailyMutator = {};   // restore
  out.log.push('tier2: mutator determinism, ladder range, forced layouts checked');

  // ---- Room grammar: deep loot gravitates to deep rooms ----
  let deepSum = 0, deepN = 0, shSum = 0, shN = 0, heartFails = 0, rseeds = 0;
  for (const s of SEEDS) {
    build(s); if (!gv()) continue; const g = gv(); rseeds++;
    const grad = l => g.gradient(g.regionOf(l.x, l.y));
    for (const l of G.loot) {
      if (l.plat >= 0) continue;
      if (['loud', 'cursed', 'royal', 'mythic', 'artifact'].includes(l.kind)) { deepSum += grad(l); deepN++; }
      else if (['common', 'valuable'].includes(l.kind)) { shSum += grad(l); shN++; }
    }
    const heart = G.loot.find(l => l.kind === 'mythic');
    if (heart && grad(heart) < 0.5) heartFails++;
  }
  if (deepN && shN) {
    const da = deepSum / deepN, sa = shSum / shN;
    out.log.push(`room grammar: deep loot avg gradient ${da.toFixed(2)} vs bulk ${sa.toFixed(2)} (${rseeds} room seeds)`);
    if (da <= sa) out.fails.push(`deep loot not biased deeper than bulk (${da.toFixed(2)} <= ${sa.toFixed(2)})`);
  }
  if (heartFails > Math.ceil(rseeds * 0.5)) out.fails.push(`vault heart not in a deep room (${heartFails}/${rseeds})`);

  // ---- Severing: greed closes loop doors, telegraphed, connected, reversible ----
  let severTested = 0;
  for (const s of SEEDS) {
    build(s); if (!gv()) continue; const g = gv();
    if (!g.loopDoors.length) continue;
    const exR = g.openRect(g.exit); G.player.x = exR.x + exR.w / 2; G.player.y = exR.y + exR.h / 2;
    G.resetSever(); G.carriedValue = G.runLootTotal;            // max greed → crosses thresholds
    if (!G.severCandidates().length) continue;                 // no fair target for this seed; fine
    severTested++;
    let telegraphed = false;
    for (let i = 0; i < 20 && !telegraphed; i++) { G.updateSever(0.02); if (G.severTele) telegraphed = true; }
    if (!telegraphed) { out.fails.push(`seed ${s}: no telegraph despite candidates`); continue; }
    const wallsBefore = G.walls.length;
    for (let i = 0; i < 200 && G.severTele; i++) G.updateSever(0.02);   // run out the telegraph
    if (G.walls.length <= wallsBefore) out.fails.push(`seed ${s}: telegraphed door never closed`);
    const seen = { [g.exit]: 1 }, q = [g.exit];
    while (q.length) { const c = q.shift(); for (const n of g.adj[c]) if (!seen[n]) { seen[n] = 1; q.push(n); } }
    if (Object.keys(seen).length !== g.cols * g.rows) out.fails.push(`seed ${s}: severing DISCONNECTED the vault`);
    const closed = g.loopDoors.filter(d => d.state === 'closed');
    if (closed.some(d => !g.loopKeys.includes(d.key))) out.fails.push(`seed ${s}: severed a non-loop (tree) door`);
    const openBefore = g.loopDoors.filter(d => d.state === 'open').length;
    G.carriedValue = 0; for (let i = 0; i < 12; i++) G.updateSever(0.02);   // shed loot → reopen
    if (g.loopDoors.filter(d => d.state === 'open').length <= openBefore) out.fails.push(`seed ${s}: shedding loot did not reopen a door`);
  }
  out.log.push(`severing: telegraph->close, stays connected, loop-only, reversible (${severTested} seeds)`);

  // ---- Threat variety: the watchdog spawns ----
  build(SEEDS[0]);
  if (!G.guards.some(g => g.dog)) out.fails.push('no watchdog spawned');
  else out.log.push('threats: watchdog present (hunts by noise)');

  // ---- Special rooms: boon shrine ----
  let shrineSeen = false;
  for (const s of SEEDS) { build(s); if (gv() && G.loot.some(l => l.kind === 'shrine')) { shrineSeen = true; break; } }
  if (!shrineSeen) out.fails.push('no boon shrine spawned across room-grid seeds');
  else out.log.push('special rooms: boon shrine present');

  // ---- Rival thief (works ~half of nights, seeded per vault) ----
  let rivalSeed = null, rivalNights = 0, quietNights = 0;
  for (const s of SEEDS) { build(s);
    if (G.rivals.length) { rivalNights++; if (rivalSeed === null) rivalSeed = s; } else quietNights++; }
  if (!rivalNights) out.fails.push('no rival thief spawned on ANY seed');
  if (!quietNights) out.fails.push('rival present on every seed — the presence gate is not firing');
  if (rivalSeed !== null) {
    build(rivalSeed); const before = G.rivals.length;
    build(rivalSeed);
    if (G.rivals.length !== before) out.fails.push('rival presence not deterministic for the same seed');
    for (let i = 0; i < 1500; i++) G.updateRivals(0.05);       // ~75s of sim
    const stolen = G.loot.filter(l => l.stolen).length;
    if (stolen <= 0) out.fails.push('rival stole nothing over a long sim');
    if (G.rivalHaul <= 0) out.fails.push('rival haul is zero');
    if (G.loot.some(l => l.stolen && (l.kind === 'mythic' || l.kind === 'artifact' || l.kind === 'shrine')))
      out.fails.push('rival stole a protected prize (Heart/artifact/shrine)');
    out.log.push(`rival: ${rivalNights}/${SEEDS.length} nights worked, stole ${stolen} items worth $${G.rivalHaul}`);
  }

  // ---- Level-design depth: strongboxes ----
  G.meta.runs = 30;   // the unlock ladder gates secrets — test as a full veteran
  build(SEEDS[0]); const chestN = G.chests.length;
  build(SEEDS[0]);
  if (G.chests.length !== chestN) out.fails.push('chest count not deterministic for the same seed');
  if (!chestN) out.fails.push('no strongbox spawned (should always be at least one)');
  else {
    const c = G.chests[0];
    if (!c.items.length || !c.items.every(l => l.hidden)) out.fails.push('chest contents not hidden before opening');
    G.player.x = c.x; G.player.y = c.y; G.player.plat = -1;
    for (let i = 0; i < 30 && !c.open; i++) G.updateSecrets(0.05);   // ~1.5s dwell
    if (!c.open) out.fails.push('chest did not open after dwelling next to it');
    else if (c.items.some(l => l.hidden)) out.fails.push('chest loot still hidden after opening');
    else out.log.push(`chests: ${chestN}/vault (deterministic), dwell-open spills ${c.items.length} pieces`);
  }

  // ---- Hidden stash: some vaults, revealed + pried on approach ----
  let stashSeed = null, stashNights = 0;
  for (const s of SEEDS) { build(s); if (G.stashes.length) { stashNights++; if (stashSeed === null) stashSeed = s; } }
  if (stashSeed === null) out.fails.push('no hidden stash across all seeds');
  else if (stashNights === SEEDS.length) out.fails.push('stash on every seed — the 60% gate is not firing');
  else {
    build(stashSeed); const st = G.stashes[0];
    if (st.items.some(l => !l.hidden)) out.fails.push('stash loot visible before discovery');
    G.player.x = st.x; G.player.y = st.y; G.player.plat = -1;
    G.updateSecrets(0.05);
    if (!st.taken || st.items.some(l => l.hidden)) out.fails.push('stash not pried open on walk-over');
    else out.log.push(`stash: ${stashNights}/${SEEDS.length} vaults keep one; shimmer + pry works`);
  }

  // ---- Found-tool crate: swaps the kit for the night ----
  let cacheSeed = null, cacheNights = 0;
  for (const s of SEEDS) { build(s); if (G.toolCache) { cacheNights++; if (cacheSeed === null) cacheSeed = s; } }
  if (cacheSeed === null) out.fails.push('no tool crate across all seeds');
  else {
    build(cacheSeed); const tc = G.toolCache;
    G.player.x = tc.x; G.player.y = tc.y; G.player.plat = -1;
    G.updateSecrets(0.05);
    if (tc.taken) out.fails.push('tool crate swapped instantly — the dwell confirm is gone');
    for (let i = 0; i < 15 && !tc.taken; i++) G.updateSecrets(0.05);   // ~0.75s dwell > 0.6s
    if (!tc.taken || G.runTool !== tc.id) out.fails.push('tool crate did not swap after dwelling (runTool=' + G.runTool + ')');
    else if (G.toolCharges <= 0) out.fails.push('found tool came with no charges');
    else out.log.push(`found tool: ${cacheNights}/${SEEDS.length} vaults, dwell-to-swap, ${tc.id} ×${G.toolCharges} rides tonight`);
  }

  // ---- Ascension twists: ladder gates + bodies actually spawn ----
  G.ascensionLevel = 0;
  if (G.ascTwistOn('hound')) out.fails.push('twist live at Ascension 0');
  G.ascensionLevel = 5;
  if (!(G.ascTwistOn('hound') && G.ascTwistOn('sleeper')) || G.ascTwistOn('watch'))
    out.fails.push('twist ladder wrong at A5 (want hound+sleeper on, watch off)');
  build(SEEDS[1]); const dogsA5 = G.guards.filter(g => g.dog).length;
  G.ascensionLevel = 0; build(SEEDS[1]); const dogsA0 = G.guards.filter(g => g.dog).length;
  if (dogsA5 !== dogsA0 + 1) out.fails.push(`A5 should field exactly one extra hound (${dogsA0} -> ${dogsA5})`);
  else out.log.push(`ascension twists: ladder gates correctly; A5 fields ${dogsA5} hounds vs ${dogsA0}`);

  // ---- Ways out: the Breach (heat opens the east wall) ----
  build(SEEDS[0]);
  if (!G.breach) out.fails.push('no breach seam placed');
  else {
    if (G.breach.open) out.fails.push('breach open at Heat 0');
    let v = 0; for (const l of G.loot) { if (v < 4200) { l.got = true; v += l.value; } }   // greed drives heat
    G.recompute();
    if (G.heatTier < 4) out.fails.push('could not drive Heat to T4 for the breach test (T' + G.heatTier + ')');
    G.updateBreach();
    if (!G.breach.open) out.fails.push('breach did not open at Heat T4+');
    else out.log.push('breach: sealed at T0, cracked open at T' + G.heatTier);
  }

  // ---- Ways out: the Drop Chute (70¢ banked mid-run) ----
  if (!G.chute) out.fails.push('no drop chute placed');
  else {
    const before = G.carriedValue;
    if (before <= 0) out.fails.push('chute test needs a carried haul');
    G.player.x = G.chute.x; G.player.y = G.chute.y; G.player.plat = -1;
    for (let i = 0; i < 25; i++) G.updateSecrets(0.05);   // 1.25s dwell > 0.8s trigger
    if (G.stashedValue <= 0) out.fails.push('chute banked nothing');
    else if (G.loot.some(l => l.got && l.type !== 'heart')) out.fails.push('chute left carried goods behind');
    else {
      // the ghost-loot regression: stashed items must be gone for good —
      // never re-credited by a second dwell (they "respawned on the path")
      const credited = G.stashedValue;
      for (let i = 0; i < 25; i++) G.updateSecrets(0.05);
      if (G.stashedValue !== credited) out.fails.push('a second chute dwell re-credited stashed goods (ghost loot)');
      else out.log.push(`chute: swallowed $${before.toLocaleString()}, credited $${Math.round(credited).toLocaleString()} once (70c, Heart refused, no ghosts)`);
    }
  }

  // ---- The Thieves' Altar: one of three gifts, gated by the unlock ladder ----
  build(SEEDS[2]);
  if (G.doorPicks.length !== 3) out.fails.push('altar should offer exactly 3 gifts (got ' + G.doorPicks.length + ')');
  else {
    const dp = G.doorPicks[0];
    G.player.x = dp.x; G.player.y = dp.y; G.player.plat = -1;
    G.updateSecrets(0.05);
    if (!G.runPerk.id) out.fails.push('altar gift not applied on walk-over');
    else if (!G.doorPicks.every(o => o.taken)) out.fails.push('taking one gift should crumble the others');
    else out.log.push(`altar: 3 gifts, took ${G.runPerk.nm}, the rest crumbled`);
  }
  // fresh saves see none of the secrets — the ladder re-paces the whole arc
  G.meta.runs = 0; build(SEEDS[2]);
  if (G.doorPicks.length || G.chests.length || G.chute || G.trapdoor || G.breach || G.toolCache)
    out.fails.push('a gated secret appeared on a fresh save');
  else out.log.push('ladder: fresh saves start bare — secrets unlock across ~24 jobs');
  G.meta.runs = 30;

  // ---- The Thief's Ledger renders in the trophy room ----
  G.renderLedger();
  const lp = document.getElementById('ledgerPanel');
  if (!lp || !lp.innerHTML.includes('Ledger')) out.fails.push('ledger panel did not render');
  else out.log.push('ledger: career page renders (epithets, nemesis, ends)');

  // ---- Flooded rooms: treasury room-grids drown whole rooms ----
  G.forcedTheme = 'treasury'; G.dailyMutator = { layout: 'rooms' };
  let floodSeed = null;
  for (const s of SEEDS) { build(s); if (G.pools.some(p => p.flooded)) { floodSeed = s; break; } }
  if (floodSeed === null) out.fails.push('no flooded room across treasury room-grid seeds');
  else {
    const fp = G.pools.find(p => p.flooded);
    if (fp.w < 150 || fp.h < 100) out.fails.push('flooded pool is not room-scale (' + fp.w + 'x' + fp.h + ')');
    else out.log.push(`flooded rooms: room-scale water (${fp.w}x${fp.h}) in treasury grids`);
  }
  G.forcedTheme = null; G.dailyMutator = {};

  // ---- The Old Tunnel: one-use drop back to the door, loud ----
  let tunnelSeed = null;
  for (const s of SEEDS) { build(s); if (G.trapdoor) { tunnelSeed = s; break; } }
  if (tunnelSeed === null) out.fails.push('no trapdoor tunnel across seeds');
  else {
    const td = G.trapdoor;
    G.player.x = td.x; G.player.y = td.y; G.player.plat = -1;
    for (let i = 0; i < 15; i++) G.updateSecrets(0.05);
    const distOut = Math.hypot(G.player.x - td.exit.x, G.player.y - td.exit.y);
    if (!td.used) out.fails.push('trapdoor did not fire after dwell');
    else if (distOut > 5) out.fails.push('trapdoor did not deliver the player to its exit (' + distOut.toFixed(0) + 'px off)');
    else out.log.push('tunnel: dwell-drop teleports to the door and collapses (one use)');
  }

  // ---- Locked shutter + brass key ----
  G.dailyMutator = { layout: 'rooms' };
  let lockSeed = null;
  for (const s of SEEDS) { build(s); if (G.lockedDoors.length && G.brassKey) { lockSeed = s; break; } }
  if (lockSeed === null) out.fails.push('no locked shutter + key across room-grid seeds');
  else {
    const ld = G.lockedDoors[0];
    if (ld.state !== 'closed') out.fails.push('locked door is not closed at gen');
    G.player.x = G.brassKey.x; G.player.y = G.brassKey.y; G.player.plat = -1;
    G.updateSecrets(0.05);
    if (!G.hasKey) out.fails.push('brass key not pocketed on touch');
    G.player.x = ld.center.x; G.player.y = ld.center.y;
    G.updateSecrets(0.05);
    if (G.lockedDoors.length || ld.state !== 'open') out.fails.push('brass key did not open the locked shutter');
    else if (G.hasKey) out.fails.push('key not consumed on use');
    else out.log.push('locks: shutter closed at gen, key pockets on touch, turns once, door opens');
  }
  G.dailyMutator = {};

  // ---- Elevation safety: shoves can't strand Jo on a platform (stuck bug) ----
  { let platSeed = null;
    for (const s of SEEDS) { build(s); if (G.platforms.length) { platSeed = s; break; } }
    if (platSeed === null) out.log.push('elevation: no platform seed found — skipped');
    else {
      const P = G.platforms[0];
      // corrupt the state exactly like the reported bug: Jo inside a platform
      // footprint while his state says "ground" — unstick must self-heal it
      G.player.x = P.x + P.w / 2; G.player.y = P.y + P.h / 2; G.player.plat = -1;
      G.unstick(G.player);
      const healed = G.platAt(G.player.x, G.player.y) === G.player.plat || G.stairAt(G.player.x, G.player.y) !== -1;
      if (!healed) out.fails.push('unstick left Jo in a broken elevation state');
      // and a forced shove from open ground must refuse to cross the ledge
      let ok = true, tested = false;
      for (let off = 20; off <= 60 && !tested; off += 10) {
        const gx = P.x - off, gy = P.y + P.h / 2;
        if (!G.isOpen(gx, gy, 14) || G.platAt(gx, gy) !== -1) continue;
        G.player.x = gx; G.player.y = gy; G.player.plat = -1;
        G.forceMovePlayer(off + 30, 0);   // shove straight at the platform
        tested = true;
        if (G.platAt(G.player.x, G.player.y) !== -1) ok = false;
      }
      if (tested && !ok) out.fails.push('a forced shove pushed Jo up onto a platform');
      if (healed && (!tested || ok)) out.log.push('elevation: unstick self-heals, shoves never cross a ledge');
    }
  }
  // ---- The Operation: territory, vault reach, contract fees, client forfeit ----
  {
    const savedBank = G.meta.career ? G.meta.career.banked : 0;
    G.meta.career = G.meta.career || { runs: 0, esc: 0, banked: 0, deaths: {} };

    G.meta.career.banked = 0;                       // tier 0 — one vault only
    if (G.opTier() !== 0) out.fails.push('fresh operation is not at tier 0');
    build(SEEDS[0]);
    if (G.currentThemeKey !== 'mint') out.fails.push('tier 0 opened a location beyond the Old Mint: ' + G.currentThemeKey);
    const w0 = G.WORLD.w, h0 = G.WORLD.h;

    G.meta.career.banked = 500000;                  // full reach
    const topTier = G.OPERATION.length - 1;
    if (G.opTier() !== topTier) out.fails.push('max career banked did not reach the top tier');
    build(SEEDS[0]);
    if (G.WORLD.w <= w0 || G.WORLD.h <= h0) out.fails.push(`vaults did not grow with the Operation (${w0}x${h0} -> ${G.WORLD.w}x${G.WORLD.h})`);
    const grew = (G.WORLD.w / w0).toFixed(2);

    // shared vaults play fair: a pinned/practice seed builds at full reach even at tier 0
    G.meta.career.banked = 0;
    if (G.opTierForVault() !== 0) out.fails.push('opTierForVault leaked full reach into normal play');
    out.log.push(`operation: tier 0 = Mint only, top tier vaults ${grew}x wider, fair-play hook intact`);

    // contracts: fees scale with the tier, and a forfeited client pays 20% less
    G.meta.career.banked = 0; G.meta.forfeit = {};
    const base = G.mkContract(G.TYPE_MAKER.sweep).reward;
    G.meta.career.banked = 500000;
    const rich = G.mkContract(G.TYPE_MAKER.sweep).reward;
    if (rich <= base) out.fails.push(`contract fees did not grow with the Operation (${base} -> ${rich})`);
    G.meta.forfeit = { sweep: 1 };
    const owed = G.mkContract(G.TYPE_MAKER.sweep);
    if (!G.forfeitOn('sweep')) out.fails.push('forfeitOn did not read the client ledger');
    if (!owed.makingGood || owed.reward >= rich) out.fails.push('a forfeited client still paid full price');
    else out.log.push(`operation: contract fees $${base} -> $${rich} by tier; forfeited client pays $${owed.reward}`);
    G.meta.forfeit = {};
    G.meta.career.banked = savedBank;
  }
  G.meta.runs = 0;   // leave the page as we found it
  return out;
});

console.log('layout mix:', res.mix);
res.log.forEach(l => console.log(l));
if (pageErrors.length) { console.log('PAGE ERRORS:'); pageErrors.forEach(e => console.log('  ' + e)); }
if (res.fails.length) { console.log('FAILURES:'); res.fails.forEach(f => console.log('  ' + f)); }
else console.log('\nALL WEB REGION TESTS PASSED (10 seeds, both layout modes)');
await browser.close();
process.exit(res.fails.length || pageErrors.length ? 1 : 0);
