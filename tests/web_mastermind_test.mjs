// Headless verification for Jo's identity pass and the decompression that
// followed it.
//   node tests/web_mastermind_test.mjs
// Covers: the title, THE COPY DOCTRINE (an enforceable word budget, so prose
// can't creep back in), Tact as a moment rather than a codex, the authored and
// skippable first job, the Mirage Toolkit vocabulary, the discipline
// reorganization, four-line commission cards, the Generous Gift, contextual
// HUD chrome, and a pre-pass save surviving every rename.
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
const words = t => String(t).trim().split(/\s+/).filter(Boolean).length;

// ---------- the title screen states the premise and stops talking ----------
{
  const t = await page.evaluate(() => ({
    eyebrow: document.querySelector('#menu .eyebrow').textContent.trim(),
    title: document.querySelector('#menu h1.title').textContent.replace(/\s+/g, ' ').trim(),
    play: document.getElementById('startBtn').textContent.trim(),
    help: document.getElementById('howtoBtn').textContent.trim(),
    paras: document.querySelectorAll('#menu .tagline').length,
  }));
  if (!/A Jo Story/i.test(t.eyebrow)) fails.push('title eyebrow lost "A Jo Story": ' + t.eyebrow);
  if (!/Greedrun/i.test(t.title) || !/HOW MUCH CAN YOU TAKE/i.test(t.title))
    fails.push('title block wrong: ' + t.title);
  if (t.play !== 'Play') fails.push('primary button should read Play, got: ' + t.play);
  if (!/How to Play/i.test(t.help)) fails.push('the reference button should say what it is: ' + t.help);
  if (t.paras) fails.push('the explanatory paragraph is still on the title screen');
  else log.push('title: A JO STORY / GREEDRUN / HOW MUCH CAN YOU TAKE? / Play — no paragraph');
}

// ---------- THE COPY DOCTRINE ----------
// Greedrun is an arcade game played with one thumb. Every string the player
// reads mid-decision has a hard seven-word budget. This test exists so the
// budget is enforced by the suite instead of remembered by whoever edits next.
const BUDGET = 7;
{
  const copy = await page.evaluate(() => {
    const G = window.__greed;
    const out = { tact: [], tools: [], obj: [] };
    for (const k in G.TACT) out.tact.push([k, G.TACT[k][1]]);
    for (const t of G.TOOLS) out.tools.push([t.nm, t.ds]);
    G.meta.career = G.meta.career || { runs: 0, esc: 0, banked: 0, deaths: {} };
    G.meta.career.banked = 500000; G.meta.rep = {};
    for (let i = 0; i < 10; i++) for (const c of G.genContracts(3)) out.obj.push([c.type, c.obj]);
    return out;
  });
  const over = (label, pairs) => pairs
    .filter(([, t]) => words(t) > BUDGET)
    .map(([k, t]) => `${label} ${k}: ${words(t)}w "${t}"`);
  const bust = [...over('tact', copy.tact), ...over('toolkit', copy.tools), ...over('objective', copy.obj)];
  if (bust.length) fails.push('over the ' + BUDGET + '-word budget —\n    ' + bust.join('\n    '));
  else log.push(`copy doctrine: ${copy.tact.length} Tacts, ${copy.tools.length} Toolkit lines, ` +
    `${new Set(copy.obj.map(o => o[0])).size} objective types — all within ${BUDGET} words`);
}

// ---------- Tact is a moment, not an archive ----------
{
  const m = await page.evaluate(() => ({
    hasCard: !!document.getElementById('tact'),
    hasLog: !!document.getElementById('tactLog'),
    hasRender: typeof window.__greed.renderTactLog === 'function',
    entries: Object.keys(window.__greed.TACT).length,
    codexText: /Noted this operation/i.test(document.getElementById('howto').textContent),
  }));
  if (!m.hasCard) fails.push('the Tact card is gone from the DOM');
  if (m.hasLog || m.hasRender || m.codexText) fails.push('the Tact codex is back — Tact is a moment, not a collection');
  if (m.entries < 20) fails.push('Tact table is thin (' + m.entries + ' entries)');
  else log.push('tact: ' + m.entries + ' contextual reads, no codex, no archive');
}
{
  // fires once, persists, never repeats
  const r = await page.evaluate(() => {
    const G = window.__greed;
    delete G.meta.tips.gate;
    G.tact('gate');
    const first = { on: document.getElementById('tact').classList.contains('on'),
      key: document.getElementById('tactKey').textContent,
      line: document.getElementById('tactLine').textContent };
    document.getElementById('tact').classList.remove('on');
    G.tact('gate');
    return { first, second: document.getElementById('tact').classList.contains('on'),
      saved: G.meta.tips.gate | 0 };
  });
  if (!r.first.on) fails.push('tact() did not show the card');
  if (r.first.key !== 'GATE') fails.push('tact label wrong: ' + r.first.key);
  if (!/wants weight/i.test(r.first.line)) fails.push('tact line wrong: ' + r.first.line);
  if (r.second) fails.push('a Tact fired twice');
  if (!r.saved) fails.push('a fired Tact did not persist');
  else log.push('tact: fires once, persists, then gets out of the way');
}

