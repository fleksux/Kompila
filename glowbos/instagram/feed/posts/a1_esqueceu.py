from motor import IMG, ESP, mk
# Linha A · entrega no mesmo dia · público: quem lembrou dos balões em cima da hora
POST = dict(ordem=1, slug='a1_esqueceu', tipo='carrossel', leg="""
Festa amanhã e você lembrou agora dos balões? Respira 💗

Em SP e Grande SP, pediu e pagou até 12h, o motoboy entrega HOJE. Frete de R$ 10.
Pacotes a partir de R$ 19,87, com as cores que você escolher.

Salva esse post pra quando bater o desespero 😅
👉 glowbos.com.br

#festainfantil #baloes #festaemcasa #arcodebaloes #saopaulo #glowbos
""", slides=[
 dict(fundo='grafite', pe='seta', html=f"""
  <div class="full"><img src="{IMG}hero_entrega_1.webp" style="object-position:62% 30%"></div><div class="vel"></div>
  <div class="blk" style="bottom:200px"><div class="k" style="color:#FFD0E1">Festa amanhã?</div>
  <h1 class="t" style="color:#fff;margin-top:20px">Esqueceu dos {mk('*balões?*')}</h1>
  <p class="p" style="margin-top:26px;max-width:800px">Respira. Pediu até 12h, chega hoje.</p></div>"""),
 dict(fundo='creme', html=f"""
  <div class="blk" style="top:230px"><div class="mao">quinta-feira, 11h da manhã</div>
  <div style="font:900 300px/0.9 'Inter Tight';letter-spacing:-.06em;color:var(--berry);margin-top:20px">11:40</div>
  <h2 class="t2" style="margin-top:40px">A festa é às 16h.<br>E os balões {mk('*cadê?*')}</h2>
  <p class="p" style="margin-top:28px">Acontece com todo mundo. Por isso a gente existe.</p></div>"""),
 dict(fundo='pessego', html=f"""
  <div class="blk" style="top:200px"><div class="k">passo 1</div><h2 class="t2" style="margin-top:16px">Escolhe o pacote e {mk('*as cores*')}</h2></div>
  <div class="pol" style="left:96px;top:520px;width:430px;height:500px;transform:rotate(-5deg)"><img src="{IMG}pack_azul_verm_amar.webp"><i>75 balões · 3 cores</i></div>
  <div class="pol" style="left:560px;top:480px;width:430px;height:500px;transform:rotate(4deg)"><img src="{IMG}pack_candy.webp"><i>candy · até 4 cores</i></div>
  <div class="blk" style="top:1060px"><div class="preco"><small>a partir de</small>R$ 19,87</div></div>"""),
 dict(fundo='lilasf', html=f"""
  <div class="blk" style="top:220px"><div class="k">passo 2</div><h2 class="t2" style="margin-top:16px;color:#fff">Paga no site até</h2>
  <div style="font:900 420px/0.85 'Inter Tight';letter-spacing:-.06em;color:#fff;margin-top:10px">12h</div>
  <p class="p" style="margin-top:40px;max-width:820px">Pagou depois do meio-dia? Chega amanhã. A gente avisa no carrinho.</p></div>"""),
 dict(fundo='rosa', html=f"""
  <div class="ft" style="left:96px;top:190px;width:888px;height:780px"><img src="{ESP}entrega.jpg" style="object-position:50% 40%"></div>
  <div class="blk" style="top:1020px"><div class="k">passo 3</div><h2 class="t2" style="margin-top:14px">O motoboy entrega {mk('*hoje*')}</h2>
  <p class="p" style="margin-top:16px">SP e Grande SP · frete R$ 10</p></div>"""),
 dict(fundo='berry', html=f"""
  <div class="blk" style="top:300px"><h2 class="t" style="color:#fff">A festa sai.<br>{mk('*Com balão.*')}</h2>
  <p class="p" style="margin-top:34px;max-width:820px">Salva esse post pra quando bater o desespero.</p>
  <div style="margin-top:60px;display:flex;gap:18px;flex-wrap:wrap"><span class="pill br">glowbos.com.br</span><span class="pill" style="background:rgba(255,255,255,.16)">chega hoje em SP</span></div></div>
  <div class="ftc" style="right:-60px;bottom:120px;width:420px;height:420px"><img src="{ESP}pronto.jpg" style="object-position:50% 30%"></div>"""),
], cross=[
 f'<div class="x ftc" style="left:{1080*2-120}px;top:1170px;width:220px;height:220px"><img src="{IMG}pacote_16pol.webp"></div>',
])
