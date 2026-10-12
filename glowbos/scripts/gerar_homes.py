# Gera as 4 homes da Glowbos (uma por identidade de 09/10/2026), mesma estrutura.
# Rodar: python3 gerar_homes.py  -> grava em ../prototipo/home_A..D.html e index.html
import csv, os
BASE = os.path.dirname(os.path.abspath(__file__))
PROTO = os.path.join(BASE, '..', 'prototipo')
GL = os.path.join(BASE, '..', '..')

# produtos reais da Shopee (coleta 09/10/2026)
rows = list(csv.DictReader(open(os.path.join(GL, '04_PRODUTOS_ATUAIS/shopee_mayara_festas_2026-10-09/produtos/_lista_produtos.csv'))))[:9]
rows = [r for r in rows if r['ranking'] != '5']
def nome_curto(n):
    n = n.replace('75 unidades Balões 8 Polegadas - ', '').replace('75 unidades Balões - ', '').replace('Balões - ', '').replace('Balão - ', '').replace('Balão ', '')
    n = n.replace('Bexigas ', '').replace('Bexiga ', '').replace(' 8 Polegadas', '').replace('8 Polegadas ', '').replace('N8 ', '')
    return n.strip(' -')
def qtd(n): return '75 balões' if '75' in n else '50 balões'
def vend(v):
    v = int(v); return f'{v//1000} mil+ vendidos' if v >= 1000 else f'{v}+ vendidos'
PRODS = [dict(img=f"img/prod_{int(r['ranking']):02d}.webp", nome=nome_curto(r['nome']), qtd=qtd(r['nome']),
              preco=r['preco'].replace('.', ','), nota=f"{float(r['nota']):.1f}".replace('.', ','), vend=vend(r['vendidos_total'])) for r in rows]

CORES = [('01_vivo_arco-iris', 'Arco-íris'), ('02_vivo_primarias', 'Primárias'), ('03_vivo_joias', 'Joias'),
         ('04_analoga_quente', 'Pêssego'), ('05_analoga_fria', 'Menta e céu'), ('06_analoga_lilas', 'Lilás'),
         ('07_pastel_neutro', 'Nude'), ('08_pastel_bebe', 'Chá de bebê'), ('09_candy_algodao', 'Algodão-doce'),
         ('10_candy_morango', 'Morango'), ('14_vermelho_preto_amarelo', 'Herói'), ('15_preto_e_branco', 'Preto e branco'),
         ('16_verde_e_branco', 'Verde e branco')]
FESTAS = [('cena_01_capa_festa_sala', 'Aniversário', 'A sala vira festa'),
          ('cena_02_cha_revelacao', 'Chá revelação', 'Rosa ou azul no céu'),
          ('cena_03_festa_em_caixa', 'Festa em casa', 'Chega na caixa, monta no chão da sala'),
          ('cena_04_bubble_alice', 'Balão com nome', 'Bubble personalizado')]

PREMIUM = [('premium_1_arco_painel','Arco com painel e nome','Arco orgânico subindo pelo painel arredondado, com o nome da festa.'),
 ('premium_2_numero','Coluna de número','Número metalizado gigante sobre buquê de balões e nuvens.'),
 ('premium_3_gigante','Balão gigante com nome','Bola de 36 polegadas com frase personalizada e borla.'),
 ('premium_4_cromado','Cromado pendurado','Bolas cromadas e rosa presas no teto com laço de cetim.'),
 ('premium_5_futebol','Tema da festa','Futebol, safári, ursinho, abelhinha: o arco na cara do tema.'),
 ('premium_6_preto_ouro','Preto e ouro','Para festa adulta: preto fosco, dourado cromado e champanhe.')]

ESTADOS = [('SP', 32.5), ('MG', 16.4), ('RJ', 10.1), ('RS', 8.6), ('PR', 8.0), ('SC', 5.5), ('BA', 4.9), ('Outros', 14.0)]