// ---------- How to Play is back, and it is a reference, not a lesson ----------
{
  const h = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#howto .ht-row')];
    return { tabs: !!document.getElementById('htTab1') && !!document.getElementById('htTab2'),
      basics: document.querySelectorAll('#ht1 .ht-row').length,
      deep: document.querySelectorAll('#ht2 .ht-row').length,
      longest: Math.max(...rows.map(r => r.querySelector('.ht-txt').textContent.trim().length)),
      stale: /Workbench|Smoke Bomb|Decoy Bag|Portable Portal|Lockpick Kit/.test(
        document.getElementById('howto').textContent),
    };
  });
  if (!h.tabs) fails.push('How to Play lost its two pages');
  if (h.basics < 5 || h.deep < 5) fails.push('How to Play rows missing: ' + h.basics + '/' + h.deep);
  if (h.stale) fails.push('How to Play still describes the old Workbench vocabulary');
  if (h.longest > 130) fails.push('a How to Play row is a paragraph again (' + h.longest + ' chars)');
  else log.push('how to play: 2 pages, ' + (h.basics + h.deep) + ' rows, longest ' + h.longest + ' chars, vocabulary current');
}

// ---------- Heist Profiles are gone, root and branch ----------
{
  const p = await page.evaluate(() => {
    const G = window.__greed;
    return { api: ['PROFILES', 'runProfile', 'rollProfile', 'prof'].filter(k => k in G),
      html: /Deep Storage|Accounted House|Flooded Route|Clean Commission|Hot Vault|Rival Claim|INTEL/
        .test(document.body.innerText) };
  });
  if (p.api.length) fails.push('profile API survives: ' + p.api.join(', '));
  if (p.html) fails.push('profile naming still reaches the player');
  else log.push('profiles: concept, weightings and vocabulary all removed');
}

