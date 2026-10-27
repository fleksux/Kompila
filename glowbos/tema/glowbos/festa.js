// monte sua festa (26/10): balões → mesa → finalizar; cada item vai pro montador que já existe e volta pra cá
(function(){
 const s=document.getElementById('festa');if(!s)return;
 const $=q=>s.querySelector(q),R=v=>'R$ '+v.toFixed(2).replace('.',','),G=k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},P=(k,v)=>{try{v==null?sessionStorage.removeItem(k):sessionStorage.setItem(k,v)}catch(e){}};
 let passo=+(G('gb_festa_passo')||1);
 function vai(n){passo=n;P('gb_festa_passo',n);s.querySelectorAll('.fe-p').forEach(p=>p.hidden=+p.dataset.p!==n);
  s.querySelectorAll('.fe-ps li').forEach(l=>{const k=+l.dataset.p;l.classList.toggle('on',k===n);l.classList.toggle('feito',k<n)});
  const cx=s.closest('.gbm-cx');if(cx)cx.scrollTop=0;if(n===3)resumo()}
 function abre(n,msg){if(!window.gbAbreApp)return;window.gbAbreApp('festa');vai(n||passo);const ok=$('#feOk');ok.hidden=!msg;ok.textContent=msg||''}
 window.gbAbreFesta=abre;
 // o que já está no carrinho: o da loja (arco, mini arco, cromado, mesa) e o da home (pacotes sortidos)
 function resumo(){
  const box=$('#feResumo');box.innerHTML='<p class="fe-vz">Carregando...</p>';
  let L=[];try{L=JSON.parse(localStorage.getItem('glowbos_cart_D'))||[]}catch(e){}
  fetch(s.dataset.loja,{credentials:'same-origin'}).then(r=>r.json()).catch(()=>({items:[]})).then(c=>{
   const it=(c.items||[]).map(x=>{const m=Math.pow(10,(x.totals&&x.totals.currency_minor_unit)||2);return{n:x.name,q:x.quantity,v:(+(x.totals&&x.totals.line_total)||0)/m,i:x.images&&x.images[0]&&x.images[0].thumbnail,d:(x.item_data||[]).map(d=>d.value).join(' · ')}})
    .concat(L.map(x=>({n:x.n,q:x.q,v:x.p*x.q,i:x.i&&x.i.indexOf('data:')!==0?x.i:'',d:''})));
   box.innerHTML=it.length?it.map(x=>'<div class="fe-i">'+(x.i?'<img src="'+x.i+'" alt="">':'<span class="fe-ii"></span>')+'<div><b>'+x.q+'× '+x.n+'</b>'+(x.d?'<small>'+x.d+'</small>':'')+'</div><em>'+R(x.v)+'</em></div>').join(''):'<p class="fe-vz">Ainda não tem nada na sua festa. Volte e escolha os balões.</p>';
   $('#feTot').textContent=R(it.reduce((a,x)=>a+x.v,0));$('#feFim').disabled=!it.length})}
 s.addEventListener('click',e=>{
  const v=e.target.closest('[data-vai]');if(v){vai(+v.dataset.vai);$('#feOk').hidden=true;return}
  const g=e.target.closest('[data-go]');if(g){window.gbFesta=1;P('gb_festa','1');window.gbAbreApp&&window.gbAbreApp(g.dataset.go);return}
  if(e.target.closest('a.fe-c'))P('gb_festa','1');
 });
 // finalizar: se tem pacote no carrinho da home, a ponte leva ele pra loja e vai pro checkout
 $('#feFim').onclick=()=>{P('gb_festa',null);P('gb_festa_passo',null);let L=[];try{L=JSON.parse(localStorage.getItem('glowbos_cart_D'))||[]}catch(e){}
  const b=document.querySelector('.gf .btn');if(L.length&&b)b.click();else location.href=s.dataset.checkout};
 // voltou de um montador: arco (arco.js) e pacotes da home (gbPoe) chamam aqui em vez de ir pro carrinho
 window.gbFestaVolta=nome=>{window.gbFesta=0;setTimeout(()=>{document.body.classList.remove('gaberta');abre(1,'✓ '+(nome||'Balões')+' na sua festa. Quer mais balões ou vamos pra mesa?')},500)};
 const poe=window.gbPoe;if(poe)window.gbPoe=function(n){poe.apply(this,arguments);if(window.gbFesta)window.gbFestaVolta(n.split(' · ')[0])};
 const pl=window.gbPoeLista;if(pl)window.gbPoeLista=function(it,nome){pl.apply(this,arguments);if(window.gbFesta)window.gbFestaVolta('Arco '+nome)};
 // fechou a janela no meio de um montador: sai do modo festa
 document.addEventListener('click',e=>{if(e.target.closest('#gbm [data-fecha]'))window.gbFesta=0},true);
 vai(passo);
 if(/[?&]festa=/.test(location.search)||location.hash==='#festa')setTimeout(()=>abre(passo,G('gb_festa')?'✓ Pronto, está na sua festa. Quer mais alguma coisa?':''),350);
})();
