// Headless verification for the endgame GDD systems: THE VAULT REMEMBERS
// (max-Heat tier), the multi-stage Legendary Heist, and skill-lane capstones.
//   node tests/web_endgame_test.mjs
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

const fails = [], log = [];

// ---- skill lanes render in the hideout ----
await page.click('#startBtn');
await page.waitForTimeout(150);
const laneUi = await page.evaluate(() => ({
  heads: document.querySelectorAll('.lane-head').length,
  wb: document.getElementById('wbHead').textContent,
  cards: document.getElementById('fenceGrid').querySelectorAll('.fence').length,
}));
if (laneUi.heads !== 4) fails.push('expected 4 lane headers, got ' + laneUi.heads);
if (!/Trickster/.test(laneUi.wb)) fails.push('workbench header lost its Trickster identity');
if (laneUi.cards !== 10) fails.push('lane grouping lost upgrades (' + laneUi.cards + '/10)');
if (!fails.length) log.push('lanes: 4 headers + Trickster workbench, all 10 upgrades present');

// ---- enter a run for the live-system tests ----
await page.click('#nextRunBtn');
await page.click('#freeRunBtn');
await page.waitForTimeout(150);

const core = await page.evaluate(() => {
  const G = window.__greed;
  const out = { fails: [], log: [] };

  // ---- THE VAULT REMEMBERS: wakes at T6, pings guards, settles when greed drops ----
  G.build(21);
  for (const l of G.loot) l.got = true;          // carry the whole vault -> T6
  G.recompute();
  G.updateVaultRemembers(0.02);
  if (!G.vaultAwake) out.fails.push('vault did not wake at Heat T6');
  if (Math.abs(G.extractNeed() - 1.1) > 1e-9) out.fails.push('awake vault should hold the exit (need=' + G.extractNeed() + ')');
  G.updateVaultRemembers(2.6);                   // cross the whisper pulse
  const pinged = G.guards.filter(g => g.lkp && Math.hypot(g.lkp.x - G.player.x, g.lkp.y - G.player.y) < 2).length;
  if (pinged < G.guards.length - 1) out.fails.push('whisper pinged only ' + pinged + '/' + G.guards.length + ' guards');
  for (const l of G.loot) l.got = false;         // shed everything
  G.recompute(); G.updateVaultRemembers(0.02);
  if (G.vaultAwake) out.fails.push('vault did not settle after shedding greed');
  if (Math.abs(G.extractNeed() - 0.6) > 1e-9) out.fails.push('extract need did not recover');
  if (!out.fails.length) out.log.push('vault remembers: wakes at T6, pings every guard, settles when greed drops');

  // ---- capstones ----
  const U = G.meta.upg;
  Object.keys(U).forEach(k => U[k] = 0);
  if (G.searchMul() !== 1) out.fails.push('Cold Trail active without the lane');
  U.feet = 5; U.boots = 5; U.landing = 1;
  if (G.searchMul() !== 0.7) out.fails.push('Cold Trail capstone inactive when Thief lane maxed');
  // Bottomless Bags: exactly 8 weight -> zero drag
  U.straps = 5; U.pockets = 4;
  G.build(22);
  const mark = kinds => { for (const l of G.loot) l.got = false;
    for (const k of kinds) { const it = G.loot.find(l => l.type === k && !l.got); if (it) it.got = true; } G.recompute(); };
  mark(['idol', 'gem', 'coin']);                  // 5+2+1 = 8 weight
  if (Math.abs(G.speedNow() - G.player.baseSpeed) > 1e-9) out.fails.push('Bottomless Bags: 8 weight should carry free');
  U.pockets = 3;                                  // break the lane
  if (!(G.speedNow() < G.player.baseSpeed)) out.fails.push('drag should return when the Smuggler lane is broken');
  U.pockets = 4;
  // The Long Game: contracts +15%
  G.meta.rep = {};
  U.contacts = 5; U.cool = 3; U.revive = 1;
  let silent = null;
  for (let i = 0; i < 40 && !silent; i++) silent = G.genContracts(3).find(c => c.type === 'silent');
  if (!silent) out.fails.push('no silent contract rolled in 40 boards');
  else if (silent.reward !== Math.round(750 * 1.15)) out.fails.push('Long Game reward ' + silent.reward + ' (want 863)');
  // Appraiser's Eye: the fake can't inflate Heat, but the scam survives
  U.scanner = 1; U.luck = 3;
  let fake = null;
  for (const s of [1, 2, 3, 4, 5, 6, 7, 8]) { G.build(s); fake = G.loot.find(l => l.kind === 'fake'); if (fake) break; }
  if (!fake) out.fails.push('no fake found for Appraiser test');
  else {
    if (!fake.spotted) out.fails.push('Appraiser’s Eye did not spot the fake');
    for (const l of G.loot) l.got = false;
    fake.got = true; G.recompute();
    if (G.carriedValue !== 40) out.fails.push('spotted fake still inflates the bag ($' + G.carriedValue + ')');
    const noble = G.buyersFor('fake', fake.value).find(b => b.id === 'noble');
    if (!noble || noble.payout < 500) out.fails.push('the noble scam should survive the Appraiser’s Eye');
  }
  // Trickster: +1 charge with every tool owned
  for (const t of G.TOOLS) G.meta.tools[t.id] = 1;
  G.meta.equippedTool = 'smoke';
  G.build(23);
  if (G.toolCharges !== 3) out.fails.push('Sleight of Hand charge bonus missing (charges=' + G.toolCharges + ')');
  Object.keys(U).forEach(k => U[k] = 0);
  G.meta.tools = { smoke: 0, decoy: 0, grapple: 0, lockpick: 0, portal: 0 }; G.meta.equippedTool = '';
  if (!out.fails.length) out.log.push('capstones: Cold Trail, Bottomless Bags, Long Game, Appraiser’s Eye, Sleight of Hand');
  return out;
});
core.fails.forEach(f => fails.push(f)); core.log.forEach(l => log.push(l));

