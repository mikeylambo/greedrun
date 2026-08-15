// Headless verification for the onboarding / information-architecture pass.
//   node tests/web_onboarding_test.mjs
// Fresh save: minimal hideout (no tabs/daily/collection/workbench), "Begin
// Tonight's Job" starts a clean free run directly, contextual tips fire once.
// Veteran save: tabs appear, Gear holds the lanes + Workbench, the Jobs Board
// opens, the Rehearsal screen works, unlock banner shows once for one unlock.
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(String(e)));
await page.goto('file://' + root + '/web/index.html');
await page.waitForTimeout(300);

const fails = [], log = [];
const vis = id => page.evaluate(id => { const e = document.getElementById(id); if (!e) return false;
  const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && r.width > 0 && r.height > 0; }, id);

// ---- fresh save: the minimal Den ----
await page.click('#startBtn');
await page.waitForTimeout(200);
const fresh = { tabs: await vis('shopTabs'), daily: await vis('dailyBtn'), coll: await vis('collectionBtn'),
  teaser: await vis('unlockTeaser'), label: await page.evaluate(() => document.getElementById('nextRunBtn').textContent) };
if (fresh.tabs || fresh.daily || fresh.coll) fails.push('fresh save shows locked sections: ' + JSON.stringify(fresh));
if (!/Begin/.test(fresh.label)) fails.push('fresh nextRunBtn label wrong: ' + fresh.label);
if (!fresh.teaser) fails.push('no unlock teaser for a fresh save');
else log.push('fresh: minimal Den — no tabs/daily/collection, "Begin Tonight\'s Job", teaser visible');

// ---- "Begin Tonight's Job" starts a clean run directly ----
await page.click('#nextRunBtn');
await page.waitForTimeout(250);
const run1 = await page.evaluate(() => ({ state: window.__greed.state, mod: window.__greed.activeMod.id,
  contractsOpen: document.getElementById('contracts').classList.contains('on') }));
if (run1.state !== 'playing' || run1.contractsOpen) fails.push('Begin did not start a run directly: ' + JSON.stringify(run1));
if (run1.mod !== 'clean') fails.push('first run rolled a modifier before the unlock: ' + run1.mod);
else log.push('fresh: Begin starts a clean free run, no jobs board');

// ---- tips fire once at the teachable moment (weight >= 6) ----
await page.evaluate(() => { const G = window.__greed; G.player.inv = 999;
  const heavy = G.loot.filter(l => !l.got && !l.hidden && l.plat === -1 && l.weight >= 2
    && !['artifact', 'shrine', 'living'].includes(l.kind)).slice(0, 4);
  window.__hv = heavy.map(l => G.loot.indexOf(l)); });
for (let i = 0; i < 4; i++) {
  await page.evaluate(i => { const G = window.__greed; const l = G.loot[window.__hv[i]];
    if (l && !l.got) { G.player.x = l.x; G.player.y = l.y; G.player.plat = -1; } }, i);
  await page.waitForTimeout(200);
}
const tips = await page.evaluate(() => ({ load: window.__greed.meta.tips.load | 0, move: window.__greed.meta.tips.move | 0 }));
if (!tips.load) fails.push('weight tip never fired after heavy pickups');
if (!tips.move) fails.push('first-run tip never fired');
else log.push('tips: move + load fired and persisted');

// ---- unlock banner: exactly one fresh unlock announces once ----
await page.evaluate(() => { const G = window.__greed; G.meta.runs = 1; G.meta.seenUnlocks = {}; });
await page.evaluate(() => { window.__greed.endRun(true); });
await page.waitForTimeout(300);
await page.evaluate(() => document.getElementById('continueBtn').click());
await page.waitForTimeout(300);
await page.evaluate(() => { const f = document.getElementById('fence');
  if (f.classList.contains('on')) document.getElementById('bankBtn').click(); });
