// Headless verification for the Jo-as-Mastermind design pass.
//   node tests/web_mastermind_test.mjs
// Covers: the Tact system (fires once, persists, reviewable, no manual left in
// the flow), the Mirage Toolkit vocabulary, the discipline reorganization, the
// commission card's five facts, deterministic Heist Profiles that actually bend
// the vault, the Generous Gift, contextual HUD chrome, and save migration.
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

// ---------- §14: the title screen states the premise and stops talking ----------
{
  const t = await page.evaluate(() => ({
    eyebrow: document.querySelector('#menu .eyebrow').textContent.trim(),
    title: document.querySelector('#menu h1.title').textContent.replace(/\s+/g, ' ').trim(),
    play: document.getElementById('startBtn').textContent.trim(),
    paras: document.querySelectorAll('#menu .tagline').length,
  }));
  if (!/A Jo Story/i.test(t.eyebrow)) fails.push('title eyebrow lost "A Jo Story": ' + t.eyebrow);
  if (!/Greedrun/i.test(t.title) || !/HOW MUCH CAN YOU TAKE/i.test(t.title))
    fails.push('title block wrong: ' + t.title);
  if (t.play !== 'Play') fails.push('primary button should read Play, got: ' + t.play);
  if (t.paras) fails.push('the explanatory paragraph is still on the title screen');
  else log.push('title: A JO STORY / GREEDRUN / HOW MUCH CAN YOU TAKE? / Play — no paragraph');
}

// ---------- §5: Tact replaces the manual ----------
{
  const m = await page.evaluate(() => ({
    // the old two-page reference is gone; ht1 is the three verbs
    verbs: [...document.querySelectorAll('#ht1 .ht-key')].map(e => e.textContent.trim().toUpperCase()),
    rows: document.querySelectorAll('#howto .ht-row').length,
    hasLog: !!document.getElementById('tactLog'),
    hasCard: !!document.getElementById('tact'),
    entries: Object.keys(window.__greed.TACT).length,
  }));
  if (m.verbs.join(',') !== 'MOVE,TAKE,LEAVE') fails.push('first-run curriculum is not MOVE/TAKE/LEAVE: ' + m.verbs);
  if (m.rows !== 3) fails.push('the manual is still in the flow (' + m.rows + ' reference rows)');
  if (!m.hasLog || !m.hasCard) fails.push('Tact card/log missing from the DOM');
  if (m.entries < 20) fails.push('Tact table is thin (' + m.entries + ' entries)');
  else log.push('tact: 3 verbs replace the manual, ' + m.entries + ' contextual reads registered');
}
{
  // a Tact fires once, persists, and never repeats
  const r = await page.evaluate(() => {
    const G = window.__greed;
    delete G.meta.tips.gate;
    G.tact('gate');
    const first = { on: document.getElementById('tact').classList.contains('on'),
      key: document.getElementById('tactKey').textContent,
      line: document.getElementById('tactLine').textContent };
    document.getElementById('tact').classList.remove('on');
    G.tact('gate');                     // second time: silent
    const second = document.getElementById('tact').classList.contains('on');
    G.renderTactLog();
    return { first, second, saved: G.meta.tips.gate | 0,
      inLog: /WEIGHTED GATE/.test(document.getElementById('tactLog').textContent) };
  });
  if (!r.first.on) fails.push('tact() did not show the card');
  if (r.first.key !== 'WEIGHTED GATE') fails.push('tact label wrong: ' + r.first.key);
  if (!/wants weight/i.test(r.first.line)) fails.push('tact line wrong: ' + r.first.line);
  if (r.second) fails.push('a Tact fired twice');
  if (!r.saved) fails.push('a fired Tact did not persist');
  if (!r.inLog) fails.push('a fired Tact is not reviewable in the log');
  else log.push('tact: fires once, persists, and shows up in the reviewable log');
}

// ---------- §3: the Mirage Toolkit vocabulary ----------
{
  const t = await page.evaluate(() => window.__greed.TOOLS.map(t => ({ id: t.id, nm: t.nm, ds: t.ds, disc: t.disc })));
  const want = { smoke: 'Shadow Step', decoy: 'Illusion', grapple: 'Strider’s Line',
    lockpick: 'Subversion Kit', portal: 'Mirage Gate' };
  for (const id in want) {
    const got = t.find(x => x.id === id);
    if (!got) fails.push('toolkit lost the "' + id + '" piece — that would orphan saves');
    else if (got.nm !== want[id]) fails.push(id + ' is named "' + got.nm + '", want "' + want[id] + '"');
    else if (!got.ds || got.ds.length < 20) fails.push(id + ' has no plain mechanical subcopy');
    else if (!got.disc) fails.push(id + ' is not tagged with a discipline');
  }
  if (!fails.length) log.push('toolkit: Shadow Step · Illusion · Strider’s Line · Subversion Kit · Mirage Gate, ids intact');
}

