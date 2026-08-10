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
    for (const k in g.doors) { const d = g.doors[k]; if (!isOpen(d.x, d.y, 14)) out.fails.push(`seed ${s}: doorway ${k} blocked`); }
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
  return out;
});

console.log('layout mix:', res.mix);
res.log.forEach(l => console.log(l));
if (pageErrors.length) { console.log('PAGE ERRORS:'); pageErrors.forEach(e => console.log('  ' + e)); }
if (res.fails.length) { console.log('FAILURES:'); res.fails.forEach(f => console.log('  ' + f)); }
else console.log('\nALL WEB REGION TESTS PASSED (10 seeds, both layout modes)');
await browser.close();
process.exit(res.fails.length || pageErrors.length ? 1 : 0);