// ---------- the authored first job ----------
{
  const t = await page.evaluate(() => {
    const G = window.__greed;
    G.meta.tips = {}; G.meta.runs = 0;            // a genuinely fresh save
    G.activeContract = null; G.dailyMode = false;
    const on = G.tutorialOn();
    G.startRun();
    const g = G.guards, l = G.loot;
    return { on, tutorial: G.tutorial,
      w: G.WORLD.w, h: G.WORLD.h,
      loot: l.length, hidden: l.filter(x => x.hidden).length,
      guards: g.length, sentries: G.sentries.length, rivals: G.rivals.length,
      chests: G.chests.length, stashes: G.stashes.length,
      assessor: !!G.assessor, hazards: G.pools.length + G.presses.length, dark: G.dark,
      mod: G.activeMod.id, weights: l.map(x => x.weight).sort((a, b) => b - a),
      value: l.reduce((a, x) => a + x.value, 0),
      skipVisible: getComputedStyle(document.getElementById('skipTut')).display !== 'none',
      // the exit is where you started, and it is in the entry hall
      portalNearSpawn: Math.hypot(G.portal.x - G.player.x, G.portal.y - G.player.y) < 2,
    };
  });
  if (!t.on || !t.tutorial) fails.push('a fresh save did not get the authored first job');
  if (t.w !== 1700 || t.h !== 1500) fails.push('first job is not the authored floor: ' + t.w + 'x' + t.h);
  // a portrait phone's view runs to ~1410 units on its long edge; anything
  // smaller letterboxes the tutorial on the device it is meant to teach
  if (Math.min(t.w, t.h) < 1410) fails.push('the authored floor would letterbox on a phone: ' + t.w + 'x' + t.h);
  if (t.loot !== 6) fails.push('first job should hold exactly 6 pieces, got ' + t.loot);
  if (t.hidden) fails.push('nothing in the first job should be hidden');
  if (t.guards !== 1) fails.push('first job should have exactly one guard, got ' + t.guards);
  if (t.sentries || t.rivals || t.chests || t.stashes || t.assessor || t.hazards || t.dark)
    fails.push('the first job is not clean: ' + JSON.stringify(t));
  if (t.mod !== 'clean') fails.push('the first job rolled a modifier: ' + t.mod);
  if (t.weights[0] < 5) fails.push('no piece heavy enough to teach LOAD (max weight ' + t.weights[0] + ')');
  if (!t.portalNearSpawn) fails.push('the first job does not start you on the exit');
  if (!t.skipVisible) fails.push('the tutorial has no visible way out');
  else log.push(`first job: authored ${t.w}x${t.h}, 6 pieces ($${t.value}), one guard, nothing else, skip offered`);
}
{
  // the beats fire on what the player does, in order
  const beats = await page.evaluate(() => {
    const G = window.__greed;
    const seen = [];
    const watch = () => seen.push(document.getElementById('tactKey').textContent);
    G.loot[0].got = true; G.recompute(); G.tutorialTick(); watch();     // TAKE
    const g = G.guards[0]; G.player.x = g.x - 60; G.player.y = g.y;
    G.tutorialTick(); watch();                                          // WATCH
    for (const l of G.loot) l.got = true; G.recompute(); G.tutorialTick(); watch();  // LOAD
    G.tutorialTick(); watch();                                          // LEAVE
    return { seen, step: G.tutStep };
  });
  const want = ['TAKE', 'WATCH', 'LOAD', 'LEAVE'];
  if (beats.seen.join(',') !== want.join(','))
    fails.push('teaching beats fired as ' + beats.seen.join(',') + ', want ' + want.join(','));
  else log.push('first job: TAKE → WATCH → LOAD → LEAVE, each on the player\'s own action');
}
{
  // One More Thing needs a real vault behind it, so the first job never asks
  const omt = await page.evaluate(() => {
    const G = window.__greed;
    G.carriedValue = 900; G.player.x = G.portal.x; G.player.y = G.portal.y;
    G.updateHazards(0.016);
    return { state: G.state, heart: G.loot.some(l => l.type === 'heart') };
  });
  if (omt.state === 'onemore') fails.push('the first job offered One More Thing with no Heart to reveal');
  if (omt.heart) fails.push('the authored first job should hold no Vault Heart');
  else log.push('first job: no Vault Heart, so One More Thing never fires on it');
}
{
  // skip is one tap and leaves you in a real vault
  const sk = await page.evaluate(() => {
    const G = window.__greed;
    G.meta.tips = {}; G.meta.runs = 0; G.activeContract = null;
    G.startRun();
    const before = G.tutorial;
    G.skipTutorial();
    return { before, after: G.tutorial, seen: G.meta.tips.move | 0, w: G.WORLD.w,
      skipHidden: getComputedStyle(document.getElementById('skipTut')).display === 'none',
      state: G.state };
  });
  if (!sk.before) fails.push('skip test did not start in the tutorial');
  if (sk.after) fails.push('skip left the tutorial running');
  if (!sk.seen) fails.push('skip did not record the intro as seen — it would fire again');
  if (sk.w === 1700) fails.push('skip did not build a real vault');
  if (!sk.skipHidden) fails.push('the skip chip lingers after skipping');
  if (sk.state !== 'playing') fails.push('skip did not leave you playing (state=' + sk.state + ')');
  else log.push('first job: skip is one tap, records itself, drops you into a real vault');
}
{
  // and a returning player never sees it
  const vet = await page.evaluate(() => {
    const G = window.__greed;
    G.meta.tips = { move: 1 }; G.meta.runs = 20; G.activeContract = null;
    return { on: G.tutorialOn() };
  });
  if (vet.on) fails.push('a returning player was sent back to the tutorial');
  else log.push('first job: once only — a returning save goes straight to the real game');
}

// ---------- the Mirage Toolkit vocabulary ----------
{
  const t = await page.evaluate(() => window.__greed.TOOLS.map(t => ({ id: t.id, nm: t.nm, ds: t.ds, disc: t.disc })));
  const want = { smoke: 'Shadow Step', decoy: 'Illusion', grapple: 'Strider’s Line',
    lockpick: 'Subversion Kit', portal: 'Mirage Gate' };
  for (const id in want) {
    const got = t.find(x => x.id === id);
    if (!got) fails.push('toolkit lost the "' + id + '" piece — that would orphan saves');
    else if (got.nm !== want[id]) fails.push(id + ' is named "' + got.nm + '", want "' + want[id] + '"');
    else if (!got.ds) fails.push(id + ' has no mechanical subcopy');
    else if (!got.disc) fails.push(id + ' is not tagged with a discipline');
  }
  if (!fails.length) log.push('toolkit: Shadow Step · Illusion · Strider’s Line · Subversion Kit · Mirage Gate, ids intact');
}