// ---------- §4: disciplines organize the SAME ten upgrades ----------
{
  const d = await page.evaluate(() => {
    const G = window.__greed;
    const L = G.meta && window.__greed;
    return { ids: [...document.querySelectorAll('.disc-head b')].map(e => e.textContent.trim()) };
  });
  await page.evaluate(() => { window.__greed.meta.runs = 30; });
  await page.click('#startBtn'); await page.waitForTimeout(150);
  await page.click('#tabGearBtn'); await page.waitForTimeout(150);
  const g = await page.evaluate(() => ({
    heads: [...document.querySelectorAll('.disc-head b')].map(e => e.textContent.trim()),
    caps: [...document.querySelectorAll('.disc-cap')].map(e => e.textContent.trim()),
    cards: document.getElementById('fenceGrid').querySelectorAll('.fence').length,
    kit: document.getElementById('wbHead').textContent,
  }));
  const wantD = ['Strider', 'Mirage Cloak', 'Subterfuge', 'Calculate'];
  if (g.heads.join(',') !== wantD.join(',')) fails.push('disciplines are ' + g.heads.join(',') + ', want ' + wantD.join(','));
  if (g.cards !== 10) fails.push('the ten upgrades did not survive the reorganization (' + g.cards + ')');
  if (!/Mirage Toolkit/.test(g.kit)) fails.push('the kit header is not the Mirage Toolkit');
  const capText = g.caps.join(' | ');
  for (const c of ['The Long Walk', 'Cold Trail', 'The Grand Scheme', 'Appraiser'])
    if (!capText.includes(c)) fails.push('capstone missing from the discipline headers: ' + c);
  if (!fails.length) log.push('disciplines: ' + g.heads.join(' · ') + ' — 10 upgrades, 4 capstones, kit is its own axis');
}

// ---------- §6/§7: the commission card carries five facts ----------
{
  const c = await page.evaluate(() => {
    const G = window.__greed;
    G.meta.career = G.meta.career || { runs: 0, esc: 0, banked: 0, deaths: {} };
    G.meta.career.banked = 500000;                    // full territory, so every address can roll
    G.meta.rep = {};
    const out = { clients: new Set(), missing: [], assets: 0, unresolved: 0, n: 0 };
    for (let i = 0; i < 12; i++) for (const c of G.genContracts(3)) {
      out.n++;
      out.clients.add(c.client);
      for (const k of ['client', 'acquire', 'location', 'condition', 'flavor'])
        if (!c[k]) out.missing.push(c.type + ':' + k);
      if (/%ASSET%/.test(c.acquire)) out.unresolved++;
      if (c.assetName) out.assets++;
    }
    return { clients: [...out.clients], missing: [...new Set(out.missing)], unresolved: out.unresolved,
      assets: out.assets, n: out.n };
  });
  if (c.missing.length) fails.push('commission cards missing facts: ' + c.missing.join(', '));
  if (c.unresolved) fails.push(c.unresolved + ' commissions shipped an unresolved %ASSET% token');
  if (!c.assets) fails.push('named-piece commissions never got a named asset');
  if (c.clients.some(x => /thief|guild|fence|thrill/i.test(x)))
    fails.push('a petty-client name survived the reframe: ' + c.clients.join(' / '));
  if (!fails.length) log.push('commissions: ' + c.n + ' cards, five facts each, ' + c.clients.length + ' client archetypes, assets resolved');
}
{
  // and the card renders them, in order, with the location's reason to exist
  await page.evaluate(() => { window.__greed.meta.runs = 30; });
  await page.click('#tabDenBtn'); await page.waitForTimeout(120);   // back to the Den, where the board button lives
  await page.click('#nextRunBtn'); await page.waitForTimeout(200);
  const card = await page.evaluate(() => {
    const j = document.querySelector('#jobGrid .job');
    return j ? { cl: !!j.querySelector('.jc'), tg: (j.querySelector('.jt') || {}).textContent || '',
      loc: !!j.querySelector('.jloc'), sub: !!j.querySelector('.jsub'),
      cond: !!j.querySelector('.jd'), fee: (j.querySelector('.jr') || {}).textContent || '',
      flav: !!j.querySelector('.jf') } : null;
  });
  if (!card) fails.push('no commission rendered on the board');
  else {
    if (!card.cl || !card.loc || !card.cond || !card.flav) fails.push('commission card lost a field: ' + JSON.stringify(card));
    if (!/^Acquire:/.test(card.tg.trim())) fails.push('target line does not lead with Acquire: ' + card.tg);
    if (!/^Fee:/.test(card.fee.trim())) fails.push('the reward reads as a reward, not a fee: ' + card.fee);
    if (!card.sub) fails.push('the location does not say why it holds anything (§10)');
    else log.push('commission card: CLIENT / Acquire / LOCATION+why / CONDITION / Fee / one line');
  }
  await page.click('#jobsBack'); await page.waitForTimeout(120);
}

