// monte seu arco: escolhe a receita, ajusta os metros e a lista vira pacotes no carrinho
(function(){
 const CO={amarelo:['Amarelo','#f7d22e'],azul_baby:['Azul baby','#a9d1ef'],azul_celeste:['Azul celeste','#7fb2e5'],azul_cobalto:['Azul cobalto','#1f4fa8'],azul_royal:['Azul royal','#2448c8'],bege:['Bege','#e8d2b4'],branco:['Branco','#f7f5f2'],cinza:['Cinza','#b9b7b5'],dourado:['Dourado','#d7ae49'],laranja:['Laranja','#f58a2c'],lilas:['Lilás','#c3aee3'],marrom:['Marrom','#7a4b33'],pink:['Pink','#e8378a'],preto:['Preto','#232226'],rosa:['Rosa','#f4b6c8'],roxo:['Roxo','#6b3fa0'],tiffany:['Tiffany','#3cc2c6'],verde_agua:['Verde água','#a6e0cd'],verde_bandeira:['Verde bandeira','#16954a'],verde_citrus:['Verde citrus','#8ccc3e'],vermelho:['Vermelho','#d8262e']};
 const AR=[
  {f:'09_candy_algodao',t:'Algodão doce',g:'Infantil',c:['rosa','azul_baby','amarelo','verde_agua'],et:['montagem/a09_1','montagem/a09_2','montagem/a09_3','montagem/a09_4']},
  {f:'01_vivo_arco-iris',t:'Arco-íris',g:'Infantil',c:['pink','amarelo','azul_royal','laranja','verde_citrus']},
  {f:'02_vivo_primarias',t:'Primárias',g:'Infantil',c:['vermelho','amarelo','azul_royal','verde_bandeira']},
  {f:'10_candy_morango',t:'Morango',g:'Infantil',c:['vermelho','rosa','branco','pink']},
  {f:'08_pastel_bebe',t:'Chá de bebê',g:'Chá de bebê',c:['rosa','azul_baby','branco','bege']},
  {f:'05_analoga_fria',t:'Menta e céu',g:'Chá de bebê',c:['verde_agua','azul_baby','tiffany']},
  {f:'06_analoga_lilas',t:'Lilás',g:'15 anos',c:['lilas','azul_celeste','roxo','rosa']},
  {f:'03_vivo_joias',t:'Joias',g:'Adulto',c:['verde_bandeira','azul_cobalto','roxo','vermelho']},
  {f:'04_analoga_quente',t:'Pêssego',g:'Adulto',c:['laranja','bege','rosa','marrom']},
  {f:'07_pastel_neutro',t:'Nude',g:'Adulto',c:['bege','branco','marrom']},
  {f:'14_vermelho_preto_amarelo',t:'Rubro-negro',g:'Torcida',c:['vermelho','preto','amarelo']},
  {f:'15_preto_e_branco',t:'Preto e branco',g:'Torcida',c:['preto','branco']},
  {f:'16_verde_e_branco',t:'Alviverde',g:'Torcida',c:['verde_bandeira','branco']}
 ];
 const TAM=['16','12','9','5'],DENS={'16':1.6,'12':16,'9':10,'5':14},MIN=2,MAX=5;
 const PK={'5':[50,17.98,'pacote_5pol'],'9':[50,14.89,'pacote_9pol'],'12':[25,21.50,'pacote_12pol'],'16':[12,21.97,'pacote_16pol']};
 const IMG=(document.getElementById('gbArco')||{}).dataset?document.getElementById('gbArco').dataset.img:'img/';const $=s=>document.querySelector(s),R=v=>'R$ '+v.toFixed(2).replace('.',','),fm=m=>String(Math.round(m*10)/10).replace('.',',')+' m';
 if(!$('#maArcos'))return;
 let g='Todos',a=AR[0],m=3,alvo=0;
 function pesos(n,t){const w=[];for(let i=0;i<n;i++){const x=n-i,y=i+1;w.push(t==='16'?(i<2?x*x:0):t==='12'?x+1:t==='9'?2:y)}return w}
 function calc(){const q={};a.c.forEach(c=>q[c]={'16':0,'12':0,'9':0,'5':0});let tot=0;
  TAM.forEach(t=>{const w=pesos(a.c.length,t),s=w.reduce((x,y)=>x+y,0);a.c.forEach((c,i)=>{q[c][t]=w[i]?Math.ceil(DENS[t]*m*w[i]/s*1.1):0;tot+=q[c][t]})});
  let gr=0;a.c.forEach(c=>gr+=q[c]['16']+q[c]['12']);const min=Math.round(35*m/15)*15,h=Math.floor(min/60),mm=min%60;
  return {q,tot,cachos:Math.round(gr/4),fita:fm(m+.5),tempo:(h?h+'h'+(mm?(mm<10?'0':'')+mm:''):mm+' min')}}
 function compra(c){const it=[];let v=0;TAM.forEach(t=>{const n=a.c.reduce((x,k)=>x+c.q[k][t],0);if(!n)return;const [u,p,img]=PK[t],qt=Math.ceil(n/u);
   const pal=a.t+' '+fm(m)+': '+a.c.filter(k=>c.q[k][t]).map(k=>CO[k][0]+' '+c.q[k][t]).join(', ');
   it.push({n:'Pacote '+u+' balões '+t+'" · '+pal,p,i:IMG+''+img+'.webp',q:qt});v+=p*qt});
  it.push({n:'Fita 5 m + dupla face',p:11.98,i:IMG+'fita_105.webp',q:1});v+=11.98;return {it,v}}
 function foto(){if(!a.et)return IMG+'arco_'+a.f+'.webp';const fs=a.et.concat(['arco_'+a.f]),k=Math.round((m-MIN)/(MAX-MIN)*(fs.length-1));return IMG+''+fs[Math.max(0,Math.min(fs.length-1,k))]+'.webp'}
 function troca(){const box=$('#maFoto'),f=foto(),at=box.querySelector('img.at');$('#maMont').style.display=a.et?'':'none';if(!at||at.getAttribute('src')===f)return;
  box.querySelectorAll('img.nx').forEach(x=>x.remove());const n=new Image();n.className='nx';n.alt=at.alt;n.src=f;box.appendChild(n);
  n.onload=()=>{requestAnimationFrame(()=>n.style.opacity=1);setTimeout(()=>{at.remove();n.className='at';n.style.opacity=''},350)}}
 function lista(){const c=calc(),b=compra(c);
  $('#maTab').innerHTML='<div class="ma-lh"><b>Sua lista de balões</b><span><b>'+c.tot+'</b> balões</span></div><table><thead><tr><th>Cor</th><th>16"</th><th>12"</th><th>9"</th><th>5"</th></tr></thead><tbody>'+
   a.c.map(k=>'<tr><td class="nm"><i style="background:'+CO[k][1]+'"></i>'+CO[k][0]+'</td>'+TAM.map(t=>{const v=c.q[k][t];return '<td class="'+(v?'':'z')+'">'+(v||'·')+'</td>'}).join('')+'</tr>').join('')+
   '</tbody></table><div class="ma-ex"><div>Fita de arco<b>'+c.fita+'</b></div><div>Cachos de 4<b>'+c.cachos+'</b></div><div>Montagem<b>'+c.tempo+'</b></div></div>';
  $('#maTot').textContent=R(b.v);$('#maPk').textContent=b.it.map(x=>x.q+'× '+x.n.split(' · ')[0].replace('Pacote ','').replace(' + dupla face','')).join(' · ');return b}
 function abas(){const G=['Todos'].concat([...new Set(AR.map(x=>x.g))]);$('#maTabs').innerHTML=G.map(x=>'<button class="'+(x===g?'on':'')+'">'+x+'</button>').join('');
  $('#maTabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{g=b.textContent;abas();arcos()})}
 function arcos(){const L=AR.filter(x=>g==='Todos'||x.g===g);if(L.indexOf(a)<0)a=L[0];
  $('#maArcos').innerHTML=L.map(x=>'<button class="'+(x===a?'on':'')+'" data-f="'+x.f+'"><img src="'+IMG+'arco_'+x.f+'.webp" alt="" loading="lazy"><span>'+x.t+'</span></button>').join('');
  $('#maArcos').querySelectorAll('button').forEach(b=>b.onclick=()=>{a=AR.find(x=>x.f===b.dataset.f);alvo=0;$('#maCores').hidden=true;arcos()});troca();lista()}
 $('#maM').oninput=e=>{m=+e.target.value;$('#maMv').textContent=fm(m);troca();lista()};
 function cores(){const box=$('#maCores');box.innerHTML='<div style="width:100%;font-size:13px;color:var(--vinho2)">Trocar <b>'+CO[a.c[alvo]][0]+'</b> por:</div>'+
   a.c.map((k,i)=>'<button data-i="'+i+'" class="'+(i===alvo?'on':'')+'"><i style="background:'+CO[k][1]+'"></i>'+CO[k][0]+'</button>').join('')+'<div style="width:100%;height:1px;background:#ece8eb;margin:4px 0"></div>'+
   Object.keys(CO).filter(k=>a.c.indexOf(k)<0).map(k=>'<button data-k="'+k+'"><i style="background:'+CO[k][1]+'"></i>'+CO[k][0]+'</button>').join('');
  box.querySelectorAll('button[data-i]').forEach(b=>b.onclick=()=>{alvo=+b.dataset.i;cores()});
  box.querySelectorAll('button[data-k]').forEach(b=>b.onclick=()=>{a.c[alvo]=b.dataset.k;cores();lista()})}
 $('#maTrocar').onclick=()=>{const box=$('#maCores');box.hidden=!box.hidden;if(!box.hidden)cores()};
 $('#maComprar').onclick=()=>{const b=lista(),bt=$('#maComprar');bt.disabled=true;bt.textContent='Colocando no carrinho...';
  const it=b.it.map(x=>{const v=x.n.match(/^Pacote (\d+) balões (\d+)" · (.+)$/);return v?{k:'pct'+v[2]+'_'+v[1],q:x.q,paleta:v[3]}:{k:'fita',q:x.q}});
  const fd=new FormData();fd.append('itens',JSON.stringify(it));
  fetch(document.getElementById('gbArco').dataset.add,{method:'POST',body:fd,credentials:'same-origin'}).then(r=>r.json()).then(j=>{if(j&&j.success)location.href=j.data.carrinho;else{bt.disabled=false;bt.textContent='Comprar esta lista'}}).catch(()=>{bt.disabled=false;bt.textContent='Comprar esta lista'})};
 abas();arcos();
})();

