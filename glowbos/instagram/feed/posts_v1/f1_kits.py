from motor import IMG, ESP, mk
# Linha F · loja · o que vem em cada kit de arco (conteúdo e preço do site em 17/10/2026)
L = '../fotos_loja/'
def bolas(itens):
    # tamanhos em escala: 16" maior, 5" menor (pra quem não sabe o que é polegada)
    px = {16: 230, 12: 180, 9: 140, 5: 86}
    h = ''
    for tam, qtd in itens:
        d = px[tam]
        h += (f'<div style="display:flex;flex-direction:column;align-items:center;gap:14px">'
              f'<div style="width:{d}px;height:{d}px;border-radius:50%;background:radial-gradient(circle at 32% 30%,#fff 0 6%,var(--pink) 30%,var(--berry) 100%);box-shadow:0 14px 30px rgba(176,18,79,.25)"></div>'
              f'<b style="font:900 54px \'Inter Tight\'">{qtd}</b><small style="font:700 26px Inter;color:var(--mut)">de {tam}"</small></div>')
    return h

POST = dict(css='.m{margin:0 .14em}', ordem=16, slug='f1_kits', tipo='carrossel', leg="""
Quer montar o arco em casa e não sabe qual kit pegar? Olha o que vem em cada um 👇

🎈 Kit 60 peças · R$ 35,99: 24 balões de 12" e 36 de 9"
🎈 Kit 100 peças · R$ 52,99: 4 tamanhos + fita de 5 m + dupla face
🎈 Kit 112 peças · R$ 54,99: 4 tamanhos + fita + dupla face
🎈 Kit 120 peças · R$ 62,00: 4 tamanhos + fita
🎈 Econômico 100 balões de 8" · R$ 31,99: 2 cores, o mais barato

Em todos você escolhe as cores. Balões Joy, certificados pelo Inmetro.
Em SP e Grande SP, pago até 12h chega hoje.

👉 glowbos.com.br

#arcodebaloes #kitdebaloes #festaemcasa #festainfantil #glowbos
""", slides=[
 dict(fundo='creme', html=f"""
  <div class="ft" style="left:0;right:0;top:0;height:860px;border-radius:0"><img src="{L}glowbos_kit100_parede.webp" style="object-position:50% 45%"></div>
  <div class="blk" style="top:930px"><div class="k">pra montar em casa</div>
  <h1 class="t" style="margin-top:18px;font-size:86px">Kit de arco: {mk('*o que vem*')} na caixa</h1>
  <p class="p" style="margin-top:22px">Você escolhe as cores. Sem pagar decorador.</p></div>"""),
 dict(fundo='lilas', html=f"""
  <div class="ft" style="left:96px;top:190px;width:470px;height:1060px"><img src="{L}glowbos_kit60_parede.webp" style="object-position:62% 50%"></div>
  <div style="position:absolute;left:620px;right:96px;top:230px">
   <div class="k">o de entrada</div><h2 class="t2" style="margin-top:14px">Kit 60 peças</h2>
   <div class="preco" style="margin-top:18px">R$ 35,99</div>
   <ul class="lista" style="margin-top:56px"><li><span class="num">24</span><span>balões de <b>12"</b><br><small style="color:var(--mut)">uns 30 cm cheio</small></span></li>
   <li><span class="num">36</span><span>balões de <b>9"</b><br><small style="color:var(--mut)">uns 25 cm cheio</small></span></li></ul>
   <p class="mao" style="margin-top:56px">a fita vende separada</p></div>"""),
 dict(fundo='pessego', html=f"""
  <div class="blk" style="top:200px"><div class="k">o mais completo pra começar</div><h2 class="t2" style="margin-top:14px">Kit 100 peças {mk('*desconstruído*')}</h2>
  <div class="preco" style="margin-top:14px">R$ 52,99</div></div>
  <div class="blk" style="top:560px;display:flex;justify-content:space-between;align-items:flex-end">{bolas([(16,2),(12,6),(9,60),(5,30)])}</div>
  <div class="cartao" style="left:96px;right:96px;top:1010px;display:flex;gap:24px;align-items:center"><span style="font:900 60px 'Inter Tight';color:var(--pink)">+</span><p class="p" style="color:var(--ink)"><b>fita de arco de 5 m</b> e <b>dupla face com 100 pontos</b>. Chega tudo pra montar.</p></div>"""),
 dict(fundo='bebe', html=f"""
  <div class="blk" style="top:200px"><div class="k">pra arco maior</div><h2 class="t2" style="margin-top:14px">112 ou 120 {mk('*peças*')}</h2></div>
  <div class="cartao" style="left:96px;top:420px;width:428px;padding:0;overflow:hidden">
   <div style="height:430px"><img src="{L}glowbos_kit112.webp" style="width:100%;height:100%;object-fit:cover"></div>
   <div style="padding:28px 30px 32px"><b style="font:900 46px 'Inter Tight'">Kit 112</b><div class="preco" style="font-size:52px">R$ 54,99</div>
   <p class="p" style="font-size:26px;margin-top:10px">2 de 16", 8 de 12", 60 de 9", 40 de 5"<br><b style="color:var(--ink)">+ fita e dupla face</b></p></div></div>
  <div class="cartao" style="left:556px;top:420px;width:428px;padding:0;overflow:hidden">
   <div style="height:430px"><img src="{L}glowbos_kit120.webp" style="width:100%;height:100%;object-fit:cover"></div>
   <div style="padding:28px 30px 32px"><b style="font:900 46px 'Inter Tight'">Kit 120</b><div class="preco" style="font-size:52px">R$ 62,00</div>
   <p class="p" style="font-size:26px;margin-top:10px">3 de 16", 12 de 12", 75 de 9", 30 de 5"<br><b style="color:var(--ink)">+ fita</b></p></div></div>"""),
 dict(fundo='grafite', html=f"""
  <div class="ft" style="left:96px;right:96px;top:190px;height:640px"><img src="{L}glowbos_kiteco100.webp" style="object-position:50% 50%"></div>
  <div class="blk" style="top:890px"><div class="k">o mais barato</div><h2 class="t2" style="margin-top:14px;color:#fff">Econômico: 100 balões de 8"</h2>
  <div style="display:flex;align-items:baseline;gap:30px;margin-top:22px"><div class="preco" style="color:#FF8DB8">R$ 31,99</div><p class="p">2 cores · rende uns 25 cachos de 4</p></div></div>"""),
 dict(fundo='rosa', html=f"""
  <div class="ft" style="left:96px;top:190px;width:500px;height:690px;transform:rotate(-3deg)"><img src="{ESP}fita.jpg" style="object-position:40% 60%"></div>
  <div style="position:absolute;left:630px;right:96px;top:250px"><div class="mao">dica da especialista</div>
  <p style="font:800 44px/1.15 'Inter Tight';letter-spacing:-.02em;margin-top:18px">O kit 60 não vem com a fita. Leva junto.</p></div>
  <div class="cartao" style="left:96px;right:96px;top:950px;display:flex;justify-content:space-between;align-items:center;gap:20px">
   <div><b style="font:800 32px Inter">Fita de arco 5 m + dupla face</b><p class="p" style="font-size:26px;margin-top:6px">os balões entram pelos furos</p></div><div class="preco" style="font-size:54px">R$ 11,98</div></div>
  <div class="blk" style="top:1170px;display:flex;gap:16px"><span class="pill">glowbos.com.br</span><span class="pill gr">balões Joy · Inmetro</span></div>"""),
])