// ---------- disciplines organize the SAME ten upgrades ----------
{
  await page.evaluate(() => { window.__greed.meta.runs = 30; window.__greed.endRun(true); });
  await page.waitForTimeout(200);
  await page.evaluate(() => document.getElementById('continueBtn').click());
  await page.waitForTimeout(200);
  await page.evaluate(() => { const f = document.getElementById('fence');
    if (f.classList.contains('on')) document.getElementById('bankBtn').click(); });
  await page.waitForTimeout(200);
  await page.click('#tabGearBtn'); await page.waitForTimeout(150);
  const g = await page.evaluate(() => ({
    heads: [...document.querySelectorAll('.disc-head b')].map(e => e.textContent.trim()),
    caps: [...document.querySelectorAll('.disc-cap')].map(e => e.textContent.trim()).join(' | '),
    cards: document.getElementById('fenceGrid').querySelectorAll('.fence').length,
    kit: document.getElementById('wbHead').textContent,
  }));
  const wantD = ['Strider', 'Mirage Cloak', 'Subterfuge', 'Calculate'];
  if (g.heads.join(',') !== wantD.join(',')) fails.push('disciplines are ' + g.heads.join(',') + ', want ' + wantD.join(','));
  if (g.cards !== 10) fails.push('the ten upgrades did not survive the reorganization (' + g.cards + ')');
  if (!/Mirage Toolkit/.test(g.kit)) fails.push('the kit header is not the Mirage Toolkit');
  for (const c of ['The Long Walk', 'Cold Trail', 'The Grand Scheme', 'Appraiser'])
    if (!g.caps.includes(c)) fails.push('capstone missing from the discipline headers: ' + c);
  if (!fails.length) log.push('disciplines: ' + g.heads.join(' · ') + ' — 10 upgrades, 4 capstones, kit is its own axis');
}
{
  // ...but the pause screen describes what things DO, in plain words
  await page.evaluate(() => { const G = window.__greed;
    G.activeContract = null; G.meta.tips.move = 1; G.startRun(); });
  await page.waitForTimeout(120);
  await page.evaluate(() => document.getElementById('pauseBtn').click());
  await page.waitForTimeout(120);
  const labels = await page.evaluate(() =>
    [...document.querySelectorAll('#statPanel .stat-cell span')].map(e => e.textContent.trim()));
  const jargon = labels.filter(l => /Strider|Mirage Cloak|Subterfuge|Calculate/.test(l));
  if (jargon.length) fails.push('discipline names taxed the pause screen: ' + jargon.join(', '));
  else if (!labels.includes('Move speed')) fails.push('pause screen lost its plain labels: ' + labels.join(', '));
  else log.push('pause: plain labels (Move speed, Footsteps…) — the vocabulary stays on the shelf, not the numbers');
  await page.evaluate(() => { const G = window.__greed; if (G.state === 'paused') document.getElementById('resumeBtn').click(); });
}