// ---------- §11: Heist Profiles are seeded, complete, and actually bend the vault ----------
{
  const p = await page.evaluate(() => {
    const G = window.__greed;
    G.activeContract = null;
    const seen = {}, det = [];
    for (let s = 1; s <= 240; s++) { G.build(s); seen[G.runProfile.id] = (seen[G.runProfile.id] | 0) + 1; }
    // determinism: the same seed rebuilds the same profile, even out of order
    for (const s of [42, 7, 1337, 42, 7, 1337]) { G.build(s); det.push(s + ':' + G.runProfile.id); }
    const sameSeed = det[0] === det[3] && det[1] === det[4] && det[2] === det[5];
    // and the profile is the FIRST thing the seed decides, so it never depends
    // on standing or unlocks
    G.meta.career.banked = 0; G.build(99); const poor = G.runProfile.id;
    G.meta.career.banked = 500000; G.build(99); const rich = G.runProfile.id;
    return { seen, sameSeed, poor, rich, all: G.PROFILES.map(x => x.id) };
  });
  const missing = p.all.filter(id => !p.seen[id]);
  if (missing.length) fails.push('profiles that never rolled in 240 seeds: ' + missing.join(','));
  if (!p.sameSeed) fails.push('profile roll is not deterministic per seed');
  if (p.poor !== p.rich) fails.push('profile depends on player standing — shared codes would diverge');
  else log.push('profiles: all ' + p.all.length + ' roll across 240 seeds, deterministic, standing-independent');
}
{
  // each profile bends the systems it claims to bend
  const eff = await page.evaluate(() => {
    const G = window.__greed;
    G.activeContract = null;
    const find = id => { for (let s = 1; s <= 600; s++) { G.build(s); if (G.runProfile.id === id) return s; } return -1; };
    const out = {};
    // baseline: how a plain house reads
    const s0 = find('plain'); out.plainWake = G.assessor.wake;
    const sA = find('accounted'); out.acctWake = G.assessor.wake; out.acctFast = G.prof('assessorFast', 1);
    const sH = find('hot');      out.hotHeat = G.prof('heat', 0);
    const sR = find('rival');    out.rivals = G.rivals.length;
    const sF = find('flooded');  out.pools = G.pools.length; out.floodTheme = G.currentThemeKey;
    const sD = find('deep');     out.chests = G.chests.length; out.stashes = G.stashes.length;
    const sC = find('clean');    out.royal = G.loot.filter(l => l.kind === 'royal').length;
    const sL = find('locked');   out.locked = G.lockedDoors.length; out.rooms = !!G.vgraph;
    return out;
  });
  if (!(eff.acctWake < eff.plainWake)) fails.push('Accounted House did not put the Assessor on his rounds sooner');
  if (!(eff.acctFast > 1)) fails.push('Accounted House did not speed the Assessor’s pen');
  if (eff.hotHeat < 2) fails.push('Hot Vault did not seed extra Heat');
  if (eff.rivals < 1) fails.push('Rival Claim spawned no rival');
  if (eff.pools < 1) fails.push('Flooded Route spawned no water (theme=' + eff.floodTheme + ')');
  if (eff.chests < 2) fails.push('Deep Storage did not add strongboxes (' + eff.chests + ')');
  if (eff.stashes < 1) fails.push('Deep Storage did not guarantee the hidden stash');
  if (eff.royal < 1) fails.push('Clean Commission had no standout piece');
  if (eff.rooms && eff.locked < 1) fails.push('Locked House left every shutter open');
  if (!fails.length) log.push('profiles bend real systems: assessor, heat, rival, water, strongboxes, standout, locks');
}

