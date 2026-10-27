// monte seu arco (26/10): tamanho fixo e até N cores; os balões de cada tamanho se dividem igual entre as cores
(function(){
 const box=document.getElementById('gbArco');if(!box)return;
 const $=s=>box.querySelector(s),D=box.dataset,IMG=D.img,TAM=JSON.parse(D.tam),COR=JSON.parse(D.cores);
 const R=v=>'R$ '+v.toFixed(2).replace('.',','),POL=['16','12','9','5'];
 let t=TAM[0],sel=[],por={},div={};
 // cada tamanho de balão leva as cores marcadas nele (todas por padrão) e divide o total igual entre elas
 function reparte(){div={};POL.forEach(p=>{const q=t.b[p];if(!q||!sel.length)return;const c=sel.filter(k=>(por[p]||sel).indexOf(k)>-1);por[p]=c.length?c:sel.slice();div[p]={};const b=Math.floor(q/por[p].length),r=q%por[p].length;por[p].forEach((k,i)=>div[p][k]=b+(i<r?1:0))})}
 function tamanhos(){
  $('#maTam').innerHTML=TAM.map(x=>'<button type="button" class="'+(x===t?'on':'')+'" data-n="'+x.n+'"><b>'+x.n+'</b><span>balões</span><small>até '+x.c+' cores</small><em>'+R(x.p)+'</em></button>').join('');
  $('#maTam').querySelectorAll('button').forEach(b=>b.onclick=()=>{t=TAM.find(x=>x.n==b.dataset.n);if(sel.length>t.c)sel=sel.slice(0,t.c);por={};reparte();$('#maImg').src=IMG+'arco_tam_'+t.n+'.webp';tudo()});
 }
 function cores(){
  $('#maCnt').textContent='até '+t.c+' · '+sel.length+(sel.length===1?' escolhida':' escolhidas');
  $('#maCores').innerHTML=Object.keys(COR).map(k=>{const i=sel.indexOf(k);return '<button type="button" data-k="'+k+'" class="'+(i>-1?'on':(sel.length>=t.c?'cheio':''))+'"><img src="'+IMG+'b_'+k+'.webp" alt="">'+COR[k]+(i>-1?'<i>'+(i+1)+'</i>':'')+'</button>'}).join('');
  $('#maCores').querySelectorAll('button').forEach(b=>b.onclick=()=>{const k=b.dataset.k,i=sel.indexOf(k);if(i>-1)sel.splice(i,1);else if(sel.length<t.c){sel.push(k);POL.forEach(p=>{if(por[p])por[p].push(k)})}else return;reparte();tudo()});
 }
 // o cliente não mexe na quantidade: só marca quais cores entram em cada tamanho de balão
 function divisao(){
  const L=POL.filter(p=>t.b[p]);
  $('#maDiv').innerHTML=(sel.length>1?'<p class="ma-vz">Toque numa cor pra tirar ou pôr ela nesse tamanho.</p>':'')+L.map(p=>'<div class="ma-dl"><div class="ma-dh"><b>'+p+'"</b><span>'+t.b[p]+' balões</span></div>'+(sel.length?'<div class="ma-dc">'+sel.map(k=>{const q=div[p][k]||0;return '<button type="button" class="ma-q'+(q?'':' off')+'" data-p="'+p+'" data-k="'+k+'"><img src="'+IMG+'b_'+k+'.webp" alt="">'+(q?q+' ':'')+COR[k]+'</button>'}).join('')+'</div>':'')+'</div>').join('')+(sel.length?'':'<p class="ma-vz">Escolha as cores e a gente divide os balões igual entre elas.</p>');
  $('#maDiv').querySelectorAll('button').forEach(b=>b.onclick=()=>{const p=b.dataset.p,k=b.dataset.k,c=por[p],i=c.indexOf(k);if(i>-1){if(c.length<2)return;c.splice(i,1)}else c.push(k);reparte();tudo()});
 }
 function compra(){
  const ok=sel.length>0;
  $('#maRes').textContent='Arco de '+t.n+' balões'+(sel.length?' · '+sel.map(k=>COR[k]).join(', '):'');
  $('#maTot').textContent=R(t.p);
  const b=$('#maComprar');b.disabled=!ok;b.textContent=ok?'Colocar no carrinho':'Escolha as cores';
 }
 function tudo(){tamanhos();cores();divisao();compra();$('#maMsg').textContent=''}
 $('#maComprar').onclick=()=>{const b=$('#maComprar');b.disabled=true;b.textContent='Colocando no carrinho...';
  const fd=new FormData();fd.append('tam',t.n);fd.append('cores',JSON.stringify(sel));fd.append('por',JSON.stringify(por));
  fetch(D.add,{method:'POST',body:fd,credentials:'same-origin'}).then(r=>r.json()).then(j=>{if(j&&j.success)location.href=j.data.carrinho;else{$('#maMsg').textContent=(j&&j.data)||'Não deu certo, tente de novo.';compra()}}).catch(()=>{$('#maMsg').textContent='Não deu certo, tente de novo.';compra()})};
 tudo();
})();
