const {chromium}=require('/Users/alexsandroregesdelima/.dev-browser/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true});
await p.goto('https://glowbos.com.br/?nc='+Date.now(),{waitUntil:'networkidle'});await p.waitForTimeout(1500);
await p.evaluate(()=>{document.querySelectorAll('[class*="app"],[id*="app"]').forEach(e=>{if(/Baixe o app/i.test(e.textContent||''))e.remove()})});
await p.screenshot({path:'app_home.png'});
await p.goto('https://glowbos.com.br/?p=34&nc='+Date.now(),{waitUntil:'networkidle'}).catch(()=>{});await p.waitForTimeout(1500);await p.screenshot({path:'app_produto.png'});
await b.close();})();