// ---------- §9: the Generous Gift ----------
{
  const gift = await page.evaluate(() => {
    const G = window.__greed;
    const cheap = G.buyersFor('loud', 300).find(b => b.fx === 'gift');
    const rich = G.buyersFor('loud', 2000).find(b => b.fx === 'gift');
    const fake = G.buyersFor('fake', 2000).find(b => b.fx === 'gift');
    return { cheap: !!cheap, rich: !!rich, fake: !!fake, reach: rich && rich.reach, payout: rich && rich.payout };
  });
  if (gift.cheap) fails.push('pocket change was offered as a Generous Gift — the gesture has to cost something');
  if (!gift.rich) fails.push('a real piece was not giftable');
  if (gift.fake) fails.push('the Gilded Fake was giftable — that is a scam, not generosity');
  if (gift.payout !== 0) fails.push('the gift paid gold (' + gift.payout + ')');
  if (gift.reach !== 4000) fails.push('gift reach ' + gift.reach + ' (want 2x appraised)');
  else log.push('gift: offered only on pieces worth the gesture, pays reach not gold');
}
{
  // banking a gift moves the Operation, quiets the talk and makes clients good
  const r = await page.evaluate(() => {
    const G = window.__greed;
    G.meta.reach = 0; G.meta.gifts = { n: 0, val: 0 }; G.meta.curseDebt = 4;
    G.meta.forfeit = { quota: 1, silent: 1 };
    const before = { banked: G.meta.career.banked, tier: G.opTier(), gold: G.meta.gold };
    // one giftable piece in the haul, gift selected
    const it = { kind: 'loud', name: 'The Meridian Key', value: 2000, saleIdx: 0, buyers: G.buyersFor('loud', 2000) };
    G.setPendingHaul([it]);
    G.openFence();
    const gi = it.buyers.findIndex(b => b.fx === 'gift');
    it.saleIdx = gi;
    G.bankHaul();
    return { reach: G.meta.reach, gifts: G.meta.gifts, noto: G.meta.curseDebt,
      owed: Object.keys(G.meta.forfeit).length, goldDelta: G.meta.gold - before.gold,
      counted: G.careerBanked() - before.banked };
  });
  if (r.reach !== 4000) fails.push('banking the gift did not credit reach (' + r.reach + ')');
  if (r.gifts.n !== 1 || r.gifts.val !== 2000) fails.push('the ledger did not record the gift: ' + JSON.stringify(r.gifts));
  if (r.noto !== 3) fails.push('the gift did not quiet the talk (noto ' + r.noto + ', want 3)');
  if (r.owed !== 0) fails.push('the gift did not make good with the waiting clients');
  if (r.goldDelta !== 0) fails.push('the gift paid gold anyway (+' + r.goldDelta + ')');
  if (r.counted !== 4000) fails.push('reach did not count toward the Operation (' + r.counted + ')');
  else log.push('gift: banks as +$4,000 Operation reach, −1 notoriety, all clients made good, $0 gold');
}
{
  // exactly one piece per haul carries the offer
  const n = await page.evaluate(() => {
    const G = window.__greed;
    G.setPendingHaul([
      { kind: 'loud', name: 'A', value: 900, saleIdx: 0, buyers: G.buyersFor('loud', 900) },
      { kind: 'loud', name: 'B', value: 2400, saleIdx: 0, buyers: G.buyersFor('loud', 2400) },
      { kind: 'royal', name: 'C', value: 1500, saleIdx: 0, buyers: G.buyersFor('royal', 1500) },
    ]);
    G.openFence();
    const G2 = G.pendingHaul;
    return { offers: G2.filter(it => it.buyers.some(b => b.fx === 'gift')).map(it => it.name) };
  });
  if (n.offers.length !== 1 || n.offers[0] !== 'B')
    fails.push('the gift should be offered on exactly the best piece, got ' + JSON.stringify(n.offers));
  else log.push('gift: exactly one piece per haul, and it is the one worth feeling');
  await page.evaluate(() => window.__greed.setPendingHaul([]));
}