JS = r'''<script>
const R=v=>'R$ '+v.toFixed(2).replace('.',',');let C=[];try{C=JSON.parse(localStorage.getItem('glowbos_cart'))||[]}catch(e){}
const salva=()=>{try{localStorage.setItem('glowbos_cart',JSON.stringify(C))}catch(e){}};
var pinta=function(){const q=C.reduce((a,c)=>a+c.q,0);document.getElementById('qt').textContent=q;document.getElementById('qt').style.display=q?'grid':'none';
document.getElementById('gl').innerHTML=C.length?C.map((c,i)=>`<div class="it"><img src="${c.i}"><div><b>${c.n}</b><span>${R(c.p)}</span><div class="qq"><button onclick="mq(${i},-1)">−</button><em>${c.q}</em><button onclick="mq(${i},1)">+</button></div></div></div>`).join(''):'<p class="vz">Seu carrinho está vazio. Escolha as cores da sua festa 🎈</p>';
document.getElementById('tot').textContent=R(C.reduce((a,c)=>a+c.p*c.q,0))}
function add(b){const n=b.dataset.n,p=parseFloat(b.dataset.p.replace(',','.'));const e=C.find(c=>c.n===n);e?e.q++:C.push({n,p,i:b.dataset.i,q:1});salva();pinta();toast('🎈 '+n+' no carrinho');b.textContent='✓ Adicionado';setTimeout(()=>b.textContent='Comprar',1400)}
function mq(i,d){C[i].q+=d;if(C[i].q<1)C.splice(i,1);salva();pinta()}
function abreCarrinho(){document.body.classList.add('gaberta')}function fechaCarrinho(){document.body.classList.remove('gaberta')}
function toast(t){const e=document.getElementById('toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),1800)}
function vePrazo(f){const d=f.querySelector('input').value.replace(/\D/g,''),r=f.parentNode.querySelector('.cep-r');if(d.length!==8){r.className='cep-r err';r.textContent='Digite os 8 números do CEP.';return}
const n=+d;r.className='cep-r ok';r.innerHTML=(n>=1000000&&n<=9999999)?'🎉 <b>Chega hoje!</b> Esse CEP está na área de entrega no mesmo dia.':'📦 Enviamos pro seu CEP. O prazo aparece no carrinho.'}
const rs=[...document.querySelectorAll('.barra .rot')];let ri=0;setInterval(()=>{rs[ri].classList.remove('on');ri=(ri+1)%rs.length;rs[ri].classList.add('on')},3500);pinta();
document.querySelectorAll('.cepi').forEach(i=>i.addEventListener('input',()=>{i.value=i.value.replace(/\D/g,'').replace(/^(\d{5})(\d)/,'$1-$2')}));
let COR={f:'10_candy_morango',n:'Morango'};
function escolhe(b){document.querySelectorAll('.sw').forEach(x=>x.classList.remove('on'));b.classList.add('on');COR={f:b.dataset.f,n:b.dataset.n};const i=document.getElementById('mimg');i.style.opacity=.3;setTimeout(()=>{i.src='img/arco_'+COR.f+'.webp';i.style.opacity=1},150);document.getElementById('mtag').textContent=COR.n}
function pegaCor(f){const b=document.querySelector('.sw[data-f="'+f+'"]');if(b)escolhe(b)}
function calc(){const r=document.querySelector('input[name=tam]:checked');document.getElementById('mtot').textContent=R(+r.dataset.p);return r}
function addKit(){const r=calc();const n=(r.value==='60'?'Kit arco 60 peças':'Kit arco 100 peças desconstruído')+' · '+COR.n;const e=C.find(c=>c.n===n);e?e.q++:C.push({n,p:+r.dataset.p,i:'img/arco_'+COR.f+'.webp',q:1});salva();pinta();toast('🎈 '+n+' no carrinho');abreCarrinho()}
function addFita(){const n='Fita 5 m + dupla face';const e=C.find(c=>c.n===n);e?e.q++:C.push({n,p:11.98,i:'img/fita_105.webp',q:1});salva();pinta();toast('✓ Fita adicionada')}
const _p=pinta;pinta=function(){_p();const x=document.getElementById('xs');if(x)x.style.display=C.find(c=>c.n==='Fita 5 m + dupla face')||!C.length?'none':'grid'};pinta();
</script>'''