// ---------- commission cards: four lines, two seconds ----------
{
  const c = await page.evaluate(() => {
    const G = window.__greed;
    G.meta.career.banked = 500000; G.meta.rep = {};
    const out = { clients: new Set(), missing: [], unresolved: 0, n: 0, prose: [] };
    for (let i = 0; i < 12; i++) for (const c of G.genContracts(3)) {
      out.n++; out.clients.add(c.client);
      for (const k of ['client', 'obj', 'location']) if (!c[k]) out.missing.push(c.type + ':' + k);
      if (/%ASSET%/.test(c.obj || '')) out.unresolved++;
      if (c.flavor || c.condition || c.acquire) out.prose.push(c.type);
    }
    return { ...out, clients: [...out.clients], missing: [...new Set(out.missing)], prose: [...new Set(out.prose)] };
  });
  if (c.missing.length) fails.push('commission cards missing facts: ' + c.missing.join(', '));
  if (c.unresolved) fails.push(c.unresolved + ' commissions shipped an unresolved %ASSET% token');
  if (c.prose.length) fails.push('commission prose fields are back: ' + c.prose.join(', '));
  if (c.clients.some(x => /^(A|An|The) /.test(x))) fails.push('client names still carry articles: ' + c.clients.join(' / '));
  if (c.clients.some(x => /thief|guild|fence|thrill/i.test(x))) fails.push('a petty-client name survived: ' + c.clients.join(' / '));
  if (!fails.length) log.push('commissions: ' + c.n + ' cards, ' + c.clients.length + ' client archetypes, no prose fields');
}
{
  await page.evaluate(() => { const G = window.__greed; G.endRun(true); });
  await page.waitForTimeout(200);
  await page.evaluate(() => document.getElementById('continueBtn').click());
  await page.waitForTimeout(200);
  await page.evaluate(() => { const f = document.getElementById('fence');
    if (f.classList.contains('on')) document.getElementById('bankBtn').click(); });
  await page.waitForTimeout(200);
  await page.evaluate(() => { const t = document.getElementById('tabDenBtn'); if (t) t.click(); });
  await page.waitForTimeout(150);
  await page.click('#nextRunBtn'); await page.waitForTimeout(250);
  const card = await page.evaluate(() => {
    const j = document.querySelector('#jobGrid .job');
    if (!j) return null;
    return { lines: j.children.length,
      client: (j.querySelector('.jc') || {}).textContent || '',
      obj: (j.querySelector('.jt') || {}).textContent || '',
      loc: (j.querySelector('.jloc') || {}).textContent || '',
      fee: (j.querySelector('.jr') || {}).textContent || '',
      lore: !!j.querySelector('.jsub'), quote: !!j.querySelector('.jf'), cond: !!j.querySelector('.jd'),
      chars: j.textContent.replace(/\s+/g, ' ').trim().length };
  });
  if (!card) fails.push('no commission rendered on the board');
  else {
    if (card.lines !== 4) fails.push('commission card has ' + card.lines + ' lines, want 4');
    if (card.lore || card.quote || card.cond) fails.push('lore/quote/condition line is back on the card');
    if (!/^\$/.test(card.fee.trim())) fails.push('the fee should lead with the number: ' + card.fee);
    if (card.chars > 90) fails.push('commission card is ' + card.chars + ' chars — too much to glance at');
    else log.push('commission card: 4 lines, ' + card.chars + ' chars — "' + card.client + ' / ' + card.obj.trim() + '"');
  }
  await page.click('#jobsBack'); await page.waitForTimeout(120);
}

