import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'fs';
const CHROME='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const OUT='/tmp/jo3d/frames'; mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({ executablePath:CHROME,
  args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-proxy-server'] });
const p=await b.newPage({ viewport:{width:560,height:560} });
p.on('pageerror',e=>console.log('pageerror:',String(e).slice(0,200)));
await p.goto('http://127.0.0.1:8731/bake.html');
await p.waitForFunction(()=>window.__st&&window.__st.ready,null,{timeout:240000});
const st=await p.evaluate(()=>window.__st);
console.log('bones found:', JSON.stringify(st.bones), st.err?('ERR '+st.err):'');
// run_side_l — 6 frames, side-on, facing LEFT (the game mirrors it for right)
const N=6, YAW=-Math.PI/2;
for(let f=0; f<N; f++){
  const phase = f/N*Math.PI*2;
  const url = await p.evaluate(([ph,y])=>window.__bake(ph,1.0,y), [phase,YAW]);
  writeFileSync(`${OUT}/run_side_l_${f}.png`, Buffer.from(url.split(',')[1],'base64'));
}
// idle_down — 6 frames, facing camera, near-zero speed so the breathe term drives it
for(let f=0; f<N; f++){
  const phase = f/N*Math.PI*2;
  const url = await p.evaluate(([ph,y])=>window.__bake(ph,0.0,y), [phase,0]);
  writeFileSync(`${OUT}/idle_down_${f}.png`, Buffer.from(url.split(',')[1],'base64'));
}
console.log('baked', N*2, 'frames ->', OUT);
await b.close();
