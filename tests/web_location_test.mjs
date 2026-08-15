// Headless verification for location identity (per-theme map hazards).
//   node tests/web_location_test.mjs
// Forces each theme via the __greed hook and asserts: treasury flood pools slow
// and muffle the player (and splash), fortress gusts cycle and actually shove a
// stationary player, undercity darkness trims guard detection by exactly 15%,
// and mint presses cycle warn->slam, crush the player for a heart, and stun guards.
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
  const out = { fails: [], log: [] };
  const step = dt => G.updateHazards(dt);

  // ---- free runs still mix locations (no forcing) ----
  const seen = new Set();
  for (const s of [1, 2, 7, 42, 1337, 90210, 5, 88, 314159, 271828, 11, 23]) { G.build(s); seen.add(G.currentThemeKey); }
  if (seen.size < 3) out.fails.push('theme variety too low across seeds: ' + [...seen].join(','));
  else out.log.push('themes: free runs mix locations (' + [...seen].join(', ') + ')');

  // ---- Sunken Treasury: pools slow + muffle, with splash feedback ----
  G.forcedTheme = 'treasury'; G.build(11);
  if (G.currentThemeKey !== 'treasury') out.fails.push('forcedTheme hook ignored');
  if (G.pools.length < 3) out.fails.push('treasury spawned only ' + G.pools.length + ' pools');
  else {
    const dry = G.speedNow();
    const p = G.pools[0];
    G.player.x = p.x + p.w / 2; G.player.y = p.y + p.h / 2; G.player.plat = -1;
    const before = G.particles.length;
    step(0.016);
    const wet = G.speedNow();
    if (!G.inWater) out.fails.push('standing in a pool did not set inWater');
    if (Math.abs(wet / dry - 0.75) > 0.01) out.fails.push('water speed ratio ' + (wet / dry).toFixed(3) + ' (want 0.75)');
    if (G.particles.length <= before) out.fails.push('no splash particles on entering water');
    G.player.x = 60; G.player.y = 60; step(0.016);
    if (G.inWater) out.fails.push('leaving the pool did not clear inWater');
    out.log.push('treasury: ' + G.pools.length + ' pools; wade = 0.75x speed, splash on entry, exits clean');
  }

  // ---- Cliffside Fortress: gusts cycle and shove a stationary player ----
  G.forcedTheme = 'fortress'; G.build(7);
  {
    const sx = G.player.x, sy = G.player.y;
    let sawActive = false;
    for (let i = 0; i < 300; i++) { step(0.1); if (G.gust.activeT > 0) sawActive = true; }   // ~30s
    const moved = Math.hypot(G.player.x - sx, G.player.y - sy);
    if (!sawActive) out.fails.push('no gust activated in 30s of fortress sim');
    if (moved < 4) out.fails.push('gust never moved the player (moved ' + moved.toFixed(1) + 'px)');
    else out.log.push('fortress: gust cycle fired, shoved an idle player ' + moved.toFixed(0) + 'px');
  }

  // ---- Undercity: dark, and guard detection trimmed by exactly 15% ----
  G.forcedTheme = 'undercity'; G.build(5);
  const detDark = G.detectRadius(), isDark = G.dark;
  G.forcedTheme = 'mint'; G.build(5);
  const detLit = G.detectRadius();
  if (!isDark) out.fails.push('undercity did not set dark');
  else if (Math.abs(detDark / detLit - 0.85) > 1e-6) out.fails.push('dark detect ratio ' + (detDark / detLit).toFixed(4) + ' (want 0.85)');
  else out.log.push('undercity: dark on, guard detection 0.85x (same-seed control)');

  // ---- presentation: per-theme decor + landmark, seeded-deterministic ----
  {
    G.forcedTheme = 'treasury'; G.build(11);
    const sig1 = G.decor.map(d => d.t + Math.round(d.x) + ',' + Math.round(d.y)).join('|');
    const types1 = new Set(G.decor.map(d => d.t));
    const lm1 = G.landmark && G.landmark.t;
    G.build(11);
    const sig2 = G.decor.map(d => d.t + Math.round(d.x) + ',' + Math.round(d.y)).join('|');
    if (!G.decor.length) out.fails.push('no decor generated');
    if (sig1 !== sig2) out.fails.push('decor is not seed-deterministic');
    if (lm1 !== 'basin') out.fails.push('treasury landmark wrong: ' + lm1);
    G.forcedTheme = 'mint'; G.build(11);
    const types2 = new Set(G.decor.map(d => d.t));
    const distinct = [...types2].some(t => !types1.has(t));
    if (!distinct) out.fails.push('mint decor kit identical to treasury');
    if (!(G.landmark && G.landmark.t === 'die')) out.fails.push('mint landmark wrong');
    if (!out.fails.some(f => /decor|landmark/.test(f)))
      out.log.push('dressing: seeded decor per theme (' + [...types1].join(',') + ' vs ' + [...types2].join(',') + '), landmarks placed');
  }

  // ---- Old Mint: presses cycle, crush the player, stun guards ----
  // (still built as mint from the control build above)
  if (G.presses.length < 2) out.fails.push('mint spawned only ' + G.presses.length + ' presses');
  else {
    let sawWarn = false, sawSlam = false;
    for (let i = 0; i < 400 && !(sawWarn && sawSlam); i++) { step(0.05);
      for (const pr of G.presses) { if (pr.phase === 'warn') sawWarn = true; if (pr.phase === 'slam') sawSlam = true; } }
    if (!sawWarn || !sawSlam) out.fails.push('press cycle incomplete (warn=' + sawWarn + ' slam=' + sawSlam + ')');
    // crush: stand on a press at the end of its warn
    const pr = G.presses[0];
    G.player.hp = 3; G.player.inv = 0; G.player.plat = -1;
    G.player.x = pr.x; G.player.y = pr.y;
    pr.phase = 'warn'; pr.t = 0.99;
    step(0.02);
    if (pr.phase !== 'slam') out.fails.push('press did not slam after warn (phase=' + pr.phase + ')');
    if (G.player.hp !== 2) out.fails.push('press crush did not cost a heart (hp=' + G.player.hp + ')');
    if (!(G.player.inv > 0)) out.fails.push('crush did not grant i-frames');
    // stun: park a guard under another press
    const g = G.guards[0], pr2 = G.presses[1];
    G.player.x = 60; G.player.y = 60;
    g.x = pr2.x; g.y = pr2.y; g.stun = 0;
    pr2.phase = 'warn'; pr2.t = 0.99;
    step(0.02);
    if (!(g.stun > 0)) out.fails.push('press did not stun the guard under it');
    else out.log.push('mint: ' + G.presses.length + ' presses; warn->slam cycle, crush costs a heart, guards get stunned');
  }
  return out;
});

res.log.forEach(l => console.log(l));
if (pageErrors.length) { console.log('PAGE ERRORS:'); pageErrors.forEach(e => console.log('  ' + e)); }
if (res.fails.length) { console.log('FAILURES:'); res.fails.forEach(f => console.log('  ' + f)); }
else console.log('\nALL WEB LOCATION TESTS PASSED');
await browser.close();
process.exit(res.fails.length || pageErrors.length ? 1 : 0);
