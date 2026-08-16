// Headless verification for GDD items 1-2-3: the Workbench tool kit, Fake Loot,
// and Reputation-as-system.
//   node tests/web_tools_test.mjs
// Drives each tool through __greed (smoke breaks chases + silences, decoy plants
// bait that pulls patrols, grapple reels loot in, lockpick reopens a severed
// shutter, portal plants a free marker then snaps back), checks the Gilded Fake
// spawns / fences as a scam / baits when dropped, and checks reputation standing
// shapes the job board (+25% named jobs) and buyer prices (+10%).
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
// enter a real run: useTool() only fires while state === 'playing'
await page.evaluate(() => { window.__greed.meta.runs = 10; });   // veteran save: full hideout unlocked
await page.click('#startBtn');
await page.click('#nextRunBtn');
await page.click('#freeRunBtn');
await page.waitForTimeout(150);

const res = await page.evaluate(async () => {
  const G = window.__greed;
  const out = { fails: [], log: [] };
  // own ONLY the tool under test — owning all five lights the Trickster capstone (+1 charge)
  const equip = id => { G.meta.tools = { smoke: 0, decoy: 0, grapple: 0, lockpick: 0, portal: 0 };
    G.meta.tools[id] = 1; G.meta.equippedTool = id; };

  // ---- Smoke Bomb: breaks a chase, silences the bag ----
  equip('smoke'); G.build(3);
  if (G.toolCharges !== 2) out.fails.push('smoke charges ' + G.toolCharges + ' (want 2)');
  const g0 = G.guards[0];
  g0.state = 'chase'; g0.alert = 1; g0.x = G.player.x + 60; g0.y = G.player.y;
  G.useTool();
  if (g0.state !== 'patrol') out.fails.push('smoke did not break the chase (state=' + g0.state + ')');
  if (!(G.smokeT > 0)) out.fails.push('smoke did not start the silence window');
  if (G.toolCharges !== 1) out.fails.push('smoke did not consume a charge');
  else out.log.push('smoke: breaks chases, silences 3s, consumes a charge');

  // ---- Decoy Bag: plants bait, patrols go look ----
  equip('decoy'); G.build(4);
  const g1 = G.guards[0];
  g1.x = G.player.x + 150; g1.y = G.player.y; g1.state = 'patrol';
  G.useTool();
  if (!G.baits.length) out.fails.push('decoy planted no bait');
  else if (g1.state !== 'investigate') out.fails.push('decoy did not pull the patrol (state=' + g1.state + ')');
  else out.log.push('decoy: bait planted, patrol pulled to the glitter');

  // ---- Grapple Hook: reels the nearest visible loot to your feet ----
  equip('grapple'); G.build(5);
  const coin = G.loot.find(l => !l.got && !l.hidden && l.kind === 'common');
  coin.x = G.player.x + 120; coin.y = G.player.y; coin.plat = -1;
  G.useTool();
  if (coin.x !== G.player.x || coin.y !== G.player.y) out.fails.push('grapple did not reel the coin in');
  if (G.toolCharges !== 2) out.fails.push('grapple charge accounting off (' + G.toolCharges + ')');
  else out.log.push('grapple: reeled a coin to Jo’s feet');

  // ---- Lockpick Kit: reopens a severed shutter without shedding loot ----
  equip('lockpick');
  let picked = false;
  for (const s of [1, 2, 7, 42, 1337, 90210, 5, 88]) {
    G.build(s);
    if (!G.vgraph) continue;
    G.resetSever();
    G.carriedValue = Math.ceil(G.runLootTotal * 0.4);
    G.updateSever(0.01);            // trigger the telegraph
    G.updateSever(2.0);             // commit the slam
    if (G.severStack.length !== 1) continue;
    const d = G.severStack[0];
    G.player.x = d.center.x + 60; G.player.y = d.center.y;
    G.useTool();
    if (G.severStack.length === 0 && G.toolCharges === 0) { picked = true; break; }
  }
  if (!picked) out.fails.push('lockpick never reopened a severed shutter across seeds');
  else out.log.push('lockpick: cracked a sealed shutter back open');

  // ---- Portable Portal: free plant, then snap back from anywhere ----
  equip('portal'); G.build(6);
  const px = G.player.x, py = G.player.y;
  G.useTool();                       // plant (free)
  if (!G.toolMark) out.fails.push('portal did not plant a marker');
  if (G.toolCharges !== 1) out.fails.push('planting the marker consumed a charge');
  G.player.x = px + 400; G.player.y = py + 100;
  G.useTool();                       // snap back
  if (G.player.x !== px || G.player.y !== py) out.fails.push('portal did not snap back to the marker');
  if (G.toolMark) out.fails.push('marker survived the snap');
  if (G.toolCharges !== 0) out.fails.push('snap did not consume the charge');
  else out.log.push('portal: marker planted free, snapped back, single charge spent');

  // ---- Gilded Fake: spawns, scams the Noble, baits when dropped ----
  G.meta.equippedTool = '';
  let fake = null;
  for (const s of [1, 2, 3, 4, 5, 6, 7, 8]) { G.build(s); fake = G.loot.find(l => l.kind === 'fake'); if (fake) break; }
  if (!fake) out.fails.push('no Gilded Fake spawned across 8 seeds');
  else {
    const buyers = G.buyersFor('fake', 520);
    const black = buyers.find(b => b.id === 'black'), noble = buyers.find(b => b.id === 'noble');
    if (!black || black.payout !== 40) out.fails.push('black market should pay $40 for paste (got ' + (black && black.payout) + ')');
    if (!noble || noble.payout < 500) out.fails.push('noble should overpay for the fake (got ' + (noble && noble.payout) + ')');
    if (!noble || noble.fx !== 'curse+') out.fails.push('scamming the noble should raise notoriety');
    // drop-bait: make the fake the only carried piece, then drop it
    fake.got = true;
    const baitsBefore = G.baits.length;
    G.dropLoot();
    if (G.baits.length <= baitsBefore) out.fails.push('dropped fake did not glitter as bait');
    else out.log.push('fake: spawns, $40 honest / full-price scam (+noto), baits on drop');
  }

  // ---- Reputation: standing shapes the board and the prices ----
  G.meta.rep = {};
  if (G.repDominant()) out.fails.push('repDominant should be null with no history');
  G.meta.rep = { 'GENTLEMAN THIEF': 3, 'TOMB RAIDER': 1 };
  if (G.repDominant() !== 'GENTLEMAN THIEF') out.fails.push('dominant rep wrong: ' + G.repDominant());
  let sawRepJob = false, boardOk = true;
  for (let i = 0; i < 6; i++) {
    const board = G.genContracts(3);
    const match = board.filter(c => ['silent', 'untouched'].includes(c.type));
    if (!match.length) boardOk = false;
    for (const c of match) { if (c.repJob) sawRepJob = true;
      if (c.type === 'silent' && c.reward !== Math.round(750 * 1.25)) out.fails.push('silent rep job pays ' + c.reward + ' (want 938)'); }
  }
  if (!boardOk) out.fails.push('rep board bias failed — no matching contract offered');
  if (!sawRepJob) out.fails.push('no contract was marked as a reputation job');
  const nobleRep = G.buyersFor('loud', 460).find(b => b.id === 'noble').payout;
  G.meta.rep = {};
  const nobleBase = G.buyersFor('loud', 460).find(b => b.id === 'noble').payout;
  if (Math.abs(nobleRep / nobleBase - 1.1) > 0.02) out.fails.push('rep buyer bonus ratio ' + (nobleRep / nobleBase).toFixed(3) + ' (want ~1.1)');
  else out.log.push('reputation: board biased + named jobs +25%, favorite buyer +10%');

  // ---- Reputation is earned on escape ----
  G.build(9);
  G.meta.rep = {};
  G.carriedValue = 900;              // quiet, modest haul -> GENTLEMAN THIEF
  G.endRun(true);
  if ((G.meta.rep['GENTLEMAN THIEF'] | 0) !== 1) out.fails.push('escape did not record the epithet (rep=' + JSON.stringify(G.meta.rep) + ')');
  else out.log.push('reputation: escape recorded GENTLEMAN THIEF ×1');

  // ---- The second sheath: a found tool waits, then takes over on its own ----
  {
    G.meta.runs = 30; G.meta.tools.smoke = 1; G.meta.equippedTool = 'smoke';
    // the reputation test above ended a run, so we're on the results screen —
    // useTool() only fires while state === 'playing'
    G.activeContract = null; G.startRun();
    let cSeed = null;
    for (const s of [1, 2, 7, 42, 1337, 90210, 5, 88, 3, 9, 17, 55]) { G.build(s); if (G.toolCache) { cSeed = s; break; } }
    if (cSeed === null) out.fails.push('no tool crate found for the sheath test');
    else {
      const tc = G.toolCache;
      G.player.x = tc.x; G.player.y = tc.y; G.player.plat = -1;
      for (let i = 0; i < 20 && !tc.taken; i++) G.updateSecrets(0.05);
      if (!G.backupTool) out.fails.push('a found tool did not go to the second sheath while the belt was live');
      else {
        const sheathed = G.backupTool, n = G.backupCharges;
        // burn the belt dry — bounded, because some tools decline to fire when
        // there's nothing in reach and would spin an unbounded loop forever
        for (let i = 0; i < 12 && G.backupTool; i++) G.useTool();
        if (G.runTool !== sheathed) out.fails.push('the backup did not come up when the belt ran dry');
        else if (G.toolCharges !== n) out.fails.push('the promoted tool lost its charges');
        else if (G.backupTool) out.fails.push('the sheath did not empty on promotion');
        else out.log.push(`second sheath: ${sheathed} waited, then took over with x${n} — no new buttons`);
      }
    }
  }
  return out;
});

