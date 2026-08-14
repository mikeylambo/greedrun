// Economy audit — not a pass/fail test. Drives the REAL run->fence->bank pipeline
// headless at several meta stages and prints gold-per-run, so tuning decisions are
// made on the game's actual math (all multipliers included), not napkin estimates.
//   npm run audit:econ
// Method: per (stage x grab policy x seed): start a real free run, mark loot by a
// value-greedy policy, set peakHeat = final heat tier (conservative — real runs
// usually peak higher), extract, click the best buyer chips in the fence UI, bank,
// and measure the meta.gold delta.
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGE ERROR:', String(e)));
await page.goto('file://' + root + '/web/index.html');
await page.waitForTimeout(300);
await page.click('#startBtn'); await page.click('#nextRunBtn'); await page.click('#freeRunBtn');
await page.waitForTimeout(150);

const SEEDS = [1, 2, 7, 42, 1337, 90210, 5, 88, 314159, 271828, 11, 23, 61, 97, 131];

const STAGES = {
  FRESH: { upg: {}, coll: {}, tools: 0, runs: 0, mods: 0, noto: 0, asc: 0 },
  MID:   { upg: { feet: 3, straps: 3, boots: 2, pockets: 2, contacts: 2, luck: 1, cool: 1 },
           coll: { idol: 1, relic: 1 }, tools: 2, runs: 12, mods: 2, noto: 2, asc: 0 },
  MAX:   { upg: { feet: 5, straps: 5, boots: 5, pockets: 4, contacts: 5, luck: 3, cool: 3, revive: 1, landing: 1, scanner: 1 },
           coll: { idol: 5, relic: 5, jewel: 5, relicart: 5, heart: 5 }, tools: 5, runs: 60, mods: 5, noto: 4, asc: 0 },
  'MAX+A5':  { like: 'MAX', asc: 5 },
  'MAX+A10': { like: 'MAX', asc: 10 },
};
const POLICIES = { modest: 0.35, greedy: 0.75, clear: 1.0 };
const resolveStage = n => { const s = STAGES[n]; return s.like ? { ...STAGES[s.like], asc: s.asc } : s; };

const results = {};
for (const stageName of Object.keys(STAGES)) {
  const stage = resolveStage(stageName);
  results[stageName] = {};
  for (const [polName, frac] of Object.entries(POLICIES)) {
    const runs = [];
    for (const seed of SEEDS) {
      const out = await page.evaluate(([stage, frac, seed]) => {
        const G = window.__greed, M = G.meta;
        // ---- set the meta stage ----
        for (const k in M.upg) M.upg[k] = stage.upg[k] || 0;
        for (const k in M.collection) M.collection[k] = stage.coll[k] || 0;
        ['smoke', 'decoy', 'grapple', 'lockpick', 'portal'].forEach((t, i) => M.tools[t] = i < stage.tools ? 1 : 0);
        M.equippedTool = ''; M.rep = {}; M.curseDebt = stage.noto; M.runs = stage.runs;
        M.modsCleared = {}; ['still', 'gilded', 'curfew', 'fog', 'purse'].slice(0, stage.mods).forEach(id => M.modsCleared[id] = 1);
        M.ascUnlocked = stage.asc; G.selectedAscension = stage.asc;
        // ---- real free run at this seed ----
        G.activeContract = null; G.dailyMode = false;
        G.build(seed);       // pins runSeed
        G.startRun();        // applies ascension + rebuilds at the same seed
        // ---- grab policy: value-greedy until frac of the vault is carried ----
        const items = [...G.loot].sort((a, b) => b.value - a.value);
        const target = frac * G.runLootTotal;
        let carried = 0;
        for (const l of items) {
          if (frac < 1 && l.hidden) continue;     // the Heart needs "one more thing"
          if (carried >= target) break;
          l.got = true; if (l.hidden) l.hidden = false; carried += l.value;
        }
        G.recompute();
        G.peakHeat = G.heatTier;                  // conservative: real peaks run higher
        G.vaultCleared = G.loot.every(l => l.got || l.stolen);
        const before = M.gold;
        G.endRun(true);
        document.getElementById('continueBtn').click();
        // ---- fence: best non-noble per item, then give the Noble its best piece ----
        if (document.getElementById('fence').classList.contains('on')) {
          const pay = el => parseInt((el.querySelector('.bp').textContent || '').replace(/[^0-9]/g, '')) || 0;
          const itemIdx = () => [...new Set([...document.querySelectorAll('.buyer')].map(b => b.dataset.i))];
          for (const i of itemIdx()) {
            const chips = [...document.querySelectorAll(`.buyer[data-i="${i}"]`)].filter(c => !/Noble/.test(c.textContent));
            const best = chips.sort((a, b) => pay(b) - pay(a))[0];
            if (best) best.click();
          }
          let bestGain = 0, bestI = null;
          for (const i of itemIdx()) {
            const chips = [...document.querySelectorAll(`.buyer[data-i="${i}"]`)];
            const noble = chips.find(c => /Noble/.test(c.textContent));
            const cur = chips.find(c => c.classList.contains('sel'));
            if (noble && cur && pay(noble) - pay(cur) > bestGain) { bestGain = pay(noble) - pay(cur); bestI = i; }
          }
          if (bestI != null) [...document.querySelectorAll(`.buyer[data-i="${bestI}"]`)].find(c => /Noble/.test(c.textContent)).click();
          document.getElementById('bankBtn').click();
        }
        const rec = G.runLog[G.runLog.length - 1];
        return { banked: M.gold - before, haul: rec.haul, heat: rec.pk, mod: rec.mod };
      }, [stage, frac, seed]);
      runs.push(out);
    }
    const avg = f => Math.round(runs.reduce((a, r) => a + f(r), 0) / Math.max(1, runs.length));
    results[stageName][polName] = { banked: avg(r => r.banked), haul: avg(r => r.haul), heat: avg(r => r.heat) };
  }
}

console.log('\nECONOMY AUDIT — real-pipeline gold per run (avg over ' + SEEDS.length + ' seeds)\n');
console.log('stage      | policy  | avg haul | avg banked | avg peakHeat');
console.log('-----------|---------|----------|------------|-------------');
for (const s of Object.keys(results)) for (const p of Object.keys(results[s])) {
  const r = results[s][p];
  console.log(s.padEnd(11) + '| ' + p.padEnd(8) + '| $' + String(r.haul).padEnd(8) + '| $' + String(r.banked).padEnd(10) + '| T' + r.heat);
}
const sinks = await page.evaluate(() => {
  const G = window.__greed;
  let upg = 0; for (const u of G.UPGRADES) for (let l = 0; l < u.max; l++) upg += Math.round(u.base * Math.pow(1.55, l));
  const tools = G.TOOLS.reduce((a, t) => a + t.cost, 0);
  return { upg, tools };
});
console.log('\nsinks: upgrades $' + sinks.upg.toLocaleString() + ' · tools $' + sinks.tools.toLocaleString()
  + ' · trophy restores ~$43,000 · total ~$' + (sinks.upg + sinks.tools + 43000).toLocaleString());
await browser.close();
