// monte sua festa (26/10): passos na mesma janela (balões, pratos, guardanapo, garfos, copos, velas, sua festa); a festa vira um kit no carrinho do cantinho
(function(){
 const s=document.getElementById('festa');if(!s)return;
 const $=q=>s.querySelector(q),D=JSON.parse(s.dataset.d),IMG=s.dataset.img,IT=D.it,COR=D.cores,PAL=D.pal;
 const R=v=>'R$ '+v.toFixed(2).replace('.',','),SORT=['pct50','pct75','pct100','pct125'].filter(k=>IT[k]),MESA=Object.keys(IT).filter(k=>IT[k].mesa);
 // o cliente escolhe UM tipo de balão (arco, mini arco ou sortido); a mesa vem nos passos seguintes, cada item com foto
 const S={tipo:'',arco:{n:0,c:[],por:{}},mini:{c:[]},sort:{k:'',c:[]},q:{}};MESA.forEach(k=>S.q[k]={});
 const bola=(a,b)=>'<i class="fe-b" style="background:radial-gradient(circle at 35% 30%,'+b+','+a+' 70%)"></i>';
 const lisos=(id,sel,max)=>'<p class="fe-q">As cores <small>até '+max+' · '+sel.length+' escolhida'+(sel.length===1?'':'s')+'</small></p><div class="fe-cs">'+Object.keys(COR).map(k=>{const i=sel.indexOf(k);return '<button type="button" data-cor="'+id+'" data-k="'+k+'" class="'+(i>-1?'on':(sel.length>=max?'cheio':''))+'"><img src="'+IMG+'b_'+k+'.webp" alt="">'+COR[k]+(i>-1?'<em>'+(i+1)+'</em>':'')+'</button>'}).join('')+'</div>';
 // mesa: com paleta, quantos de cada cor; sem paleta (velas), só a quantidade
 // mesa: quadradinhos de cor (toca = +1 pacote, número no canto, − pra tirar); vela sem cor = um quadradinho só
 const qtd=k=>{const P=IT[k].pal?PAL[IT[k].pal]:{'':['','']},Q=S.q[k];const n0=Object.keys(P).length,col=window.gbFeCol||(n0<=8?n0:Math.ceil(n0/2));return '<div class="fe-sw" style="--col:'+col+'">'+Object.keys(P).map(c=>{const n=Q[c]||0,num=IT[k].pal==='num';
  return '<div class="fe-t'+(n?' on':'')+'"><button type="button" class="fe-tb" data-q="'+k+'" data-c="'+c+'" data-d="1">'+(c?(num?'<i class="fe-tn">'+c+'</i>':'<i class="fe-ts" style="background:radial-gradient(circle at 35% 30%,'+P[c][1]+','+P[c][0]+' 72%)"></i>'):'<i class="fe-ts fe-ta">+</i>')+'<span>'+(c?(num?'Número '+c:c):'Adicionar')+'</span></button>'+(n?'<em>'+n+'</em><button type="button" class="fe-tm2" data-q="'+k+'" data-c="'+c+'" data-d="-1" aria-label="Tirar um">−</button>':'')+'</div>'}).join('')+'</div>'};
 const TIPO=[['arco','Arco de balões','De 60 a 160 balões',IMG+'arco_tam_100.webp',D.arco.length?'a partir de '+R(Math.min.apply(0,D.arco.map(a=>a.p))):''],['mini','Mini arco','Arco de mesa, 50 de 5"',IT.miniarco&&IT.miniarco.foto,IT.miniarco?R(IT.miniarco.p):''],['sort','Balões sortidos','De 50 a 125 balões de 8"',IMG+'banner_pacotes_m.webp',SORT.length?'a partir de '+R(IT[SORT[0]].p):'']].filter(t=>t[0]!=='mini'||IT.miniarco);
 // 26/10: por passos, tudo na mesma janela: um passo por vez, Voltar e Próximo, e o carrinho só no fim
 const PASSOS=[{id:'bal',t:'Balões'},{id:'pratos',t:'Pratos',k:['prato20','prato30']},{id:'guard',t:'Guardanapo',k:['guardanapo']},{id:'garfo',t:'Garfos',k:['garfo25']},{id:'copo',t:'Copos',k:['copo25']},{id:'velas',t:'Velas',k:Object.keys(IT).filter(k=>k.indexOf('velas')===0)},{id:'fim',t:'Sua festa'}]
  .map(p=>p.k?Object.assign(p,{k:p.k.filter(k=>IT[k])}):p).filter(p=>!p.k||p.k.length);
 let P=0;
 const feito=p=>p.id==='bal'?balao():p.k?p.k.some(k=>Object.values(S.q[k]).some(Boolean)):false;
 function lista(){
  const p=PASSOS[P],tot=itens().reduce((a,x)=>a+x.v,0);
  let h='<ol class="fe-pp" style="--n:'+PASSOS.length+'">'+PASSOS.map((x,i)=>'<li class="'+(i===P?'on':feito(x)?'ok':'')+'"><button type="button" data-ir="'+i+'"><i>'+(i!==P&&feito(x)?'✓':i+1)+'</i><span>'+x.t+'</span></button></li>').join('')+'</ol><div class="fe-k">';
  if(p.id==='bal'){
   h+='<div class="fe-kh"><div><b>Os balões</b><small>Escolha um: arco, mini arco ou balões sortidos.</small></div><button type="button" class="fe-pl" data-ir="1">'+'Próximo →'+'</button></div><div class="fe-tp">'+
    TIPO.map(t=>'<button type="button" data-tipo="'+t[0]+'" class="'+(S.tipo===t[0]?'on':'')+'"><span><img src="'+t[3]+'" alt=""></span><b>'+t[1]+'</b><small>'+t[2]+'</small><em>'+t[4]+'</em></button>').join('')+'</div>';
   if(S.tipo==='arco'){const A=D.arco.find(x=>x.n===S.arco.n);h+='<p class="fe-q">O tamanho</p><div class="fe-tm">'+D.arco.map(x=>'<button type="button" data-arco="'+x.n+'" class="'+(x.n===S.arco.n?'on':'')+'"><b>'+x.n+'</b> balões<em>'+R(x.p)+'</em></button>').join('')+'</div>'+(A?'<div class="fe-ar"><img src="'+IMG+'arco_tam_'+A.n+'.webp" alt="Arco de '+A.n+' balões"><div>'+lisos('arco',S.arco.c,A.c)+'</div></div>'+kit(A):'')}
   if(S.tipo==='mini')h+=lisos('mini',S.mini.c,IT.miniarco.c);
   if(S.tipo==='sort')h+='<p class="fe-q">O tamanho</p><div class="fe-tm">'+SORT.map(k=>'<button type="button" data-sort="'+k+'" class="'+(k===S.sort.k?'on':'')+'"><b>'+IT[k].s.split(' ')[0]+'</b> balões<em>'+R(IT[k].p)+'</em></button>').join('')+'</div>'+(S.sort.k?lisos('sort',S.sort.c,IT[S.sort.k].c):'');
  }else if(p.k){
   h+='<div class="fe-kh"><div><b>'+p.t+'</b><small>'+(p.id==='velas'?'Toque na vela que quer. Toque de novo pra pôr mais.':'Toque na cor pra pôr um pacote. Toque de novo pra pôr mais.')+'</small></div><button type="button" class="fe-pl" data-ir="'+(P+1)+'">'+'Próximo →'+'</button></div><div class="fe-ms">'+
    (window.gbFeCol=Math.max.apply(0,p.k.map(k=>{const n=IT[k].pal?Object.keys(PAL[IT[k].pal]).length:1;return n<=8?n:Math.ceil(n/2)})),'')+p.k.map(k=>'<div class="fe-m"><img src="'+IT[k].foto+'" alt=""><div>'+(p.k.length>1?'<b>'+IT[k].t+'</b>':'')+'<small class="fe-pr">'+IT[k].s+' · <strong>'+R(IT[k].p)+'</strong></small>'+qtd(k)+'</div></div>').join('')+'</div>';
  }else h+='<div class="fe-kh"><div><b>Sua festa</b><small>Confira e coloque tudo no carrinho de uma vez.</small></div></div>';
  h+='</div>';
  if(p.id==='fim')h+='<div class="fe-nav fe-nav2"><button type="button" class="btn lin" data-ir="'+(P-1)+'">← Voltar</button></div>';
  else h+='<div class="fe-nav">'+(P?'<button type="button" class="btn lin" data-ir="'+(P-1)+'">← Voltar</button>':'<span></span>')+'<div class="fe-nt"><small>Até agora</small><b>'+R(tot)+'</b></div><button type="button" class="btn pri" data-ir="'+(P+1)+'">'+'Próximo →'+'</button></div>';
  window.gbFeCol=0;$('#feLista').innerHTML=h;
  s.querySelector('.fe-fim').style.display=p.id==='fim'?'':'none';
  resumo();
 }
 // arco: cada tamanho de balão leva as cores marcadas nele (todas por padrão) e divide igual entre elas
 const POL=A=>Object.keys(A.b).sort((x,y)=>y-x);
 function porDe(A,p){const c=(S.arco.por[p]||S.arco.c).filter(k=>S.arco.c.indexOf(k)>-1);return c.length?c:S.arco.c.slice()}
 function divArco(A){const d={};POL(A).forEach(p=>{const c=porDe(A,p);d[p]={};c.forEach((k,i)=>d[p][k]=Math.floor(A.b[p]/c.length)+(i<A.b[p]%c.length?1:0))});return d}
 function kit(A){if(!S.arco.c.length)return '';const d=divArco(A);
  return '<p class="fe-q">O que vem no kit <small>'+(S.arco.c.length>1?'toque numa cor pra tirar ou pôr ela naquele tamanho':'')+'</small></p><div class="fe-kit">'+POL(A).map(p=>'<div class="fe-kl"><div class="fe-kp"><b>'+p+'"</b><span>'+A.b[p]+' balões</span></div><div class="fe-kc">'+S.arco.c.map(k=>{const q=d[p][k]||0;return '<button type="button" class="fe-kq'+(q?'':' off')+'" data-pp="'+p+'" data-k="'+k+'"><img src="'+IMG+'b_'+k+'.webp" alt="">'+(q?q+' ':'')+COR[k]+'</button>'}).join('')+'</div></div>').join('')+'</div>'}
 function balao(){return (S.tipo==='arco'&&S.arco.n&&S.arco.c.length)||(S.tipo==='mini'&&S.mini.c.length)||(S.tipo==='sort'&&S.sort.k&&S.sort.c.length)}
 function itens(){const L=[];
  const A=D.arco.find(x=>x.n===S.arco.n);if(S.tipo==='arco'&&A&&S.arco.c.length)L.push({k:'arco',n:A.n,cores:S.arco.c,t:'Arco de '+A.n+' balões',d:S.arco.c.map(k=>COR[k]).join(', '),v:A.p});
  if(S.tipo==='mini'&&S.mini.c.length)L.push({k:'miniarco',cores:S.mini.c,t:'Mini arco',d:S.mini.c.map(k=>COR[k]).join(', '),v:IT.miniarco.p});
  if(S.tipo==='sort'&&S.sort.k&&S.sort.c.length)L.push({k:S.sort.k,cores:S.sort.c,t:'Pacote '+IT[S.sort.k].s,d:S.sort.c.map(k=>COR[k]).join(', '),v:IT[S.sort.k].p});
  MESA.forEach(k=>{const Q=S.q[k],c=Object.keys(Q).filter(x=>Q[x]);if(c.length){const t=c.reduce((a,x)=>a+Q[x],0);L.push({k:k,q:Q,t:t+'× '+IT[k].t,d:c.filter(Boolean).map(x=>Q[x]+' '+x).join(', '),v:IT[k].p*t})}});
  return L}
 function resumo(){const L=itens();
  $('#feResumo').innerHTML=L.length?L.map(x=>'<div class="fe-i"><div><b>'+x.t+'</b><small>'+x.d+'</small></div><em>'+R(x.v)+'</em><button type="button" class="fe-mu" data-ir="'+passoDe(x.k)+'">Mudar</button></div>').join(''):'<p class="fe-vz">Sua festa ainda está vazia. Volte e escolha os balões.</p>';
  $('#feTot').textContent=R(L.reduce((a,x)=>a+x.v,0));const b=$('#feFim');b.disabled=!L.length;b.textContent=L.length?'Colocar a festa no carrinho':'Escolha pelo menos um item'}
 // rola a caixa da janela (ou a página) até o ponto: no topo dele, ou com ele no pé da tela
 function rola(el,pe){const c=s.closest('.gbm-cx')||document.scrollingElement,r=el.getBoundingClientRect(),cr=c===document.scrollingElement?{top:0}:c.getBoundingClientRect();let top=c.scrollTop+r.top-cr.top-56;if(pe)top=c.scrollTop+r.bottom-cr.top-c.clientHeight+24;c.scrollTo({top:Math.max(0,top),behavior:window.gbInstant?'auto':'smooth'})}
 // no resumo, "Mudar" leva pro passo daquele item
 function passoDe(k){const i=PASSOS.findIndex(p=>p.k&&p.k.indexOf(k)>-1);return i>-1?i:0}
 function troca(arr,k,max){const i=arr.indexOf(k);if(i>-1)arr.splice(i,1);else if(arr.length<max)arr.push(k)}
 s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!s.contains(b)||b.id==='feFim')return;const x=b.dataset;
  if(x.ir!==undefined){P=Math.max(0,Math.min(PASSOS.length-1,+x.ir));lista();const cx=s.closest('.gbm-cx');if(cx)cx.scrollTop=0;return}
  if(x.tipo!==undefined)S.tipo=S.tipo===x.tipo?'':x.tipo;
  else if(x.arco!==undefined){S.arco.n=+x.arco;S.arco.por={};const A=D.arco.find(a=>a.n===S.arco.n);if(A)S.arco.c=S.arco.c.slice(0,A.c)}
  else if(x.sort!==undefined){S.sort.k=x.sort;S.sort.c=S.sort.c.slice(0,IT[x.sort].c)}
  else if(x.pp!==undefined){const A=D.arco.find(a=>a.n===S.arco.n),c=porDe(A,x.pp).slice(),i=c.indexOf(x.k);if(i>-1){if(c.length<2)return;c.splice(i,1)}else c.push(x.k);S.arco.por[x.pp]=S.arco.c.filter(k=>c.indexOf(k)>-1)}
  else if(x.cor==='arco')troca(S.arco.c,x.k,D.arco.find(a=>a.n===S.arco.n).c);
  else if(x.cor==='mini')troca(S.mini.c,x.k,IT.miniarco.c);
  else if(x.cor==='sort')troca(S.sort.c,x.k,IT[S.sort.k].c);
  else if(x.q){const Q=S.q[x.q];Q[x.c]=Math.max(0,Math.min(99,(Q[x.c]||0)+(+x.d)))}
  else return;
  const y=b.getBoundingClientRect().top;lista();const n=s.querySelector('button[data-'+Object.keys(x)[0]+'="'+Object.values(x)[0]+'"]');const cx=s.closest('.gbm-cx');if(n&&cx)cx.scrollTop+=n.getBoundingClientRect().top-y;
  // leva pro lugar certo: tipo → tamanho (ou cores), tamanho → cores, cores completas → Próximo
  const cheio=(c,m)=>c.length&&c.length>=m;let alvo=null;
  if(x.tipo!==undefined&&S.tipo)alvo=s.querySelector('.fe-tm')||s.querySelector('.fe-cs');
  else if((x.arco!==undefined&&S.arco.n)||(x.sort!==undefined&&S.sort.k))alvo=s.querySelector('.fe-cs');
  else if((x.cor==='arco'&&cheio(S.arco.c,D.arco.find(a=>a.n===S.arco.n).c))||(x.cor==='mini'&&cheio(S.mini.c,IT.miniarco.c))||(x.cor==='sort'&&cheio(S.sort.c,IT[S.sort.k].c)))alvo=s.querySelector('.fe-nav');
  if(alvo)setTimeout(()=>rola(alvo,alvo.classList.contains('fe-nav')),120);
 });
 // a festa é um kit: tudo soma no carrinho do cantinho (a ponte leva pra loja no Finalizar compra)
 function arcoTxt(A){const d=divArco(A);return 'Arco '+A.n+' balões · '+POL(A).map(p=>p+'": '+Object.keys(d[p]).filter(k=>d[p][k]).map(k=>COR[k]+' '+d[p][k]).join(', ')).join(' · ')}
 $('#feFim').onclick=()=>{const L=itens();if(!L.length||!window.gbPoeItem)return;
  L.forEach(x=>{
   if(x.k==='arco'){const A=D.arco.find(a=>a.n===x.n);window.gbPoeItem({n:'Arco '+A.n+' balões · '+x.d,p:A.p,i:IMG+'arco_tam_'+A.n+'.webp',q:1,k:'kit'+A.n,pal:arcoTxt(A)},false)}
   else if(x.cores)window.gbPoeItem({n:(x.k==='miniarco'?'Mini arco':'Pacote '+IT[x.k].s)+' · '+x.d,p:IT[x.k].p,i:IT[x.k].foto||'',q:1,k:x.k,pal:x.d},false);
   else Object.keys(x.q).filter(c=>x.q[c]).forEach(c=>window.gbPoeItem({n:IT[x.k].t+(c?' · '+c:''),p:IT[x.k].p,i:IT[x.k].foto||'',q:x.q[c],k:x.k,pal:c},false));
  });
  S.tipo='';S.arco={n:0,c:[],por:{}};S.mini={c:[]};S.sort={k:'',c:[]};MESA.forEach(k=>S.q[k]={});P=0;lista();
  const f=document.querySelector('#gbm [data-fecha]');if(f)f.click();
  setTimeout(()=>{document.body.classList.add('gaberta');const t=document.getElementById('toast');if(t){t.textContent='✓ Sua festa está no carrinho';t.classList.add('on');setTimeout(()=>t.classList.remove('on'),1800)}},250)};
 lista();
 if(/[?&]festa=/.test(location.search)||location.hash==='#festa')setTimeout(()=>window.gbAbreApp&&window.gbAbreApp('festa'),350);
})();