await page.waitForTimeout(300);
// endRun bumped runs to 2 -> upgrades+contracts fresh; migration rule allows <=2 to banner
const banner1 = await vis('unlockBanner');
await page.click('#menuBtn'); await page.waitForTimeout(150);
await page.click('#startBtn'); await page.waitForTimeout(200);
const banner2 = await vis('unlockBanner');
if (!banner1) fails.push('unlock banner did not show for fresh unlocks');
if (banner2) fails.push('unlock banner showed twice for the same unlocks');
else log.push('unlocks: banner announces once, then stays quiet');

// ---- veteran: tabs, Gear content, jobs board, rehearsal ----
await page.evaluate(() => { const G = window.__greed; G.meta.runs = 10; G.meta.seenUnlocks = { upgrades:1, contracts:1, modifiers:1, tools:1, daily:1, collection:1 }; });
await page.click('#menuBtn'); await page.waitForTimeout(150);
await page.click('#startBtn'); await page.waitForTimeout(200);
const vet = { tabs: await vis('shopTabs'), daily: await vis('dailyBtn'), coll: await vis('collectionBtn') };
if (!vet.tabs || !vet.daily || !vet.coll) fails.push('veteran save missing sections: ' + JSON.stringify(vet));
await page.click('#tabGearBtn'); await page.waitForTimeout(150);
const gear = { lanes: await page.evaluate(() => document.querySelectorAll('.lane-head').length),
  fence: await vis('fenceGrid'), tools: await vis('toolGrid'), denHidden: !(await vis('bankAmt')) };
if (gear.lanes !== 4 || !gear.fence || !gear.tools || !gear.denHidden) fails.push('Gear tab wrong: ' + JSON.stringify(gear));
else log.push('veteran: Den/Gear tabs split correctly (lanes + workbench on Gear)');
await page.click('#tabDenBtn'); await page.waitForTimeout(100);
await page.click('#nextRunBtn'); await page.waitForTimeout(200);
const boardOpen = await page.evaluate(() => document.getElementById('contracts').classList.contains('on'));
if (!boardOpen) fails.push('veteran Choose Tonight\'s Job did not open the board');
await page.click('#jobsBack'); await page.waitForTimeout(150);
// rehearsal: open from the daily card, case a raw seed
const hasRehearse = await page.evaluate(() => !!document.getElementById('rehearseBtn'));
if (!hasRehearse) fails.push('rehearse chip missing from the daily card');
else {
  await page.evaluate(() => document.getElementById('rehearseBtn').click());
  await page.waitForTimeout(150);
  const practiceOpen = await page.evaluate(() => document.getElementById('practice').classList.contains('on'));
  if (!practiceOpen) fails.push('rehearse chip did not open the Rehearsal');
  await page.fill('#seedInput', '42');
  await page.evaluate(() => document.getElementById('seedGo').click());
  await page.waitForTimeout(200);
  const st = await page.evaluate(() => window.__greed.state);
  if (st !== 'playing') fails.push('Rehearsal seed did not start a run (state=' + st + ')');
  else log.push('veteran: jobs board opens, Rehearsal cases seed 42');
}

// ---- the Den must fit its screen (no scrolling on home) ----
await page.evaluate(() => { window.__greed.endRun(true); });
await page.waitForTimeout(250);
await page.evaluate(() => document.getElementById('continueBtn').click());
await page.waitForTimeout(250);
await page.evaluate(() => { const f = document.getElementById('fence');
  if (f.classList.contains('on')) document.getElementById('bankBtn').click(); });
await page.waitForTimeout(250);
const denFit = await page.evaluate(() => { const e = document.getElementById('shop');
  return { sh: e.scrollHeight, ch: e.clientHeight }; });
if (denFit.sh > denFit.ch + 4) fails.push('the Den overflows its screen (' + denFit.sh + ' vs ' + denFit.ch + ')');
else log.push('veteran: the Den fits one screen (' + denFit.sh + '/' + denFit.ch + ')');

log.forEach(l => console.log(l));
if (pageErrors.length) { console.log('PAGE ERRORS:'); pageErrors.forEach(e => console.log('  ' + e)); }
if (fails.length) { console.log('FAILURES:'); fails.forEach(f => console.log('  ' + f)); }
else console.log('\nALL WEB ONBOARDING TESTS PASSED');
await browser.close();
process.exit(fails.length || pageErrors.length ? 1 : 0);
