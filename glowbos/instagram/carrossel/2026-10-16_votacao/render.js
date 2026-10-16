const {chromium}=require('/Users/alexsandroregesdelima/.dev-browser/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:12960,height:1440},deviceScaleFactor:1});
await p.goto('file://'+process.cwd()+'/pano.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
for(let i=0;i<12;i++){await p.screenshot({path:`export/glowbos_votacao_${String(i+1).padStart(2,'0')}.jpg`,type:'jpeg',quality:92,clip:{x:i*1080,y:0,width:1080,height:1440}});}
await b.close();})();
