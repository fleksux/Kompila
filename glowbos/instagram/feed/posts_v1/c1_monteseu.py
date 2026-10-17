from motor import IMG, ESP, mk
# Linha C · Monte seu pacote: o configurador do site explicado em 3 cliques
QTD = [('50', '2', 'R$ 19,87'), ('75', '3', 'R$ 25,99'), ('100', '4', 'R$ 32,99'), ('125', '5', 'R$ 36,99')]
cards = ''.join(f"""<div class="cartao" style="position:relative;padding:28px 30px;text-align:left"><div style="font:900 96px/1 'Inter Tight';letter-spacing:-.05em;color:var(--berry)">{q}</div>
<p class="p" style="font-size:28px;margin-top:6px">balões · até {c} cores</p><div class="preco" style="font-size:46px;margin-top:10px">{p}</div></div>""" for q, c, p in QTD)
CORES = ['rosa', 'lilas', 'azul_baby', 'tiffany', 'amarelo', 'laranja', 'vermelho', 'pink', 'roxo', 'verde_agua', 'dourado', 'branco']
cores = ''.join(f'<img src="{IMG}b_{c}.webp" style="height:200px;margin:-14px -6px">' for c in CORES)
SEQ = ['pink', 'lilas', 'branco']
seq = ''.join(f'<div style="display:flex;flex-direction:column;align-items:center"><img src="{IMG}b_{c}.webp" style="height:300px"><span class="num" style="margin-top:12px;width:72px;height:72px;font-size:38px">{i}</span></div>' for i, c in enumerate(SEQ, 1))
POST = dict(ordem=7, slug='c1_monteseu', tipo='carrossel', leg="""
Monte o seu pacote de balões em 3 cliques 🎨

1. Escolhe quantos: 50, 75, 100 ou 125 balões de 8"
2. Escolhe as cores: até 2, 3, 4 ou 5, conforme o pacote
3. Escolhe a sequência: a ordem em que as cores aparecem no arco

A partir de R$ 19,87. Em SP e Grande SP, pagou até 12h chega hoje.
👉 glowbos.com.br, aba Monte seu pacote

Qual combinação você montaria? Conta aqui 👇

#baloes #arcodebaloes #festaemcasa #festainfantil #glowbos
""", slides=[
 dict(fundo='pink', html=f"""
  <div class="pol" style="left:120px;top:190px;width:400px;height:470px;transform:rotate(-6deg)"><img src="{IMG}pack_azul_verm_amar.webp"><i>azul, vermelho e amarelo</i></div>
  <div class="pol" style="left:560px;top:230px;width:400px;height:470px;transform:rotate(5deg)"><img src="{IMG}pack_lar_marrom_verde.webp"><i>laranja, marrom e verde</i></div>
  <div class="blk" style="top:820px"><div class="k">do seu jeito</div>
  <h1 class="t" style="color:#fff;margin-top:18px">Monte seu pacote<br>em {mk('*3 cliques*')}</h1>
  <p class="p" style="margin-top:22px">Você escolhe quantos, as cores e a ordem.</p></div>"""),
 dict(fundo='creme', html=f"""
  <div class="blk" style="top:200px;display:flex;gap:26px;align-items:center"><span class="num">1</span><h2 class="t2">Escolhe {mk('*quantos*')}</h2></div>
  <div class="blk" style="top:420px;display:grid;grid-template-columns:1fr 1fr;gap:24px">{cards}</div>
  <div class="blk" style="top:1150px"><p class="p">Todos com balões de 8", o tamanho do arco.</p></div>"""),
 dict(fundo='lilas', html=f"""
  <div class="blk" style="top:200px;display:flex;gap:26px;align-items:center"><span class="num">2</span><h2 class="t2">Escolhe {mk('*as cores*')}</h2></div>
  <div class="blk" style="top:430px;display:flex;flex-wrap:wrap;justify-content:center">{cores}</div>
  <div class="blk" style="top:1060px"><p class="p" style="color:var(--ink)"><b>Mais de 20 cores.</b> O site mostra o pacote montado enquanto você escolhe.</p></div>"""),
 dict(fundo='pessego', html=f"""
  <div class="blk" style="top:200px;display:flex;gap:26px;align-items:center"><span class="num">3</span><h2 class="t2">Escolhe {mk('*a ordem*')}</h2></div>
  <div class="blk" style="top:440px;display:flex;justify-content:space-around;align-items:flex-end">{seq}</div>
  <div class="blk" style="top:960px"><p class="p" style="color:var(--ink)"><b>A sequência é a ordem em que as cores aparecem no arco.</b> A gente separa do jeito que você montou.</p></div>"""),
 dict(fundo='berry', html=f"""
  <div class="ft" style="left:96px;top:190px;width:888px;height:640px"><img src="{ESP}cores.jpg" style="object-position:50% 35%"></div>
  <div class="blk" style="top:880px"><h2 class="t2" style="color:#fff">A partir de {mk('*R$ 19,87*')}</h2>
  <p class="p" style="margin-top:18px">Em SP e Grande SP, pagou até 12h, chega hoje.</p>
  <div style="margin-top:34px;display:flex;gap:16px;flex-wrap:wrap"><span class="pill br">glowbos.com.br</span><span class="pill" style="background:rgba(255,255,255,.16)">Monte seu pacote</span></div></div>"""),
])
