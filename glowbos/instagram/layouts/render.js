const {chromium}=require('/Users/alexsandroregesdelima/.dev-browser/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:1500}});
await p.goto('file://'+__dirname+'/layouts.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);
const fora=await p.evaluate(()=>{const o=[];document.querySelectorAll('.L').forEach(L=>{const r0=L.getBoundingClientRect();
 L.querySelectorAll('h1,p,.cap,.btn,.F,div[style*="font:"]').forEach(e=>{if(!e.textContent.trim())return;const r=e.getBoundingClientRect();
  const x0=r.left-r0.left,y0=r.top-r0.top,x1=r.right-r0.left,y1=r.bottom-r0.top;
  if(x0<95||y0<149||x1>985||y1>1291)o.push(L.id+' "'+e.textContent.trim().slice(0,30)+'" '+[x0,y0,x1,y1].map(Math.round))})});return o});
console.log(fora.join('\n')||'área segura ok');
for(const el of await p.$$('.L')){const id=await el.getAttribute('id');await el.screenshot({path:`png/${id}.png`});}
await b.close();})();
