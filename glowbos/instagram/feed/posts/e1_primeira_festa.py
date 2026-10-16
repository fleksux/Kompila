from motor import IMG, ESP, mk
# Linha E · público: mãe/pai fazendo a primeira festa do filho em casa · 5 dicas da especialista
def dica(n, titulo, texto, foto, pos='50% 30%', fundo='creme', lado='dir'):
    if lado == 'dir':
        corpo = f"""<div class="ft" style="left:500px;top:190px;width:580px;height:1060px;border-radius:30px 0 0 30px"><img src="{foto}" style="object-position:{pos}"></div>
  <div class="blk" style="top:230px;right:620px"><span class="num">{n}</span><h2 class="t3" style="margin-top:34px">{titulo}</h2>
  <p class="p" style="margin-top:24px;font-size:30px">{texto}</p></div>"""
    else:
        corpo = f"""<div class="ft" style="left:96px;top:190px;width:888px;height:640px"><img src="{foto}" style="object-position:{pos}"></div>
  <div class="blk" style="top:880px;display:flex;gap:30px;align-items:flex-start"><span class="num">{n}</span><div><h2 class="t3">{titulo}</h2>
  <p class="p" style="margin-top:16px;font-size:30px">{texto}</p></div></div>"""
    return dict(fundo=fundo, html=corpo)

POST = dict(ordem=13, slug='e1_primeira_festa', tipo='carrossel', leg="""
Primeira festa do seu filho em casa e você nunca encheu um balão? A nossa especialista separou 5 dicas 💗

1. Escolhe 3 cores do tema e pronto
2. Enche na véspera, à noite
3. A fita faz o arco quase sozinha
4. O arco vai atrás da mesa do bolo
5. Pede até 12h que chega hoje em SP

Manda pra aquela amiga que vai fazer festa esse mês 👇
glowbos.com.br

#primeirafesta #festainfantil #festaemcasa #arcodebaloes #glowbos
""", slides=[
 dict(fundo='grafite', html=f"""
  <div class="full"><img src="{IMG}hero_crianca_1.webp" style="object-position:50% 35%"></div><div class="vel"></div>
  <div class="blk" style="bottom:200px"><div class="k" style="color:#FFD0E1">primeira festa em casa?</div>
  <h1 class="t" style="color:#fff;margin-top:18px;font-size:84px">5 dicas da {mk('*especialista*')}</h1>
  <p class="p" style="margin-top:22px">Pra quem nunca encheu um balão na vida.</p></div>"""),
 dica(1, f"Escolhe {mk('*3 cores*')}&nbsp; do tema", "Duas cores fortes e uma clara. Mais que isso vira confusão na foto.", f'{ESP}cores.jpg', '50% 25%', 'pessego'),
 dict(fundo='lilas', html=f"""
  <div class="ft" style="left:96px;top:190px;width:888px;height:560px"><img src="{ESP}bomba.jpg" style="object-position:50% 22%"></div>
  <div class="blk" style="top:800px;display:flex;gap:30px;align-items:flex-start"><span class="num">2</span><div><h2 class="t3">Enche {mk('*na véspera*')}, à noite</h2>
  <p class="p" style="margin-top:14px;font-size:30px">Uma bomba de mão poupa o fôlego.</p></div></div>
  <div class="bolha" style="left:96px;right:96px;top:1060px;font-size:27px"><span class="estrela" style="font-size:24px">★★★★★</span><br>"Fizemos o arco de um dia para o outro e nenhum murchou"<br><small style="color:var(--mut);font-weight:700">cliente na Shopee</small></div>"""),
 dica(3, f"A {mk('*fita*')}&nbsp; faz o arco", "Encaixa os balões nos furinhos da fita, um do lado do outro. A dupla face prende na parede.", f'{ESP}fita.jpg', '45% 40%', 'rosa'),
 dica(4, f"Atrás da {mk('*mesa do bolo*')}", "É ali que sai a foto do parabéns. Se só der pra decorar um lugar, decora esse.", f'{ESP}pronto.jpg', '50% 35%', 'creme', 'esq'),
 dict(fundo='berry', html=f"""
  <div class="ftc" style="left:96px;top:200px;width:300px;height:300px;border-color:rgba(255,255,255,.9)"><img src="{ESP}dica.jpg" style="object-position:45% 18%"></div>
  <div class="blk" style="top:560px"><span class="num" style="background:#fff;color:var(--berry)">5</span>
  <h2 class="t2" style="color:#fff;margin-top:30px">Esqueceu? Pede {mk('*até 12h*')}</h2>
  <p class="p" style="margin-top:20px">Em SP e Grande SP o motoboy entrega no mesmo dia, frete R$ 10.</p>
  <div style="margin-top:50px;display:flex;gap:18px;flex-wrap:wrap"><span class="pill br">glowbos.com.br</span></div></div>"""),
])