T = {
 'A': dict(nome='Pop de bolinha', fonts='Poppins:wght@400;600;800', fh='Poppins', fb='Poppins', wh=800,
   bg='#FFFFFF', bg2='#FFF0F5', ink='#111111', mut='#5c5c5c', ac='#FF1F7A', ac2='#FFC1D9', on_ac='#FFFFFF', head='#FFFFFF',
   hero_bg='#FFFFFF', hero_ink='#111111', hero_img='img/arco_10_candy_morango.webp', r='18px', rb='999px',
   h1='Festa pronta.', sub='Balão de festa na cor certa, direto pra sua casa. Escolhe a paleta, abre a caixa, a festa está feita.',
   extra='''.hero:before{content:"";position:absolute;width:520px;height:520px;border-radius:50%;background:var(--ac2);right:-120px;top:-140px;z-index:0}
.hero:after{content:"";position:absolute;width:140px;height:140px;border-radius:50%;background:var(--ac);left:46%;bottom:40px;z-index:0}
.hero .pic{border-radius:50% 50% 24px 24px}
.sec-t:after{content:"";display:inline-block;width:.5em;height:.5em;border-radius:50%;background:var(--ac);margin-left:.15em}
.prod{border:2px solid var(--ink)}'''),
 'B': dict(nome='Ponto final', fonts='Inter+Tight:wght@900&family=DM+Sans:wght@400;600', fh='Inter Tight', fb='DM Sans', wh=900,
   bg='#F4F4F3', bg2='#FFFFFF', ink='#0A1A3A', mut='#56607a', ac='#FF2D8E', ac2='#D9D9D9', on_ac='#FFFFFF', head='#FFFFFF',
   hero_bg='#0A1A3A', hero_ink='#FFFFFF', hero_img='img/cena_02_cha_revelacao.webp', r='6px', rb='6px',
   h1='festa pronta<i>.</i><br>só abrir<i>.</i>', sub='Kits de balão pra decorar a festa sem estresse. Você escolhe as cores, a gente manda tudo pronto.',
   extra='''.hero{min-height:640px}.hero .pic{position:absolute;inset:0 0 0 42%;height:100%;border-radius:0;object-fit:cover}
.hero .pic-wrap{position:static}.hero:after{content:"";position:absolute;inset:0 0 0 42%;background:linear-gradient(90deg,#0A1A3A 0,rgba(10,26,58,0) 45%)}
.hero .txt{position:relative;z-index:2}h1 i,.sec-t i{color:var(--ac);font-style:normal}
.btn.sec{color:#fff;border-color:rgba(255,255,255,.5)}
.sec-t{text-transform:lowercase;letter-spacing:-.02em}'''),
 'C': dict(nome='Selo g.', fonts='Archivo+Black&family=Archivo:wght@400;600', fh='Archivo Black', fb='Archivo', wh=400,
   bg='#FFFFFF', bg2='#FFD600', ink='#111111', mut='#444', ac='#FF1F7A', ac2='#0057FF', on_ac='#FFFFFF', head='#FFFFFF',
   hero_bg='#FFD600', hero_ink='#111111', hero_img='img/arco_02_vivo_primarias.webp', r='0px', rb='999px',
   h1='Festa pronta, na caixa.', sub='Balão em cores que combinam, separado por festa. Abre, monta e pronto.',
   extra='''h1,.sec-t{text-transform:uppercase;letter-spacing:-.01em}
.hero .pic{border:4px solid #111;box-shadow:12px 12px 0 #111;border-radius:0}
.selo{position:absolute;right:6%;top:40px;width:150px;height:150px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center;text-align:center;font:400 18px/1.1 "Archivo Black";transform:rotate(-12deg);z-index:3;border:4px solid #fff}
.selo b{color:var(--ac);font-size:34px;display:block}
.prod,.festa,.cor,.tier,.pm{border:3px solid #111;box-shadow:6px 6px 0 #111}.prova{background:#111;color:#fff}
.btn{border:3px solid #111}.btn.pri{box-shadow:4px 4px 0 #111}'''),
 'D': dict(nome='Chiclete', fonts='Fredoka:wght@500;700&family=Nunito:wght@400;700', fh='Fredoka', fb='Nunito', wh=700,
   bg='#FFF4F8', bg2='#FFE3EF', ink='#4a2340', mut='#7a5870', ac='#FF1F7A', ac2='#C9A7F0', on_ac='#FFFFFF', head='#FBD4E6',
   hero_bg='#FBD4E6', hero_ink='#4a2340', hero_img='img/arco_09_candy_algodao.webp', r='28px', rb='999px',
   h1='Festa pronta, na caixa!', sub='Balões nas cores mais fofas, prontos pra virar a festa. Escolhe, recebe e monta com quem você ama.',
   extra='''.hero .pic{border-radius:40px;border:8px solid #fff;box-shadow:0 20px 50px rgba(255,31,122,.25)}
.hero:before{content:"";position:absolute;width:90px;height:90px;border-radius:50%;background:#9FE3CF;left:4%;bottom:60px}
.hero:after{content:"";position:absolute;width:60px;height:60px;border-radius:50%;background:#C9A7F0;right:6%;top:30px}
.btn{box-shadow:0 6px 0 rgba(0,0,0,.15)}.prod,.festa,.cor{box-shadow:0 10px 30px rgba(255,31,122,.12);border:3px solid #fff}
.prova{background:#9FE3CF;color:#1d4a3e}'''),
}


def monte_html():
    sw = ''.join(f'<button class="sw{" on" if i == 9 else ""}" data-f="{f}" data-n="{n}" onclick="escolhe(this)"><img src="img/arco_{f}.webp" alt=""><span>{n}</span></button>' for i, (f, n) in enumerate(CORES))
    return ('<section id="monte" class="w"><div class="monte"><div class="mprev"><img id="mimg" src="img/arco_10_candy_morango.webp" alt="Prévia do arco"><span class="mtag" id="mtag">Morango</span></div>'
      '<div class="mcfg"><div class="eyebrow">Monte seu arco</div><h2 class="sec-t">Escolha a cor, a gente manda o arco.</h2>'
      '<p class="mstep"><b>1</b> Paleta</p><div class="sws">' + sw + '</div>'
      '<p class="mstep"><b>2</b> Tamanho</p><div class="tams">'
      '<label class="tam"><input type="radio" name="tam" value="60" data-p="35.99" checked onchange="calc()"><span><b>Kit 60 peças</b><small>balões de 12 e 9 polegadas</small></span><em>R$ 35,99</em></label>'
      '<label class="tam"><input type="radio" name="tam" value="100" data-p="52.99" onchange="calc()"><span><b>Kit 100 peças desconstruído</b><small>16, 12, 9 e 5 polegadas + dupla face</small></span><em>R$ 52,99</em></label></div>'
      '<div class="mbuy"><div><small>Seu arco</small><b id="mtot">R$ 35,99</b></div><button class="btn pri" onclick="addKit()">Colocar no carrinho</button></div>'
      '<p class="mnote">🚚 Em São Paulo e Grande SP chega no mesmo dia.</p></div></div></section>')