// ---- DROP regression (live frames): a dropped piece must NOT re-grab next frame ----
// The original bug: dropLoot left the item at Jo's feet with no grace, so the
// pickup loop reclaimed it one frame later and DROP looked like a no-op.
await page.evaluate(() => {
  const G = window.__greed;
  G.meta.equippedTool = ''; G.activeContract = null; G.startRun();
  const items = G.loot.filter(l => !l.got && !l.hidden && l.plat === -1 && l.weight > 0
    && !['artifact', 'shrine', 'living'].includes(l.kind));
  items.sort((a, b) => ((a.x - G.portal.x) ** 2 + (a.y - G.portal.y) ** 2) - ((b.x - G.portal.x) ** 2 + (b.y - G.portal.y) ** 2));
  const it = items[0]; window.__dropIdx = G.loot.indexOf(it);
  it.got = true; G.player.x = it.x; G.player.y = it.y; G.player.plat = -1; G.player.inv = 999;
  G.dropLoot();
});
await page.waitForTimeout(450);          // real frames — the old bug re-grabbed here
let dl = await page.evaluate(() => { const G = window.__greed; const it = G.loot[window.__dropIdx];
  return { got: it.got, grace: it.dropCd > 0 }; });
if (dl.got) res.fails.push('DROP bug regressed: item re-grabbed during the grace window');
await page.waitForTimeout(1000);         // grace expires
await page.evaluate(() => { const G = window.__greed; const it = G.loot[window.__dropIdx];
  G.player.inv = 999; G.player.x = it.x; G.player.y = it.y; G.player.plat = -1; });
await page.waitForTimeout(250);
dl = await page.evaluate(() => window.__greed.loot[window.__dropIdx].got || window.__greed.loot[window.__dropIdx].stolen);
if (!dl) res.fails.push('dropped item not re-grabbable after the grace expired');
else res.log.push('drop: grace window holds, item re-grabbable after it expires');

res.log.forEach(l => console.log(l));
if (pageErrors.length) { console.log('PAGE ERRORS:'); pageErrors.forEach(e => console.log('  ' + e)); }
if (res.fails.length) { console.log('FAILURES:'); res.fails.forEach(f => console.log('  ' + f)); }
else console.log('\nALL WEB TOOLS/FAKE/REPUTATION TESTS PASSED');
await browser.close();
process.exit(res.fails.length || pageErrors.length ? 1 : 0);