// ---------- the Generous Gift ----------
{
  const gift = await page.evaluate(() => {
    const G = window.__greed;
    return { cheap: !!G.buyersFor('loud', 300).find(b => b.fx === 'gift'),
      rich: G.buyersFor('loud', 2000).find(b => b.fx === 'gift'),
      fake: !!G.buyersFor('fake', 2000).find(b => b.fx === 'gift') };
  });
  if (gift.cheap) fails.push('pocket change was offered as a Generous Gift');
  if (!gift.rich) fails.push('a real piece was not giftable');
  if (gift.fake) fails.push('the Gilded Fake was giftable — that is a scam, not generosity');
  if (gift.rich && gift.rich.payout !== 0) fails.push('the gift paid gold (' + gift.rich.payout + ')');
  if (gift.rich && gift.rich.reach !== 4000) fails.push('gift reach ' + gift.rich.reach + ' (want 2x appraised)');
  else log.push('gift: offered only on pieces worth the gesture, pays reach not gold');
}
{
  const r = await page.evaluate(() => {
    const G = window.__greed;
    G.meta.reach = 0; G.meta.gifts = { n: 0, val: 0 }; G.meta.curseDebt = 4;
    G.meta.forfeit = { quota: 1, silent: 1 };
    const before = { banked: G.careerBanked(), gold: G.meta.gold };
    const it = { kind: 'loud', name: 'The Meridian Key', value: 2000, saleIdx: 0, buyers: G.buyersFor('loud', 2000) };
    G.setPendingHaul([it]); G.openFence();
    it.saleIdx = it.buyers.findIndex(b => b.fx === 'gift');
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
  else log.push('gift: +$4,000 Operation reach, −1 notoriety, clients made good, $0 gold');
}
{
  const n = await page.evaluate(() => {
    const G = window.__greed;
    G.setPendingHaul([
      { kind: 'loud', name: 'A', value: 900, saleIdx: 0, buyers: G.buyersFor('loud', 900) },
      { kind: 'loud', name: 'B', value: 2400, saleIdx: 0, buyers: G.buyersFor('loud', 2400) },
      { kind: 'royal', name: 'C', value: 1500, saleIdx: 0, buyers: G.buyersFor('royal', 1500) },
    ]);
    G.openFence();
    return G.pendingHaul.filter(it => it.buyers.some(b => b.fx === 'gift')).map(it => it.name);
  });
  if (n.length !== 1 || n[0] !== 'B') fails.push('the gift should be offered on exactly the best piece, got ' + JSON.stringify(n));
  else log.push('gift: exactly one piece per haul, and it is the one worth feeling');
  await page.evaluate(() => window.__greed.setPendingHaul([]));
}

// ---------- the persistent HUD is four things ----------
{
  await page.evaluate(() => { const G = window.__greed; G.meta.runs = 30; G.meta.tips.move = 1;
    G.activeContract = null; G.startRun(); });
  await page.waitForTimeout(120);
  const quiet = await page.evaluate(() => {
    const G = window.__greed;
    for (const l of G.loot) l.got = false;
    for (const g of G.guards) { g.state = 'patrol'; g.alert = 0; }
    G.recompute();
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
    for (const l of G.loot) l.got = true; G.recompute(); G.syncHud();
    return document.getElementById('noiseMeter').classList.contains('on');
  });
  if (!loud) fails.push('the Noise meter stayed hidden with a full, loud bag');
  else log.push('hud: health/haul/load/heat persist; noise and the objective are contextual');
}

// ---------- an old save survives every rename ----------
{
  const mig = await page.evaluate(async () => {
    const G = window.__greed;
    const old = { gold: 12345, runs: 40, bestHaul: 9000, curseDebt: 2,
      upg: { feet: 3, straps: 2, boots: 1, pockets: 1, contacts: 4, luck: 2, cool: 1, revive: 1, landing: 1, scanner: 1 },
      collection: { idol: 2 }, tools: { smoke: 1, grapple: 1 }, equippedTool: 'grapple',
      rep: { 'GENTLEMAN THIEF': 3, 'TOMB RAIDER': 1 },
      tips: { load: 1, heat: 1, move: 1 }, seenUnlocks: { upgrades: 1 },
      career: { runs: 40, esc: 22, banked: 45000, deaths: {} } };
    localStorage.setItem('greedrun_meta_v1', JSON.stringify(old));
    await G.loadMeta();
    return { gold: G.meta.gold, upg: JSON.stringify(G.meta.upg), tools: JSON.stringify(G.meta.tools),
      equipped: G.meta.equippedTool, rep: G.meta.rep, coll: G.meta.collection.idol,
      tips: G.meta.tips, reach: G.meta.reach, gifts: G.meta.gifts, banked: G.meta.career.banked,
      tut: G.tutorialOn() };
  });
  if (mig.gold !== 12345 || mig.banked !== 45000) fails.push('an old save lost its gold/career');
  if (!/"feet":3/.test(mig.upg) || !/"contacts":4/.test(mig.upg)) fails.push('an old save lost upgrade levels: ' + mig.upg);
  if (!/"smoke":1/.test(mig.tools) || mig.equipped !== 'grapple') fails.push('an old save lost its toolkit: ' + mig.tools);
  if (mig.coll !== 2) fails.push('an old save lost its collection');
  if (mig.rep['GENTLEMAN THIEF']) fails.push('the old epithet key was left behind un-migrated');
  if ((mig.rep['THE QUIET HAND'] | 0) !== 3 || (mig.rep['NOTHING LEFT'] | 0) !== 1)
    fails.push('epithet migration lost counts: ' + JSON.stringify(mig.rep));
  if (!mig.tips.load || !mig.tips.heat) fails.push('already-seen teaching moments would fire again as Tact');
  if (mig.tut) fails.push('a 40-job save would be sent to the tutorial');
  if (mig.reach !== 0 || !mig.gifts) fails.push('the gift fields did not default on an old save');
  else log.push('migration: gold, upgrades, toolkit, collection, seen-Tact intact; epithets renamed; no tutorial');
}

log.forEach(l => console.log(l));
if (pageErrors.length) { console.log('PAGE ERRORS:'); pageErrors.forEach(e => console.log('  ' + e)); }
if (fails.length) { console.log('FAILURES:'); fails.forEach(f => console.log('  ' + f)); }
else console.log('\nALL WEB MASTERMIND TESTS PASSED');
await browser.close();
process.exit(fails.length || pageErrors.length ? 1 : 0);
