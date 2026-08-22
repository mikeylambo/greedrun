// Drives bake.html headless and writes the raw supersampled render.
//   node tools/loot-bake/bake.mjs <model-dir> <name.obj> [out.png] [elev] [yaw]
import { chromium } from 'playwright-core';
import { writeFileSync, copyFileSync, existsSync, readdirSync } from 'fs';
import { spawn } from 'child_process';
import { join, basename } from 'path';

const [dir, objName, out='/tmp/loot-bake-raw.png', elev='35', yaw='0'] = process.argv.slice(2);
if(!dir || !objName){ console.error('usage: bake.mjs <model-dir> <name.obj> [out.png] [elev] [yaw]'); process.exit(1); }

// The loaders need XHR, which Chromium refuses over file:// — serve the dir.
const HERE = new URL('.', import.meta.url).pathname;
for(const f of ['three.min.js','OBJLoader.js','MTLLoader.js'])
  if(!existsSync(join(dir,f))) copyFileSync(join(HERE,'..','..','web','vendor',f), join(dir,f));
copyFileSync(join(HERE,'bake.html'), join(dir,'bake.html'));

const PORT = 8741 + (process.pid % 200);
const srv = spawn('python3',['-m','http.server',String(PORT)],{cwd:dir,stdio:'ignore'});
await new Promise(r=>setTimeout(r,900));
try{
  const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const b = await chromium.launch({ executablePath: CHROME,
    args:['--no-sandbox','--no-proxy-server','--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage();
  p.on('pageerror', e=>console.log('pageerror:', String(e).slice(0,180)));
  const mtl = readdirSync(dir).find(f=>f.toLowerCase().endsWith('.mtl'));
  const q = new URLSearchParams({ obj:objName, elev, yaw });
  if(mtl) q.set('mtl', mtl);
  await p.goto(`http://127.0.0.1:${PORT}/bake.html?${q}`);
  await p.waitForFunction('window.BAKE && window.BAKE.ready', null, { timeout: 60000 });
  const r = await p.evaluate(()=>window.BAKE);
  if(r.err) throw new Error(r.err);
  if(!r.coverage) throw new Error('render produced an empty frame (coverage 0)');
  writeFileSync(out, Buffer.from(r.png.split(',')[1],'base64'));
  console.log(JSON.stringify({ out, elev:+elev, yaw:+yaw, coverage:r.coverage, frustum:r.frustum, source_bbox:r.src }));
  await b.close();
} finally { srv.kill(); }
