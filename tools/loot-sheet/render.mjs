// Renders every drawn loot kind through the game's OWN draw path (drawLoot), one
// at a time at a single clean anchor, and crops each straight out of the canvas
// backing store — so the reference sheet shows real engine pixels at the engine's
// sharpest render scale (RS caps at 2.5) rather than a resampled composite.
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'fs';
const dir=process.env.LOOT_OUT || '/tmp/greedrun-loot';
mkdirSync(dir,{recursive:true});
const CHROME=process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const b=await chromium.launch({ executablePath:CHROME, args:['--no-sandbox'] });
// dpr 2 pushes RS to its 2.5 ceiling — the sharpest the engine ever draws loot.
const p=await b.newPage({ viewport:{width:1280,height:854}, deviceScaleFactor:2 });
p.on('pageerror',e=>console.log('pageerror:',String(e).slice(0,160)));
await p.goto('file://'+process.cwd()+'/web/index.html');
await p.waitForTimeout(700);

// Every kind drawLoot() knows how to draw, in slot order.
const KINDS=['common','valuable','loud','cursed','living','royal','fragile','fake','shrine','artifact','mythic'];
const CROP=260;   // backing px per cell — 104 world units, clears the 60u artifact halo

const setup = await p.evaluate(()=>{
  const G=window.__greed;
  G.meta.runs=30; G.meta.tips.move=1; G.activeContract=null; G.startRun(); G.build(7); G.recompute();
  G.loot.length=0; G.guards.length=0; G.sentries.length=0; G.rivals.length=0;
  return { VIEW:{w:G.VIEW.w,h:G.VIEW.h} };
});
await p.waitForTimeout(2200);   // let the camera settle and the entry ring fade

// One anchor for all eleven: identical backdrop per cell, no prop can differ.
const anchor = await p.evaluate(()=>{
  const G=window.__greed;
  return { wx:G.cam.x+G.VIEW.w*0.5, wy:G.cam.y+G.VIEW.h*0.5, cam:{x:G.cam.x,y:G.cam.y} };
});

async function grab(kind){
  await p.evaluate(({kind,wx,wy})=>{
    const G=window.__greed; G.loot.length=0;
    if(kind) G.loot.push({ x:wx, y:wy, kind, type:kind, glow:0, got:false, plat:-1,
                           scurry:0, fx:0, fy:-1, value:1, weight:1, noise:0, curse:0,
                           name:'Reference', boon:'greed' });
  }, {kind, wx:anchor.wx, wy:anchor.wy});
  await p.waitForTimeout(90);
  // glow advances at dt*4 every frame; re-zero it so the crop is the canonical,
  // un-pulsed pose, then read the very next painted frame.
  return await p.evaluate(({kind,wx,wy,cx,cy,CROP})=>{
    for(const l of window.__greed.loot){ l.glow=0; l.scurry=0; l.x=wx; l.y=wy; }
    return new Promise(res=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const c=document.getElementById('c'), RS=c.width/window.__greed.VIEW.w;
      const px=(wx-cx)*RS, py=(wy-cy)*RS;
      const o=document.createElement('canvas'); o.width=o.height=CROP;
      const g=o.getContext('2d'); g.imageSmoothingEnabled=false;
      g.drawImage(c, Math.round(px-CROP/2), Math.round(py-CROP/2), CROP, CROP, 0,0, CROP, CROP);
      res({ url:o.toDataURL('image/png'), RS });
    })));
  }, {kind, wx:anchor.wx, wy:anchor.wy, cx:anchor.cam.x, cy:anchor.cam.y, CROP});
}

const empty = await grab(null);
writeFileSync(dir+'/_backdrop.png', Buffer.from(empty.url.split(',')[1],'base64'));
for(const k of KINDS){
  const r = await grab(k);
  writeFileSync(dir+'/'+k+'.png', Buffer.from(r.url.split(',')[1],'base64'));
}
writeFileSync(dir+'/geo.json', JSON.stringify({ KINDS, CROP, RS:empty.RS, VIEW:setup.VIEW, anchor },null,1));
console.log('RS', empty.RS, 'VIEW', setup.VIEW.w+'x'+setup.VIEW.h, 'crop', CROP, '=', (CROP/empty.RS).toFixed(0)+' world units');
await b.close();
