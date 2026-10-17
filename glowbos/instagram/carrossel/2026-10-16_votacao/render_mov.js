const {chromium}=require('/Users/alexsandroregesdelima/.dev-browser/node_modules/playwright');
const fs=require('fs'),path=require('path'),{execSync}=require('child_process');const FF='/opt/homebrew/bin/ffmpeg -y -loglevel error';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:12960,height:1440}});
await p.goto('file://'+__dirname+'/pano.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
const fr=__dirname+'/frames';fs.rmSync(fr,{recursive:true,force:true});fs.mkdirSync(fr);
await p.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
for(let f=0;f<150;f++){await p.evaluate(t=>document.getAnimations().forEach(a=>{a.currentTime=t}),f*1000/30);await p.screenshot({path:`${fr}/${String(f).padStart(4,'0')}.jpg`,type:'jpeg',quality:88});}
for(let i=0;i<12;i++){const nn=String(i+1).padStart(2,'0');execSync(`${FF} -framerate 30 -i "${fr}/%04d.jpg" -vf "crop=1080:1440:${i*1080}:0" -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart "${__dirname}/export/glowbos_votacao_${nn}.mp4"`);}
fs.rmSync(fr,{recursive:true,force:true});await b.close();console.log('ok');})();