def page(L, t):
    others = ''.join(f'<a href="home_{k}.html" class="{"on" if k == L else ""}">{k} · {T[k]["nome"]}</a>' for k in 'ABCD')
    monte = monte_html()
    prem = ''.join(f'<article class="pm"><img src="img/{f}.webp" alt="{n}"><div><h4>{n}</h4><p>{d}</p><a class="pmb" href="#">Pedir orçamento →</a></div></article>' for f, n, d in PREMIUM)
    cores = ''.join(f'<a class="cor" href="#monte" onclick="pegaCor(\'{f}\')"><img src="img/arco_{f}.webp" alt="Arco {n}"><span>{n}</span></a>' for f, n in CORES)
    festas = ''.join(f'<a class="festa" href="#"><img src="img/{f}.webp" alt="{n}"><div><b>{n}</b><small>{d}</small></div></a>' for f, n, d in FESTAS)
    prods = ''.join(f'''<article class="prod"><img src="{p['img']}" alt="{p['nome']}"><div class="pi"><small>{p['qtd']} · 8 polegadas</small><h4>{p['nome']}</h4>
<p class="st">★ {p['nota']} · {p['vend']}</p><div class="pp"><b>R$ {p['preco']}</b><button onclick="add(this)" data-n="{p['nome']}" data-p="{p['preco']}" data-i="{p['img']}">Comprar</button></div></div></article>''' for p in PRODS)
    est = ''.join(f'<div class="uf"><b>{u}</b><span><i style="width:{v/32.5*100:.0f}%"></i></span><em>{str(v).replace(".", ",")}%</em></div>' for u, v in ESTADOS)
    selo = '<div class="selo"><span><b>4,9★</b>67 mil<br>avaliações</span></div>' if L == 'C' else ''
    dot = '<i>.</i>' if L == 'B' else ''
    return f'''<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Glowbos · home {L} · {t['nome']}</title>
<link href="https://fonts.googleapis.com/css2?family={t['fonts']}&display=swap" rel="stylesheet">
<style>
:root{{--bg:{t['bg']};--bg2:{t['bg2']};--ink:{t['ink']};--mut:{t['mut']};--ac:{t['ac']};--ac2:{t['ac2']};--on:{t['on_ac']};--r:{t['r']};--rb:{t['rb']};--fh:"{t['fh']}";--fb:"{t['fb']}"}}
*{{box-sizing:border-box}}html{{scroll-behavior:smooth}}body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 var(--fb),system-ui,sans-serif}}
a{{color:inherit;text-decoration:none}}img{{display:block;max-width:100%}}
.w{{max-width:1240px;margin:0 auto;padding:0 24px}}
.troca{{background:#222;color:#fff;font:600 12px/1 system-ui;display:flex;gap:6px;justify-content:center;padding:8px;flex-wrap:wrap}}.troca a{{padding:6px 10px;border-radius:6px;opacity:.6}}.troca a.on{{background:#fff;color:#111;opacity:1}}
.barra{{background:var(--ink);color:#fff;font-size:13px;text-align:center;padding:9px 12px}}.barra b{{color:inherit;font-weight:800}}
header{{background:{t['head']};position:sticky;top:0;z-index:20;border-bottom:1px solid rgba(0,0,0,.06)}}
.hd{{display:flex;align-items:center;gap:28px;height:84px}}.logo img{{height:{'64' if L in 'CD' else '44'}px;width:auto}}
nav{{display:flex;gap:22px;font-weight:600;font-size:14.5px;flex:1}}nav a:hover{{color:var(--ac)}}
.ic{{display:flex;gap:10px}}.ic a{{width:42px;height:42px;border-radius:var(--rb);display:grid;place-items:center;background:var(--bg2)}}.ic svg{{width:20px;height:20px}}
.hero{{position:relative;overflow:hidden;background:{t['hero_bg']};color:{t['hero_ink']}}}
.hero .w{{display:grid;grid-template-columns:1.05fr .95fr;gap:48px;align-items:center;min-height:min(78vh,700px);padding-top:56px;padding-bottom:56px;position:relative;z-index:1}}
.eyebrow{{font-weight:600;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--ac)}}
h1{{font:{t['wh']} clamp(46px,7vw,96px)/.95 var(--fh);margin:14px 0 20px;letter-spacing:-.03em}}
.hero p.sub{{font-size:19px;max-width:520px;opacity:.85;margin:0 0 30px}}
.btns{{display:flex;gap:12px;flex-wrap:wrap}}.btn{{display:inline-flex;align-items:center;gap:8px;height:54px;padding:0 26px;border-radius:var(--rb);font:{'400' if L == 'C' else '700'} 16px var(--fh);border:2px solid transparent;cursor:pointer}}
.btn.pri{{background:var(--ac);color:var(--on)}}.btn.sec{{border-color:currentColor}}
.chips{{display:flex;gap:18px;margin-top:30px;flex-wrap:wrap;font-size:14px}}.chips span{{display:flex;align-items:center;gap:6px}}.chips b{{font-family:var(--fh);font-size:20px}}
.pic-wrap{{position:relative}}.hero .pic{{width:100%;height:min(64vh,600px);object-fit:cover}}
section.w{{margin-top:104px}}.sec-h{{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:28px}}
.sec-t{{font:{t['wh']} clamp(30px,4vw,48px)/1 var(--fh);margin:0;letter-spacing:-.02em}}.sec-h p{{margin:8px 0 0;color:var(--mut)}}.sec-h a{{font-weight:700;color:var(--ac);white-space:nowrap}}
.festas{{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}}.festa{{position:relative;border-radius:var(--r);overflow:hidden;aspect-ratio:3/4;background:#ddd}}.festa img{{width:100%;height:100%;object-fit:cover;transition:transform .5s}}.festa:hover img{{transform:scale(1.05)}}
.festa div{{position:absolute;inset:auto 0 0 0;padding:18px;background:linear-gradient(0deg,rgba(0,0,0,.7),transparent);color:#fff}}.festa b{{display:block;font:{t['wh']} 22px/1.1 var(--fh)}}.festa small{{opacity:.85}}
.cores{{display:grid;grid-auto-flow:column;grid-auto-columns:200px;gap:14px;overflow-x:auto;padding-bottom:16px;scroll-snap-type:x mandatory}}.cor{{scroll-snap-align:start;border-radius:var(--r);overflow:hidden;background:#fff}}.cor img{{aspect-ratio:4/5;object-fit:cover;width:100%}}.cor span{{display:block;padding:10px 12px;font-weight:700}}
.prods{{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}}.prod{{background:#fff;border-radius:var(--r);overflow:hidden;display:flex;flex-direction:column}}.prod img{{aspect-ratio:1;object-fit:contain;background:#fff;padding:10px}}
.pi{{padding:14px 16px 16px;display:flex;flex-direction:column;flex:1}}.pi small{{color:var(--mut);font-size:12.5px}}.pi h4{{margin:4px 0;font:{t['wh']} 17px/1.2 var(--fh)}}.st{{margin:0 0 12px;font-size:13px;color:var(--mut)}}
.pp{{display:flex;justify-content:space-between;align-items:center;margin-top:auto}}.pp b{{font:{t['wh']} 22px var(--fh);white-space:nowrap}}.pp button{{background:var(--ink);color:#fff;border:0;border-radius:var(--rb);height:40px;padding:0 16px;font-weight:700;cursor:pointer}}
.passos{{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}}.passo{{background:var(--bg2);border-radius:var(--r);padding:28px}}.passo b{{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--ac);color:#fff;font:{t['wh']} 20px var(--fh)}}.passo h4{{font:{t['wh']} 22px var(--fh);margin:14px 0 6px}}.passo p{{margin:0;color:var(--mut)}}
.prova{{background:var(--ink);color:#fff;border-radius:var(--r);padding:48px;display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:center}}
.nums{{display:grid;grid-template-columns:1fr 1fr;gap:22px}}.nums b{{display:block;font:{t['wh']} clamp(36px,4vw,54px)/1 var(--fh)}}.nums span{{opacity:.75;font-size:14px}}
.ufs h4{{margin:0 0 14px;font:{t['wh']} 20px var(--fh)}}.uf{{display:grid;grid-template-columns:56px 1fr 52px;gap:10px;align-items:center;margin:8px 0;font-size:14px}}.uf span{{height:12px;border-radius:99px;background:rgba(255,255,255,.15);overflow:hidden}}.uf i{{display:block;height:100%;background:var(--ac);border-radius:99px}}.uf em{{font-style:normal;opacity:.8;text-align:right}}
.caixa{{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}}.caixa img{{border-radius:var(--r);width:100%}}.caixa p{{color:var(--mut);font-size:18px}}
footer{{margin-top:110px;background:var(--ink);color:#fff;padding:56px 0 40px}}.ft{{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:30px}}.ft h5{{margin:0 0 12px;font:{t['wh']} 16px var(--fh)}}.ft a{{display:block;opacity:.75;margin:6px 0;font-size:14px}}.ft .ico{{width:72px;border-radius:16px}}
.nota{{font-size:12px;opacity:.55;margin-top:30px}}
.tiers{{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}}.tier{{background:#fff;border-radius:var(--r);overflow:hidden;display:flex;flex-direction:column}}.tier img{{aspect-ratio:4/3;object-fit:cover;width:100%;background:#fff}}.tier div{{padding:20px 22px 24px}}.tier small{{font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ac);font-size:12px}}.tier h4{{margin:6px 0 8px;font:{t['wh']} 22px/1.15 var(--fh)}}.tier p{{margin:0 0 14px;color:var(--mut);font-size:15px}}.tier b{{font:{t['wh']} 18px var(--fh)}}
.tier.pr{{background:var(--ink);color:#fff}}.tier.pr p{{color:rgba(255,255,255,.75)}}.tier.pr b{{color:var(--ac)}}
.barra{{position:relative;height:36px;overflow:hidden;padding:0}}.barra .rot{{position:absolute;inset:0;display:flex;justify-content:center;align-items:center;gap:.3em;white-space:nowrap;opacity:0;transform:translateY(8px);transition:.4s}}.barra .rot.on{{opacity:1;transform:none}}
.cart-btn{{position:relative}}.qt{{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;border-radius:99px;background:var(--ac);color:#fff;font:700 11px/1 system-ui;display:none;place-items:center;padding:0 5px;font-style:normal}}
.cep{{background:rgba(255,255,255,.92);color:#111;border-radius:var(--r);padding:14px 16px;max-width:460px;margin-top:26px;box-shadow:0 8px 30px rgba(0,0,0,.08)}}.cep-t{{font-size:14px;margin-bottom:8px}}.cep form{{display:flex;gap:8px}}.cep input{{flex:1;height:44px;border:1.5px solid #ddd;border-radius:var(--rb);padding:0 14px;font:16px var(--fb)}}.cep button{{height:44px;border:0;border-radius:var(--rb);background:#111;color:#fff;padding:0 18px;font-weight:700;cursor:pointer}}.cep-r{{margin:8px 0 0;font-size:14px}}.cep-r:empty{{display:none}}.cep-r.err{{color:#c62828}}
.vel{{position:fixed;inset:0;background:rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:.3s;z-index:50}}.gav{{position:fixed;top:0;right:0;bottom:0;width:min(420px,100%);background:#fff;color:#111;z-index:51;transform:translateX(100%);transition:.35s;display:flex;flex-direction:column}}
.gaberta .vel{{opacity:1;pointer-events:auto}}.gaberta .gav{{transform:none}}.gh{{display:flex;justify-content:space-between;align-items:center;padding:20px;border-bottom:1px solid #eee;font:{t['wh']} 20px var(--fh)}}.gh button{{border:0;background:none;font-size:20px;cursor:pointer}}
.gl{{flex:1;overflow:auto;padding:12px 20px}}.it{{display:grid;grid-template-columns:72px 1fr;gap:12px;padding:12px 0;border-bottom:1px solid #f0f0f0}}.it img{{width:72px;height:72px;object-fit:contain}}.it b{{display:block;font-size:14px}}.it span{{font-size:14px;color:#666}}.qq{{display:flex;align-items:center;gap:10px;margin-top:6px}}.qq button{{width:28px;height:28px;border-radius:50%;border:1px solid #ddd;background:#fff;cursor:pointer}}.qq em{{font-style:normal;font-weight:700}}.vz{{color:#666;text-align:center;margin-top:40px}}
.gf{{padding:20px;border-top:1px solid #eee}}.md{{background:#f3fff8;color:#0b6b3a;border-radius:10px;padding:10px 12px;font-size:14px;margin-bottom:12px}}.tot{{display:flex;justify-content:space-between;margin-bottom:14px;font-size:18px}}.gf .btn{{width:100%;justify-content:center}}
.toast{{position:fixed;left:50%;bottom:90px;transform:translate(-50%,20px);background:#111;color:#fff;padding:12px 18px;border-radius:99px;font-size:14px;opacity:0;transition:.3s;z-index:60;pointer-events:none}}.toast.on{{opacity:1;transform:translate(-50%,0)}}
.mbar{{display:none}}
.monte{{display:grid;grid-template-columns:1fr 1.1fr;gap:44px;background:var(--bg2);border-radius:var(--r);padding:36px;align-items:start}}.mprev{{position:relative;position:sticky;top:110px}}.mprev img{{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--r);transition:opacity .25s}}.mtag{{position:absolute;left:16px;bottom:16px;background:#fff;color:#111;border-radius:99px;padding:8px 14px;font-weight:700;font-size:14px}}
.mcfg{{min-width:0}}.mcfg .sec-t{{margin:8px 0 20px}}.mstep{{display:flex;align-items:center;gap:8px;font-weight:700;margin:18px 0 10px}}.mstep b{{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--ac);color:#fff;font-size:13px}}
.sws{{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:10px}}.sw{{border:2px solid transparent;background:#fff;border-radius:12px;padding:4px 4px 6px;cursor:pointer;font:600 12px var(--fb);color:#111}}.sw img{{width:100%;aspect-ratio:1;object-fit:cover;border-radius:9px;object-position:center 30%}}.sw span{{display:block;margin-top:4px}}.sw.on{{border-color:var(--ac);box-shadow:0 0 0 3px color-mix(in srgb,var(--ac) 25%,transparent)}}
.tams{{display:grid;gap:10px}}.tam{{display:flex;align-items:center;gap:12px;background:#fff;color:#111;border:2px solid #e6e6e6;border-radius:12px;padding:14px 16px;cursor:pointer}}.tam:has(input:checked){{border-color:var(--ac)}}.tam input{{accent-color:var(--ac);width:18px;height:18px}}.tam span{{flex:1}}.tam b{{display:block}}.tam small{{color:#666}}.tam em{{font-style:normal;font-weight:800}}
.mbuy{{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:22px;padding-top:18px;border-top:1px solid rgba(0,0,0,.08)}}.mbuy small{{display:block;color:var(--mut)}}.mbuy b{{font:{t['wh']} 30px var(--fh)}}.mnote{{font-size:14px;color:var(--mut);margin:14px 0 0}}
.xs{{display:grid;grid-template-columns:56px 1fr auto;gap:10px;align-items:center;border:1.5px dashed #ddd;border-radius:12px;padding:10px;margin-bottom:12px}}.xs img{{width:56px;height:56px;object-fit:contain}}.xs small{{display:block;color:var(--ac);font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.06em}}.xs b{{display:block;font-size:14px}}.xs span{{font-size:13px;color:#666}}.xs button{{border:0;background:#111;color:#fff;border-radius:99px;padding:8px 12px;font-weight:700;cursor:pointer;font-size:12.5px}}
.wpp{{position:fixed;right:20px;bottom:20px;z-index:45;display:flex;align-items:center;gap:10px;background:#25D366;color:#fff;border-radius:99px;padding:12px 18px 12px 12px;font-weight:700;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.2)}}.wpp svg{{width:28px;height:28px}}
.pms{{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}}.pm{{position:relative;border-radius:var(--r);overflow:hidden;aspect-ratio:4/5;background:#eee}}.pm img{{width:100%;height:100%;object-fit:cover;transition:transform .6s}}.pm:hover img{{transform:scale(1.04)}}
.pm div{{position:absolute;inset:auto 0 0 0;padding:22px;background:linear-gradient(0deg,rgba(0,0,0,.78),rgba(0,0,0,0));color:#fff}}.pm h4{{margin:0 0 4px;font:{t['wh']} 22px/1.1 var(--fh)}}.pm p{{margin:0 0 10px;font-size:14px;opacity:.88}}.pmb{{display:inline-block;background:#fff;color:#111;border-radius:var(--rb);padding:9px 14px;font-weight:700;font-size:13.5px}}
{t['extra']}
@media(max-width:900px){{nav{{display:none}}.hero .w{{grid-template-columns:1fr;padding-top:36px;gap:28px;min-height:0}}.hero .pic{{height:380px}}
{'.hero .pic{position:static;height:340px}.hero:after{display:none}' if L == 'B' else ''}
.festas,.prods{{grid-template-columns:1fr 1fr}}.tiers{{grid-template-columns:1fr}}.pms{{grid-auto-flow:column;grid-template-columns:none;grid-auto-columns:78%;overflow-x:auto;scroll-snap-type:x mandatory}}.pm{{scroll-snap-align:start}}.barra{{font-size:12.5px}}.monte{{grid-template-columns:1fr;padding:18px}}.sws{{grid-auto-flow:column;grid-template-columns:none;grid-auto-columns:84px;overflow-x:auto;padding-bottom:6px}}.mprev{{position:relative;top:0}}.mprev img{{aspect-ratio:1}}.mbuy{{flex-direction:column;align-items:stretch}}.mbuy .btn{{justify-content:center}}.wpp{{bottom:66px;right:12px;padding:12px}}.wpp span{{display:none}}.mbar{{display:block;position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--ac);color:#fff;text-align:center;padding:14px 10px calc(14px + env(safe-area-inset-bottom));font-size:14px}}body{{padding-bottom:52px}}.cep form{{flex-wrap:nowrap}}.passos,.prova,.caixa,.ft{{grid-template-columns:1fr}}.prova{{padding:28px}}.selo{{width:110px;height:110px;font-size:14px;top:auto;bottom:24px}}.selo b{{font-size:24px}}
section.w{{margin-top:72px}}.pp b{{font-size:17px}}.pp button{{height:34px;padding:0 11px;font-size:12.5px}}.pi{{padding:12px}}.hd{{height:68px}}.logo img{{height:{'48' if L in 'CD' else '34'}px}}.w{{padding:0 16px}}.sec-h{{flex-direction:column;align-items:start}}}}
</style></head><body>
<div class="troca">{others}</div>
<div class="barra"><span class="rot on">🚚 <b>Entrega no mesmo dia</b> em São Paulo e Grande SP</span><span class="rot">⭐ <b>4,9</b> na Shopee com <b>67 mil avaliações</b></span><span class="rot">📦 Enviamos pra <b>todo o Brasil</b></span></div>
<header><div class="w hd"><a class="logo" href="#"><img src="img/{L}_logo_crop.png" alt="Glowbos"></a>
<nav><a href="#cores">Por cor</a><a href="#festas">Por festa</a><a href="#mais">Mais vendidos</a><a href="#como">Como montar</a></nav>
<div class="ic"><a href="#" aria-label="Buscar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></a>
<a href="#" aria-label="Carrinho" class="cart-btn" onclick="abreCarrinho();return false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg><em class="qt" id="qt">0</em></a></div></div></header>

<div class="hero">{selo}<div class="w"><div class="txt"><div class="eyebrow">Balões de festa · kits por cor</div>
<h1>{t['h1']}</h1><p class="sub">{t['sub']}</p>
<div class="btns"><a class="btn pri" href="#cores">Escolher minhas cores</a><a class="btn sec" href="#mais">Ver mais vendidos</a></div>
<div class="cep"><div class="cep-t">🚚 <b>Chega hoje</b> em São Paulo e Grande SP</div><form onsubmit="vePrazo(this);return false"><input class="cepi" inputmode="numeric" maxlength="9" placeholder="Digite seu CEP"><button>Ver prazo</button></form><p class="cep-r"></p></div>
<div class="chips"><span><b>121 mil+</b> pacotes vendidos</span><span><b>4,9 ★</b> 67 mil avaliações</span></div></div>
<div class="pic-wrap"><img class="pic" src="{t['hero_img']}" alt="Arco de balões montado"></div></div></div>

<section id="cores" class="w"><div class="sec-h"><div><h2 class="sec-t">Escolha pela cor{dot}</h2><p>Cada paleta é um arco pronto pra montar. Arraste pro lado.</p></div><a href="#">Ver todas as cores →</a></div><div class="cores">{cores}</div></section>

{monte}

<section id="festas" class="w"><div class="sec-h"><div><h2 class="sec-t">Escolha pela festa{dot}</h2><p>Comece pelo momento, a gente sugere as cores.</p></div></div><div class="festas">{festas}</div></section>

<section id="mais" class="w"><div class="sec-h"><div><h2 class="sec-t">Os mais vendidos{dot}</h2><p>Os pacotes que mais saem hoje, com a nota de quem comprou.</p></div><a href="#">Ver loja →</a></div><div class="prods">{prods}</div></section>

<section id="linhas" class="w"><div class="sec-h"><div><h2 class="sec-t">Do simples ao premium{dot}</h2><p>Do pacote pra encher em casa até a decoração que para a festa.</p></div></div><div class="tiers">
<a class="tier" href="#mais"><img src="img/prod_01.webp" alt="Pacote de balões"><div><small>Pacote</small><h4>75 balões de 8 polegadas</h4><p>Três cores que combinam, pra encher e espalhar pela festa.</p><b>a partir de R$ 19,87</b></div></a>
<a class="tier" href="#"><img src="img/kit_151.webp" alt="Kit arco 60 peças"><div><small>Kit arco</small><h4>Kit 60 peças, 12 e 9 polegadas</h4><p>O arco inteiro numa caixa. Até o desconstruído de 100 peças com dupla face, R$ 52,99.</p><b>a partir de R$ 35,99 · ★ 5,0</b></div></a>
<a class="tier pr" href="#premium"><img src="img/premium_3_gigante.webp" alt="Linha premium"><div><small>Premium</small><h4>Bubble, cromado, gigante e número</h4><p>Balão transparente com nome, cromado, bola gigante pendurada e número metalizado.</p><b>Monte com a gente →</b></div></a></div></section>

<section id="premium" class="w"><div class="sec-h"><div><div class="eyebrow">Linha premium</div><h2 class="sec-t">Pra festa que ninguém esquece{dot}</h2><p>Montado do seu jeito, com a cor e o nome da sua festa. Em SP e Grande SP, entregue no mesmo dia.</p></div><a href="#">Falar com a gente →</a></div><div class="pms">{prem}</div></section>

<section id="como" class="w"><div class="sec-h"><div><h2 class="sec-t">Como funciona{dot}</h2></div></div><div class="passos">
<div class="passo"><b>1</b><h4>Escolha as cores</h4><p>Pela paleta ou pela festa. Cada pacote já vem com as cores combinando.</p></div>
<div class="passo"><b>2</b><h4>Chega na sua casa</h4><p>Em São Paulo e Grande SP, <strong>no mesmo dia</strong>. No resto do Brasil, a gente embala e manda.</p></div>
<div class="passo"><b>3</b><h4>Monta e pronto</h4><p>Encha, junte e a parede vira festa.</p></div></div></section>

<section class="w"><div class="prova"><div class="nums"><div><b>4,9★</b><span>nota média na Shopee</span></div><div><b>67 mil</b><span>avaliações de clientes</span></div><div><b>121 mil+</b><span>pacotes vendidos</span></div><div><b>4.478</b><span>pedidos nos últimos 30 dias</span></div></div>
<div class="ufs"><h4>Onde já tem festa nossa</h4>{est}</div></div></section>

<section class="w"><div class="caixa"><img src="img/{L}_aplicado.webp" alt="Caixa Glowbos"><div><div class="eyebrow">A caixa</div><h2 class="sec-t">Abre e a festa sai de dentro{dot}</h2><p>Balões separados por cor, tudo no mesmo pacote. Do jeito que chega, já dá pra montar.</p><a class="btn pri" href="#cores">Montar minha festa</a></div></div></section>

<footer><div class="w"><div class="ft"><div><img class="ico" src="img/{L}_icone.webp" alt=""><p style="opacity:.75;max-width:280px">Balões de festa por cor e por festa. Enviamos pra todo o Brasil.</p></div>
<div><h5>Loja</h5><a href="#">Por cor</a><a href="#">Por festa</a><a href="#">Mais vendidos</a></div>
<div><h5>Ajuda</h5><a href="#">Como montar</a><a href="#">Trocas e devoluções</a><a href="#">Minha conta</a></div>
<div><h5>Contato</h5><a href="#">WhatsApp (a confirmar)</a><a href="#">Instagram (a confirmar)</a><a href="#">TikTok Shop</a></div></div>
<p class="nota">Glowbos · protótipo da home {L} · {t['nome']} · números: Shopee e Bling, 09/10/2026 · CNPJ a confirmar</p></div></footer>
<div class="vel" id="vel" onclick="fechaCarrinho()"></div><aside class="gav" id="gav"><div class="gh"><b>Seu carrinho</b><button onclick="fechaCarrinho()" aria-label="Fechar">✕</button></div>
<div class="gl" id="gl"></div><div class="gf"><div class="xs" id="xs"><img src="img/fita_105.webp" alt=""><div><small>Combina com seu arco</small><b>Fita 5 m + dupla face</b><span>R$ 11,98 · ★ 4,9</span></div><button onclick="addFita()">+ Adicionar</button></div><div class="md">🚚 Em SP e Grande SP <b>chega hoje</b></div><div class="tot"><span>Total</span><b id="tot">R$ 0,00</b></div><a class="btn pri" href="#">Finalizar compra</a></div></aside>
<div class="toast" id="toast"></div><a class="wpp" href="#" title="WhatsApp (número a confirmar)"><svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.2 1.3Z"/></svg><span>Ajuda pra montar sua festa</span></a><a class="mbar" href="#cores">🚚 <b>Chega hoje</b> em SP e Grande SP · <u>escolher cores</u></a>
{JS}
</body></html>'''

for L, t in T.items():
    open(os.path.join(PROTO, f'home_{L}.html'), 'w').write(page(L, t))
open(os.path.join(PROTO, 'index.html'), 'w').write('<meta http-equiv="refresh" content="0;url=home_A.html">')
print('ok')
