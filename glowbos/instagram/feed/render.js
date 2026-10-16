// Render do feed: node render.js [slug ...]  (sem slug = todos do indice.json)
// carrossel: pano.html -> export/NN.jpg (1080x1440)
// reel: reel.html com animações CSS pausadas; avança o relógio quadro a quadro (30 fps) e o ffmpeg junta em export/reel.mp4 + export/capa.jpg
const {chromium}=require('/Users/alexsandroregesdelima/.dev-browser/node_modules/playwright');
const fs=require('fs'),path=require('path'),{execSync}=require('child_process');
const B=__dirname, idx=JSON.parse(fs.readFileSync(B+'/indice.json'));
const pedidos=process.argv.slice(2);
(async()=>{const b=await chromium.launch();
for(const p of idx){ if(pedidos.length&&!pedidos.includes(p.slug))continue;
 const d=path.join(B,p.slug),ex=path.join(d,'export');fs.mkdirSync(ex,{recursive:true});
 if(p.tipo==='reel'){
  const pg=await b.newPage({viewport:{width:1080,height:1920}});
  await pg.goto('file://'+d+'/reel.html',{waitUntil:'networkidle'});await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(500);
  const fr=path.join(d,'frames');fs.rmSync(fr,{recursive:true,force:true});fs.mkdirSync(fr);
  const N=Math.round(p.dur*30);
  await pg.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
  for(let f=0;f<N;f++){const t=f*1000/30;
   await pg.evaluate(t=>document.getAnimations().forEach(a=>{a.currentTime=t}),t);
   await pg.screenshot({path:path.join(fr,String(f).padStart(4,'0')+'.jpg'),type:'jpeg',quality:90});}
  execSync(`/opt/homebrew/bin/ffmpeg -y -loglevel error -framerate 30 -i "${fr}/%04d.jpg" -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart "${ex}/reel.mp4"`);
  // capa do Reels = quadro mais "cheio" (fim), recortada 3:4 no centro pra grade
  const last=path.join(fr,String(N-1).padStart(4,'0')+'.jpg');
  execSync(`/opt/homebrew/bin/ffmpeg -y -loglevel error -i "${last}" -vf "crop=1080:1440:0:240" "${ex}/capa.jpg"`);
  fs.rmSync(fr,{recursive:true,force:true});await pg.close();console.log('reel',p.slug,N,'quadros');
 }else{
  const W=p.n*1080,pg=await b.newPage({viewport:{width:W,height:1440}});
  await pg.goto('file://'+d+'/pano.html',{waitUntil:'networkidle'});await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(600);
  for(let i=0;i<p.n;i++)await pg.screenshot({path:path.join(ex,String(i+1).padStart(2,'0')+'.jpg'),type:'jpeg',quality:92,clip:{x:i*1080,y:0,width:1080,height:1440}});
  await pg.close();console.log('carrossel',p.slug,p.n);
 }}
await b.close();})();
