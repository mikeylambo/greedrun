// Headless browser verification for the game-feel (juice) pass.
//   node tests/web_juice_test.mjs
// Loads web/index.html, unlocks the procedural WebAudio kit with a real gesture,
// fires every named cue, drives a run through the real UI, and asserts: the
// ambient bed ramps up in play, footstep dust + impact rings spawn and decay,
// pickup/drop wiring plays without errors, mute toggles the master bus, and the
// whole kit is a silent no-op when the AudioContext never unlocked.
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';

const browser = await chromium.launch({ executablePath: CHROME,
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(String(e)));
await page.goto('file://' + root + '/web/index.html');
await page.waitForTimeout(300);

const fails = [], log = [];

// ---- gesture unlocks the AudioContext ----
await page.mouse.click(480, 320);
await page.waitForTimeout(200);
let dbg = await page.evaluate(() => window.__greed.audioDebug);
if (!dbg.ac) fails.push('AudioContext not created after a gesture');
else if (dbg.ctxState !== 'running') fails.push('AudioContext not running: ' + dbg.ctxState);
else log.push('audio: context unlocked and running');

// ---- every named cue plays without throwing ----
const cueErr = await page.evaluate(() => {
  const S = window.__greed.S;
  try {
    for (const k of Object.keys(S)) S[k](k === 'pickup' ? 460 : k === 'charge' ? 3 : undefined);
    return '';
  } catch (e) { return String(e); }
});
if (cueErr) fails.push('cue threw: ' + cueErr);
else log.push('audio: all ' + await page.evaluate(() => Object.keys(window.__greed.S).length) + ' cues fired cleanly');

// ---- drive a real run through the UI ----
await page.evaluate(() => { window.__greed.meta.runs = 10; });   // veteran save: full hideout unlocked
await page.click('#startBtn');            // title -> hideout
await page.click('#nextRunBtn');          // hideout -> jobs board
await page.click('#freeRunBtn');          // free run -> playing
await page.waitForTimeout(200);
const st = await page.evaluate(() => window.__greed.state);
if (st !== 'playing') fails.push('run did not start via UI (state=' + st + ')');
else log.push('flow: title -> hideout -> jobs -> playing');

// ---- ambient bed ramps up while playing ----
await page.waitForTimeout(1300);
dbg = await page.evaluate(() => window.__greed.audioDebug);
if (dbg.mus < 0.05) fails.push('music bus never ramped up in play (gain=' + dbg.mus.toFixed(3) + ')');
else log.push('music: ambient bed live in play (gain=' + dbg.mus.toFixed(2) + ')');

// ---- footstep dust while moving ----
await page.keyboard.down('d');
await page.waitForTimeout(700);
await page.keyboard.up('d');
const dust = await page.evaluate(() => window.__greed.particles.filter(p => p.g === 0).length);
if (dust <= 0) fails.push('no footstep dust spawned while running');
else log.push('fx: footstep dust spawning (' + dust + ' motes live)');

// ---- impact rings spawn and decay ----
const ringLife = await page.evaluate(async () => {
  const G = window.__greed;
  G.ring(G.player.x, G.player.y, '#e0503f');
  const born = G.rings.length;
  await new Promise(r => setTimeout(r, 800));
  return { born, later: G.rings.length };
});
if (ringLife.born <= 0) fails.push('ring() spawned nothing');
else if (ringLife.later >= ringLife.born) fails.push('rings never decay (' + ringLife.later + ' left)');
else log.push('fx: impact rings spawn and decay');

// ---- pickup + drop wiring (teleport onto a ground item) ----
const pd = await page.evaluate(async () => {
  const G = window.__greed;
  const l = G.loot.find(x => !x.got && !x.hidden && !x.stolen && x.plat === -1 && x.weight > 0
    && x.kind !== 'artifact' && x.kind !== 'shrine' && x.kind !== 'living');
  if (!l) return { err: 'no grabbable test item' };
  G.player.x = l.x; G.player.y = l.y; G.player.plat = -1;
  await new Promise(r => setTimeout(r, 250));
  const got = l.got;
  G.dropLoot();
  return { err: '', got, dropped: !l.got };
});
if (pd.err) fails.push(pd.err);
else if (!pd.got) fails.push('walking onto loot did not pick it up');
else if (!pd.dropped) fails.push('dropLoot did not shed the item');
else log.push('wiring: pickup chime + drop thud paths exercised in play');

// ---- mute toggles the master bus (and back) ----
const mute = await page.evaluate(async () => {
  const G = window.__greed;
  G.toggleMute(); await new Promise(r => setTimeout(r, 250));
  const off = G.audioDebug;
  G.toggleMute(); await new Promise(r => setTimeout(r, 250));
  return { off, on: G.audioDebug };
});
if (!mute.off.muted || mute.off.master > 0.05) fails.push('mute did not silence the master bus (gain=' + mute.off.master + ')');
else if (mute.on.muted || mute.on.master < 0.3) fails.push('unmute did not restore the master bus (gain=' + mute.on.master + ')');
else log.push('audio: mute/unmute drives the master bus');

// ---- a page with no unlocked audio stays a silent no-op ----
const page2 = await browser.newPage();
const p2Errors = [];
page2.on('pageerror', e => p2Errors.push(String(e)));
await page2.goto('file://' + root + '/web/index.html');
await page2.waitForTimeout(200);
const cold = await page2.evaluate(() => {
  const G = window.__greed;
  try { G.S.pickup(300); G.S.hit(); G.S.escape(); return { err: '', ac: G.audioDebug.ac }; }
  catch (e) { return { err: String(e) }; }
});
if (cold.err) fails.push('cue threw with no AudioContext: ' + cold.err);
else if (cold.ac) fails.push('AudioContext created without a gesture');
else log.push('audio: cues are safe no-ops before unlock');
if (p2Errors.length) fails.push('cold page errors: ' + p2Errors.join(' | '));

log.forEach(l => console.log(l));
if (pageErrors.length) { console.log('PAGE ERRORS:'); pageErrors.forEach(e => console.log('  ' + e)); }
if (fails.length) { console.log('FAILURES:'); fails.forEach(f => console.log('  ' + f)); }
else console.log('\nALL WEB JUICE TESTS PASSED');
await browser.close();
process.exit(fails.length || pageErrors.length ? 1 : 0);