// ---------- §13: the persistent HUD is four things ----------
{
  await page.evaluate(() => { const G = window.__greed; G.meta.runs = 30; G.meta.tips.move = 1;
    G.activeContract = null; G.startRun(); });
  await page.waitForTimeout(120);
  const quiet = await page.evaluate(() => {
    const G = window.__greed;
    for (const l of G.loot) l.got = false;
    for (const g of G.guards) { g.state = 'patrol'; g.alert = 0; }
    G.recompute();
    // run the objective's hold out
    for (let i = 0; i < 40; i++) G.tickHud(0.25);
    G.syncHud();
    const on = id => document.getElementById(id).classList.contains('on');
    return { noise: on('noiseMeter'), objective: on('objective'),
      hearts: !!document.getElementById('hearts').textContent,
      haul: !!document.getElementById('haul').textContent,
      greed: !!document.getElementById('greedTxt').textContent,
      heat: document.getElementById('pips').children.length };
  });
  if (quiet.noise) fails.push('the Noise meter is still shouting while the bag is silent');
  if (quiet.objective) fails.push('the objective line never stands down');
  if (!quiet.hearts || !quiet.haul || !quiet.greed || quiet.heat !== 7)
    fails.push('a persistent HUD element went missing: ' + JSON.stringify(quiet));
  const loud = await page.evaluate(() => {
    const G = window.__greed;
    for (const l of G.loot) l.got = true;   // a full bag clinks
    G.recompute(); G.syncHud();
    return document.getElementById('noiseMeter').classList.contains('on');
  });
  if (!loud) fails.push('the Noise meter stayed hidden with a full, loud bag');
  else log.push('hud: health/haul/load/heat persist; noise and the objective are contextual');
}

// ---------- §17: an old save survives every rename ----------
{
  const mig = await page.evaluate(async () => {
    const G = window.__greed;
    // a pre-pass save: street epithets, old tool ids, upgrades, tips already seen
    const old = { gold: 12345, runs: 40, bestHaul: 9000, curseDebt: 2,
      upg: { feet: 3, straps: 2, boots: 1, pockets: 1, contacts: 4, luck: 2, cool: 1, revive: 1, landing: 1, scanner: 1 },
      collection: { idol: 2 }, tools: { smoke: 1, grapple: 1 }, equippedTool: 'grapple',
      rep: { 'GENTLEMAN THIEF': 3, 'TOMB RAIDER': 1 },
      tips: { load: 1, heat: 1 }, seenUnlocks: { upgrades: 1 },
      career: { runs: 40, esc: 22, banked: 45000, deaths: {} } };
    localStorage.setItem('greedrun_meta_v1', JSON.stringify(old));
    await G.loadMeta();
    return { gold: G.meta.gold, upg: JSON.stringify(G.meta.upg), tools: JSON.stringify(G.meta.tools),
      equipped: G.meta.equippedTool, rep: G.meta.rep, coll: G.meta.collection.idol,
      tips: G.meta.tips, reach: G.meta.reach, gifts: G.meta.gifts, banked: G.meta.career.banked };
  });
  if (mig.gold !== 12345 || mig.banked !== 45000) fails.push('an old save lost its gold/career');
  if (!/"feet":3/.test(mig.upg) || !/"contacts":4/.test(mig.upg)) fails.push('an old save lost upgrade levels: ' + mig.upg);
  if (!/"smoke":1/.test(mig.tools) || mig.equipped !== 'grapple') fails.push('an old save lost its toolkit: ' + mig.tools);
  if (mig.coll !== 2) fails.push('an old save lost its collection');
  if (mig.rep['GENTLEMAN THIEF']) fails.push('the old epithet key was left behind un-migrated');
  if ((mig.rep['THE QUIET HAND'] | 0) !== 3 || (mig.rep['NOTHING LEFT'] | 0) !== 1)
    fails.push('epithet migration lost counts: ' + JSON.stringify(mig.rep));
  if (!mig.tips.load || !mig.tips.heat) fails.push('already-seen teaching moments would fire again as Tact');
  if (mig.reach !== 0 || !mig.gifts) fails.push('new §9 fields did not default on an old save');
  else log.push('migration: gold, upgrades, toolkit, collection, seen-Tact intact; epithets renamed in place');
}

log.forEach(l => console.log(l));
if (pageErrors.length) { console.log('PAGE ERRORS:'); pageErrors.forEach(e => console.log('  ' + e)); }
if (fails.length) { console.log('FAILURES:'); fails.forEach(f => console.log('  ' + f)); }
else console.log('\nALL WEB MASTERMIND TESTS PASSED');
await browser.close();
process.exit(fails.length || pageErrors.length ? 1 : 0);
