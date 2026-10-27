// monte sua festa (26/10): uma tela só, do primeiro balão até o fim; a festa vira um kit no carrinho do cantinho
(function(){
 const s=document.getElementById('festa');if(!s)return;
 const $=q=>s.querySelector(q),D=JSON.parse(s.dataset.d),IMG=s.dataset.img,IT=D.it,COR=D.cores,PAL=D.pal;
 const R=v=>'R$ '+v.toFixed(2).replace('.',','),SORT=['pct50','pct75','pct100','pct125'].filter(k=>IT[k]),QTD=['metal5_25','prato20','prato30','guardanapo'].filter(k=>IT[k]);
 const S={arco:{n:0,c:[]},mini:{on:0,c:[]},sort:{k:'',c:[]},q:{}};QTD.forEach(k=>S.q[k]={});
 const bola=(a,b)=>'<i class="fe-b" style="background:radial-gradient(circle at 35% 30%,'+b+','+a+' 70%)"></i>';
 // escolha de cores lisas (até max), com a foto do balão
 const lisos=(id,sel,max)=>'<p class="fe-q">As cores <small>até '+max+' · '+sel.length+' escolhida'+(sel.length===1?'':'s')+'</small></p><div class="fe-cs">'+Object.keys(COR).map(k=>{const i=sel.indexOf(k);return '<button type="button" data-cor="'+id+'" data-k="'+k+'" class="'+(i>-1?'on':(sel.length>=max?'cheio':''))+'"><img src="'+IMG+'b_'+k+'.webp" alt="">'+COR[k]+(i>-1?'<em>'+(i+1)+'</em>':'')+'</button>'}).join('')+'</div>';
 // quantidade por cor (cromado, pratos, guardanapo)
 const qtd=k=>{const P=PAL[IT[k].pal],Q=S.q[k];return '<div class="fe-qs">'+Object.keys(P).map(c=>{const n=Q[c]||0;return '<div class="fe-qc'+(n?' on':'')+'">'+bola(P[c][0],P[c][1])+'<span>'+c+'</span><button type="button" data-q="'+k+'" data-c="'+c+'" data-d="-1"'+(n?'':' disabled')+' aria-label="Menos">−</button><b>'+n+'</b><button type="button" data-q="'+k+'" data-c="'+c+'" data-d="1" aria-label="Mais">+</button></div>'}).join('')+'</div>'};
 const bloco=(n,t,sub,corpo,ok)=>'<div class="fe-k'+(ok?' ok':'')+'"><div class="fe-kh"><i>'+(ok?'✓':n)+'</i><div><b>'+t+'</b><small>'+sub+'</small></div></div>'+corpo+'</div>';
 function lista(){
  let h='',n=1;const A=D.arco.find(x=>x.n===S.arco.n);
  if(D.arco.length)h+=bloco(n++,'Arco de balões','De 60 a 160 balões. A gente divide os balões igual entre as cores.',
   '<div class="fe-tm"><button type="button" data-arco="0" class="'+(S.arco.n?'':'on')+'">Sem arco</button>'+D.arco.map(x=>'<button type="button" data-arco="'+x.n+'" class="'+(x.n===S.arco.n?'on':'')+'"><b>'+x.n+'</b> balões<em>'+R(x.p)+'</em></button>').join('')+'</div>'+
   (A?'<div class="fe-ar"><img src="'+IMG+'arco_tam_'+A.n+'.webp" alt="Arco de '+A.n+' balões"><div>'+lisos('arco',S.arco.c,A.c)+'</div></div>':''),A&&S.arco.c.length);
  if(IT.miniarco)h+=bloco(n++,'Mini arco',IT.miniarco.s+' · '+R(IT.miniarco.p),
   '<div class="fe-tm"><button type="button" data-mini="0" class="'+(S.mini.on?'':'on')+'">Sem mini arco</button><button type="button" data-mini="1" class="'+(S.mini.on?'on':'')+'">Quero o mini arco</button></div>'+(S.mini.on?lisos('mini',S.mini.c,IT.miniarco.c):''),S.mini.on&&S.mini.c.length);
  if(SORT.length)h+=bloco(n++,'Balões sortidos','Pacotes de balões de 8" pra encher em casa.',
   '<div class="fe-tm"><button type="button" data-sort="" class="'+(S.sort.k?'':'on')+'">Sem pacote</button>'+SORT.map(k=>'<button type="button" data-sort="'+k+'" class="'+(k===S.sort.k?'on':'')+'"><b>'+IT[k].s.split(' ')[0]+'</b> balões<em>'+R(IT[k].p)+'</em></button>').join('')+'</div>'+(S.sort.k?lisos('sort',S.sort.c,IT[S.sort.k].c):''),S.sort.k&&S.sort.c.length);
  QTD.forEach(k=>{const t=Object.values(S.q[k]).reduce((a,b)=>a+b,0);h+=bloco(n++,IT[k].t,IT[k].s+' · '+R(IT[k].p)+' cada. Escolha quantos de cada cor.',qtd(k),t)});
  $('#feLista').innerHTML=h;resumo();
 }
 function itens(){const L=[];
  const A=D.arco.find(x=>x.n===S.arco.n);if(A&&S.arco.c.length)L.push({k:'arco',n:A.n,cores:S.arco.c,t:'Arco de '+A.n+' balões',d:S.arco.c.map(k=>COR[k]).join(', '),v:A.p});
  if(S.mini.on&&S.mini.c.length)L.push({k:'miniarco',cores:S.mini.c,t:'Mini arco',d:S.mini.c.map(k=>COR[k]).join(', '),v:IT.miniarco.p});
  if(S.sort.k&&S.sort.c.length)L.push({k:S.sort.k,cores:S.sort.c,t:'Pacote '+IT[S.sort.k].s,d:S.sort.c.map(k=>COR[k]).join(', '),v:IT[S.sort.k].p});
  QTD.forEach(k=>{const Q=S.q[k],c=Object.keys(Q).filter(x=>Q[x]);if(c.length){const t=c.reduce((a,x)=>a+Q[x],0);L.push({k:k,q:Q,t:t+'× '+IT[k].t,d:c.map(x=>Q[x]+' '+x).join(', '),v:IT[k].p*t})}});
  return L}
 function resumo(){const L=itens();
  $('#feResumo').innerHTML=L.length?L.map(x=>'<div class="fe-i"><div><b>'+x.t+'</b><small>'+x.d+'</small></div><em>'+R(x.v)+'</em></div>').join(''):'<p class="fe-vz">Sua festa ainda está vazia. Escolha acima.</p>';
  $('#feTot').textContent=R(L.reduce((a,x)=>a+x.v,0));const b=$('#feFim');b.disabled=!L.length;b.textContent=L.length?'Colocar a festa no carrinho':'Escolha pelo menos um item'}
 function troca(arr,k,max){const i=arr.indexOf(k);if(i>-1)arr.splice(i,1);else if(arr.length<max)arr.push(k)}
 s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!s.contains(b)||b.id==='feFim')return;const x=b.dataset;
  if(x.arco!==undefined){S.arco.n=+x.arco;const A=D.arco.find(a=>a.n===S.arco.n);if(A)S.arco.c=S.arco.c.slice(0,A.c)}
  else if(x.mini!==undefined)S.mini.on=+x.mini;
  else if(x.sort!==undefined){S.sort.k=x.sort;if(x.sort)S.sort.c=S.sort.c.slice(0,IT[x.sort].c)}
  else if(x.cor==='arco')troca(S.arco.c,x.k,D.arco.find(a=>a.n===S.arco.n).c);
  else if(x.cor==='mini')troca(S.mini.c,x.k,IT.miniarco.c);
  else if(x.cor==='sort')troca(S.sort.c,x.k,IT[S.sort.k].c);
  else if(x.q){const Q=S.q[x.q];Q[x.c]=Math.max(0,Math.min(99,(Q[x.c]||0)+(+x.d)))}
  else return;
  const y=b.getBoundingClientRect().top;lista();const n=s.querySelector('button[data-'+Object.keys(x)[0]+'="'+Object.values(x)[0]+'"]');const cx=s.closest('.gbm-cx');if(n&&cx)cx.scrollTop+=n.getBoundingClientRect().top-y;
 });
 // a festa é um kit: tudo soma no carrinho do cantinho (a ponte leva pra loja no Finalizar compra)
 function arcoTxt(A,c){return 'Arco '+A.n+' balões · '+Object.keys(A.b).sort((x,y)=>y-x).map(p=>p+'": '+c.map((k,i)=>{const q=Math.floor(A.b[p]/c.length)+(i<A.b[p]%c.length?1:0);return q?COR[k]+' '+q:''}).filter(Boolean).join(', ')).join(' · ')}
 $('#feFim').onclick=()=>{const L=itens();if(!L.length||!window.gbPoeItem)return;
  L.forEach(x=>{
   if(x.k==='arco'){const A=D.arco.find(a=>a.n===x.n);window.gbPoeItem({n:'Arco '+A.n+' balões · '+x.d,p:A.p,i:IMG+'arco_tam_'+A.n+'.webp',q:1,k:'kit'+A.n,pal:arcoTxt(A,x.cores)},false)}
   else if(x.cores)window.gbPoeItem({n:(x.k==='miniarco'?'Mini arco':'Pacote '+IT[x.k].s)+' · '+x.d,p:IT[x.k].p,i:IT[x.k].i||'',q:1,k:x.k,pal:x.d},false);
   else Object.keys(x.q).filter(c=>x.q[c]).forEach(c=>window.gbPoeItem({n:IT[x.k].t+' · '+c,p:IT[x.k].p,i:IT[x.k].i||'',q:x.q[c],k:x.k,pal:c},false));
  });
  S.arco={n:0,c:[]};S.mini={on:0,c:[]};S.sort={k:'',c:[]};QTD.forEach(k=>S.q[k]={});lista();
  const f=document.querySelector('#gbm [data-fecha]');if(f)f.click();
  setTimeout(()=>{document.body.classList.add('gaberta');const t=document.getElementById('toast');if(t){t.textContent='✓ Sua festa está no carrinho';t.classList.add('on');setTimeout(()=>t.classList.remove('on'),1800)}},250)};
 lista();
 if(/[?&]festa=/.test(location.search)||location.hash==='#festa')setTimeout(()=>window.gbAbreApp&&window.gbAbreApp('festa'),350);
})();
