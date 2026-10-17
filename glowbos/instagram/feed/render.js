// Render do feed: node render.js [--checar] [slug ...]  (sem slug = todos do indice.json)
// Todo slide tem movimento: o canvas panorâmico é gravado quadro a quadro (30 fps, 5 s) e o ffmpeg
// corta um MP4 por slide (export/NN.mp4) + o último quadro em JPG (export/NN.jpg, capa/estático).
// Reels: reel.html -> export/reel.mp4 + export/capa.jpg (recorte 3:4 do centro).
// Antes de gravar, confere a ÁREA SEGURA (quadrado azul das Guias): texto, título e logo dentro de
// 96 px nas laterais e 150 px em cima e embaixo. No Reels, dentro do recorte 3:4 (y 240 a 1680) com a mesma folga.
// --checar = só confere, não grava.
const {chromium}=require('/Users/alexsandroregesdelima/.dev-browser/node_modules/playwright');
const fs=require('fs'),path=require('path'),{execSync}=require('child_process');
const B=__dirname, idx=JSON.parse(fs.readFileSync(B+'/indice.json'));
const args=process.argv.slice(2), so=args.includes('--checar'), pedidos=args.filter(a=>!a.startsWith('--'));
const FPS=30, DUR=5, FF='/opt/homebrew/bin/ffmpeg -y -loglevel error';
const TXT='.lg,.pg,.seta,.site,.k,.t,.t2,.t3,.p,.mao,.pill,.preco,.cartao,.bolha,.lista,.num,.esp,.pol i,h1,h2,h3,p,li';
async function checar(pg,reel){
 return pg.evaluate(([TXT,reel])=>{document.getAnimations().forEach(a=>a.cancel());const out=[];
  const caixas=reel?[[document.querySelector('#reel'),{x0:96,y0:390,x1:984,y1:1530}]]
   :[...document.querySelectorAll('.sl')].map(s=>[s,{x0:96,y0:150,x1:984,y1:1290}]);
  caixas.forEach(([s,z],i)=>{const o=s.getBoundingClientRect();
   s.querySelectorAll(TXT).forEach(e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height)return;
    if(getComputedStyle(e).visibility==='hidden')return;
    const x0=r.left-o.left,y0=r.top-o.top,x1=r.right-o.left,y1=r.bottom-o.top;
    if(x0<z.x0-1||y0<z.y0-1||x1>z.x1+1||y1>z.y1+1)out.push(`slide ${i+1}: ${(e.className||e.tagName)} "${(e.textContent||'').trim().slice(0,40)}" [${Math.round(x0)},${Math.round(y0)} a ${Math.round(x1)},${Math.round(y1)}]`)})});
  return out},[TXT,reel]);
}
(async()=>{const b=await chromium.launch();let falhas=0;
for(const p of idx){ if(pedidos.length&&!pedidos.includes(p.slug))continue;
 const d=path.join(B,p.slug),ex=path.join(d,'export');fs.mkdirSync(ex,{recursive:true});
 const reel=p.tipo==='reel',W=reel?1080:p.n*1080,H=reel?1920:1440,arq=reel?'reel.html':'pano.html';
 const pg=await b.newPage({viewport:{width:W,height:H}});
 await pg.goto('file://'+d+'/'+arq,{waitUntil:'networkidle'});await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(400);
 const fora=await checar(pg,reel);
 if(fora.length){falhas+=fora.length;console.log(`FORA DA ÁREA SEGURA · ${p.slug}\n  `+fora.join('\n  '))}
 if(so){await pg.close();continue}
 await pg.reload({waitUntil:'networkidle'});await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(400);
 const fr=path.join(d,'frames');fs.rmSync(fr,{recursive:true,force:true});fs.mkdirSync(fr);
 const N=Math.round((reel?p.dur:DUR)*FPS);
 await pg.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
 for(let f=0;f<N;f++){const t=f*1000/FPS;
  await pg.evaluate(t=>document.getAnimations().forEach(a=>{a.currentTime=t}),t);
  await pg.screenshot({path:path.join(fr,String(f).padStart(4,'0')+'.jpg'),type:'jpeg',quality:88});}
 const last=path.join(fr,String(N-1).padStart(4,'0')+'.jpg');
 if(reel){
  execSync(`${FF} -framerate ${FPS} -i "${fr}/%04d.jpg" -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart "${ex}/reel.mp4"`);
  execSync(`${FF} -i "${last}" -vf "crop=1080:1440:0:240" "${ex}/capa.jpg"`);
 }else{
  for(const f of fs.readdirSync(ex))if(/^\d\d\.(jpg|mp4)$/.test(f))fs.rmSync(path.join(ex,f));
  for(let i=0;i<p.n;i++){const nn=String(i+1).padStart(2,'0');
   execSync(`${FF} -framerate ${FPS} -i "${fr}/%04d.jpg" -vf "crop=1080:1440:${i*1080}:0" -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart "${ex}/${nn}.mp4"`);
   execSync(`${FF} -i "${last}" -vf "crop=1080:1440:${i*1080}:0" -q:v 2 "${ex}/${nn}.jpg"`);}
 }
 fs.rmSync(fr,{recursive:true,force:true});await pg.close();console.log(reel?'reel':'carrossel',p.slug,reel?N+' quadros':p.n+' slides em vídeo');
}
await b.close();if(falhas)console.log('TOTAL fora da área segura:',falhas);})();
