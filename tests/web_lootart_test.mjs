// Loot art layer — the sprite path in drawLoot(), and the guarantee that a
// missing or half-delivered set can never break a pickup.
import { chromium } from 'playwright-core';
import { spawn } from 'child_process';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
let fails = 0;
const ok  = (c,m)=>{ console.log((c?'  ':'  FAIL ')+m); if(!c) fails++; };

// Served over http, not file://. Images loaded from file:// taint the canvas and
// toDataURL throws — which is a testing artifact, not a game one (nothing in the
// build reads pixels back), but it does mean this suite needs an origin.
const PORT = 8793;
const srv = spawn('python3', ['-m','http.server',String(PORT)], { cwd: process.cwd()+'/web', stdio:'ignore' });
process.on('exit', ()=>srv.kill());
await new Promise(r=>setTimeout(r,900));

const b = await chromium.launch({ executablePath: CHROME, args:['--no-sandbox','--no-proxy-server'] });
const p = await b.newPage({ viewport:{width:1280,height:854} });
p.on('pageerror', e=>{ console.log('  pageerror:', String(e).slice(0,160)); fails++; });
await p.goto(`http://127.0.0.1:${PORT}/index.html`);
await p.waitForTimeout(600);

// --- the switch ships on ------------------------------------------------------
const boot = await p.evaluate(()=>window.__greed.LOOT_STYLE);
ok(boot === 'art', `ships on the art path (LOOT_STYLE = '${boot}')`);

// --- every slot has a filename, including the two that split ------------------
const src = await p.evaluate(()=>window.__greed.LOOT_ART_SRC);
const need = ['common','valuable','loud','cursed','royal','fragile','fake','mythic',
              'living_down','living_side','living_up',
              'shrine_altar','shrine_crystal','artifact_ring','artifact_gem'];
ok(need.every(k=>src[k]), `all ${need.length} files mapped`);
ok(['living_down','living_side','living_up'].every(k=>src[k]),
   'the Skitterjewel is three directions — side is mirrored for right, as Jo is');

// --- every declared file actually decodes ------------------------------------
await p.evaluate(()=>{
  const G=window.__greed;
  G.meta.runs=30; G.meta.tips.move=1; G.activeContract=null; G.startRun(); G.build(7); G.recompute();
  G.guards.length=0; G.sentries.length=0; G.rivals.length=0;
});
await p.waitForTimeout(1800);
const have = await p.evaluate(()=>window.__greed.lootArt);
ok(have.length === need.length, `all ${need.length} files decoded — no slot silently on vector`);
const missing = need.filter(k=>!have.includes(k));
ok(missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : 'nothing declared is absent');
ok(have.every(k=>need.includes(k)), 'nothing decoded that is not a declared slot');

// --- draw one kind on each path and measure the difference -------------------
// The vault drifts ambient dust every frame, so two captures are never byte-equal.
// Measure instead: swapping a slot that HAS art must move a lot of pixels, and a
// slot with no file must move only as much as the dust does.
async function diffPct(kind){
  return await p.evaluate(async ({kind})=>{
    const G=window.__greed, c=document.getElementById('c');
    const RS=c.width/G.VIEW.w, N=140;
    const px=(G.VIEW.w/2)*RS, py=(G.VIEW.h/2)*RS;
    const grab = ()=> new Promise(res=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const o=document.createElement('canvas'); o.width=o.height=N;
      const g=o.getContext('2d');
      g.drawImage(c, Math.round(px-N/2), Math.round(py-N/2), N,N, 0,0,N,N);
      res(g.getImageData(0,0,N,N).data);
    })));
    const place = ()=>{ G.loot.length=0;
      G.loot.push({x:G.cam.x+G.VIEW.w/2, y:G.cam.y+G.VIEW.h/2, kind, type:kind, glow:0,
                   got:false, plat:-1, scurry:0, fx:0, fy:-1,
                   value:1, weight:1, noise:0, curse:0, name:'ref', boon:'greed'}); };
    G.setLootStyle('vector'); place(); const a = await grab();
    G.setLootStyle('art');    place(); const b = await grab();
    let moved=0;
    for(let i=0;i<a.length;i+=4){
      if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])+Math.abs(a[i+3]-b[i+3]) > 24) moved++;
    }
    return +(100*moved/(N*N)).toFixed(2);
  }, {kind});
}
// A loot body is a few hundred pixels inside a ~99-world-unit crop, so a real
// swap lands around 1%, not 50%. Anything above half a percent is the sprite.
const dArt = await diffPct('common');
ok(dArt > 0.5, `art is genuinely in use — switching to vector moves ${dArt}% of pixels`);

// --- a slot whose file goes missing drops to vector, alone --------------------
// Now that every file exists, break one on purpose. onerror deletes the entry,
// so this is the real half-delivered-set path, not a simulation of it.
await p.evaluate(()=>{ window.__greed.LOOT_ART_SRC.valuable = 'nope-not-here';
                       window.__greed.setLootStyle('art'); });
await p.waitForTimeout(1200);
const after = await p.evaluate(()=>window.__greed.lootArt);
ok(!after.includes('valuable'), 'a 404 drops that one slot out of the art set');
ok(after.length === need.length-1, `and takes nothing else with it (${after.length} left of ${need.length})`);
const dBroken = await diffPct('valuable');
ok(dBroken < 0.1, `the broken slot is pixel-identical to vector (${dBroken}%)`);
const dStillArt = await diffPct('common');
ok(dStillArt > 0.5, `its neighbours keep their art (${dStillArt}%)`);

// --- a broken file must not take a slot down ----------------------------------
const survived = await p.evaluate(()=>new Promise(res=>{
  const im=new Image();
  im.onload=()=>res('loaded'); im.onerror=()=>res('errored');
  im.src='assets/loot/definitely-not-here.png';
}));
ok(survived === 'errored', 'a missing file errors quietly rather than resolving empty');
const stillOk = await p.evaluate(()=>window.__greed.lootArt);
ok(stillOk.length === after.length, 'a stray failed load changes nothing at all');

await p.evaluate(()=>window.__greed.setLootStyle('vector'));
await b.close(); srv.kill();
console.log(fails ? `\n${fails} LOOT ART TEST(S) FAILED` : '\nALL LOOT ART TESTS PASSED');
process.exit(fails ? 1 : 0);