// ---- Legendary Heist: three stages, live, through real frames ----
await page.evaluate(() => {
  const G = window.__greed;
  G.meta.rep = {};
  let heart = null;
  for (let i = 0; i < 60 && !heart; i++) heart = G.genContracts(3).find(c => c.type === 'heart');
  window.__heartC = heart;
});
const heartOk = await page.evaluate(() => window.__heartC && window.__heartC.reward === 2400);
if (!heartOk) fails.push('Legendary Heist reward is not 2400');
await page.evaluate(() => { const G = window.__greed; G.activeContract = window.__heartC; G.startRun(); });
await page.waitForTimeout(150);
let st = await page.evaluate(() => { const G = window.__greed;
  const h = G.loot.find(l => l.type === 'heart');
  return { stage: G.heistStage, hidden: h.hidden, state: G.state }; });
if (st.stage !== 1 || st.hidden) fails.push('heist did not start at stage 1 with the Heart revealed (' + JSON.stringify(st) + ')');

const hop = async fn => { await page.evaluate(fn); await page.waitForTimeout(220); };
await hop(() => { const G = window.__greed; const h = G.loot.find(l => l.type === 'heart');
  G.player.inv = 999; G.player.x = h.x + 150; G.player.y = h.y; G.player.plat = -1; });
st = await page.evaluate(() => window.__greed.heistStage);
if (st !== 2) fails.push('reaching the chamber did not advance to stage 2 (stage=' + st + ')');
await hop(() => { const G = window.__greed; const h = G.loot.find(l => l.type === 'heart');
  G.player.x = h.x; G.player.y = h.y; });
st = await page.evaluate(() => { const G = window.__greed;
  return { stage: G.heistStage, latches: G.latches.length, sealed: G.exitSealed(), awake: G.vaultAwake }; });
if (st.stage !== 3 || st.latches !== 2) fails.push('taking the Heart did not bolt the vault (' + JSON.stringify(st) + ')');
if (!st.sealed) fails.push('exit not sealed while carrying the Heart at stage 3');
if (!st.awake) fails.push('the vault should Remember while the Heart is carried');
await hop(() => { const G = window.__greed; const L = G.latches[0]; G.player.inv = 999; G.player.x = L.x; G.player.y = L.y; });
await hop(() => { const G = window.__greed; const L = G.latches[1]; G.player.inv = 999; G.player.x = L.x; G.player.y = L.y; });
st = await page.evaluate(() => { const G = window.__greed;
  return { stage: G.heistStage, sealed: G.exitSealed(), broken: G.latches.filter(l => l.broken).length }; });
if (st.stage !== 4 || st.sealed || st.broken !== 2) fails.push('breaking both latches did not open the way (' + JSON.stringify(st) + ')');
else log.push('heist: stage 1 (case) -> 2 (chamber) -> 3 (bolted, vault awake, 2 latches) -> 4 (open)');

// extraction through the long hold (vault still awake with the Heart aboard)
await page.evaluate(() => { const G = window.__greed; G.player.inv = 999;
  G.player.x = G.portal.x; G.player.y = G.portal.y; G.player.plat = -1; });
await page.keyboard.down('e');
await page.waitForTimeout(1600);
await page.keyboard.up('e');
const fin = await page.evaluate(() => { const G = window.__greed;
  return { state: G.state, stats: document.getElementById('resStats').innerHTML }; });
if (fin.state !== 'result') fails.push('extraction did not complete through the awakened hold (state=' + fin.state + ')');
else if (!/2,400/.test(fin.stats)) fails.push('result screen missing the $2,400 contract payout');
else log.push('heist: extracted through the 1.1s awakened hold, contract paid $2,400');

log.forEach(l => console.log(l));
if (pageErrors.length) { console.log('PAGE ERRORS:'); pageErrors.forEach(e => console.log('  ' + e)); }
if (fails.length) { console.log('FAILURES:'); fails.forEach(f => console.log('  ' + f)); }
else console.log('\nALL WEB ENDGAME TESTS PASSED');
await browser.close();
process.exit(fails.length || pageErrors.length ? 1 : 0);
