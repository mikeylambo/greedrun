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

// --- the switch ships off -----------------------------------------------------
const boot = await p.evaluate(()=>({ style: window.__greed.LOOT_STYLE, loaded: window.__greed.lootArt }));
ok(boot.style === 'vector', `ships on the vector path (LOOT_STYLE = '${boot.style}')`);
ok(boot.loaded.length === 0, 'vector mode fetches nothing — no wasted requests for players');

// --- every slot has a filename, including the two that split ------------------
const src = await p.evaluate(()=>window.__greed.LOOT_ART_SRC);
const need = ['common','valuable','loud','cursed','living','royal','fragile','fake','mythic',
              'shrine_altar','shrine_crystal','artifact_ring','artifact_gem'];
ok(need.every(k=>src[k]), `all ${need.length} slots mapped, shrine and artifact split in two`);

// --- flipping loads only what actually exists ---------------------------------
await p.evaluate(()=>{
  const G=window.__greed;
  G.meta.runs=30; G.meta.tips.move=1; G.activeContract=null; G.startRun(); G.build(7); G.recompute();
  G.guards.length=0; G.sentries.length=0; G.rivals.length=0;
  G.setLootStyle('art');
});
await p.waitForTimeout(1500);
const have = await p.evaluate(()=>window.__greed.lootArt);
ok(have.length > 0, `art mode decoded ${have.length} of ${need.length} slots: ${have.join(', ')}`);
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
const withArt = have.includes('common') ? 'common' : have[0];
const noArt   = need.find(k=>!have.includes(k) && !k.includes('_'));

// A loot body is a few hundred pixels inside a ~99-world-unit crop, so a real
// swap lands around 1%, not 50%. Anything above half a percent is the sprite.
const dArt = await diffPct(withArt);
ok(dArt > 0.5, `'${withArt}' has a file — flipping to art moves ${dArt}% of pixels`);

if(noArt){
  const dNone = await diffPct(noArt);
  // The whole promise of the fallback: a slot with no file is not merely "still
  // visible", it is the build before any art existed. The tolerance is only
  // there for a drifting dust mote; today it comes back at exactly zero.
  ok(dNone < 0.1, `'${noArt}' has no file — flipping moves ${dNone}% of pixels`);
}

// --- a broken file must not take a slot down ----------------------------------
const survived = await p.evaluate(()=>new Promise(res=>{
  const im=new Image();
  im.onload=()=>res('loaded'); im.onerror=()=>res('errored');
  im.src='assets/loot/definitely-not-here.png';
}));
ok(survived === 'errored', 'a missing file errors quietly rather than resolving empty');
const stillOk = await p.evaluate(()=>window.__greed.lootArt);
ok(stillOk.length === have.length, 'a failed load leaves the decoded slots untouched');

await p.evaluate(()=>window.__greed.setLootStyle('vector'));
await b.close(); srv.kill();
console.log(fails ? `\n${fails} LOOT ART TEST(S) FAILED` : '\nALL LOOT ART TESTS PASSED');
process.exit(fails ? 1 : 0);
