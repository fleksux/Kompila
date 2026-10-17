from motor import IMG, ESP, mk
# Linha F · loja · cromados, metalizados e bubble (preços do site em 17/10/2026)
L = '../fotos_loja/'
def card(img, nome, preco):
    return (f'<div class="cartao" style="position:relative;padding:0;overflow:hidden;display:flex;flex-direction:column">'
            f'<div style="height:228px;background:#fff"><img src="{L}{img}" style="width:100%;height:100%;object-fit:contain;padding:18px"></div>'
            f'<div style="padding:18px 26px 24px"><b style="display:block;font:800 27px/1.2 Inter">{nome}</b><div class="preco" style="font-size:46px;margin-top:6px">R$ {preco}</div></div></div>')

POST = dict(css='', ordem=18, slug='f3_cromados', tipo='carrossel', leg="""
O brilho que deixa a festa com cara de decoração profissional ✨

Metalizados de 5" pra espalhar no arco: 25 balões por R$ 14,98, cores à escolha.
Metalizados de 18" pro destaque: estrela e coração holográficos, bola de futebol e safari, a partir de R$ 11,98.
E o bubble personalizado com o nome da festa, sob encomenda.

Em SP e Grande SP, pago até 12h chega hoje.
👉 glowbos.com.br

#baloesmetalizados #cromados #decoracaodefesta #festainfantil #glowbos
""", slides=[
 dict(fundo='grafite', html=f"""
  <div class="full"><img src="{IMG}premium_6_preto_ouro.webp" style="object-position:50% 30%"></div><div class="vel"></div>
  <div class="blk" style="bottom:200px"><div class="k" style="color:#FFC2A1">cromados e metalizados</div>
  <h1 class="t" style="color:#fff;margin-top:20px">O brilho que {mk('*muda*')} a festa</h1></div>"""),
 dict(fundo='creme', html=f"""
  <div class="ft" style="right:0;top:250px;width:540px;height:1000px;border-radius:30px 0 0 30px"><img src="{IMG}premium_4_cromado.webp" style="object-position:40% 50%"></div>
  <div style="position:absolute;left:96px;width:410px;top:270px"><div class="k">nunca usou?</div>
  <h2 class="t3" style="margin-top:16px;font-size:52px">O de 5" vai {mk('*no arco*')}</h2>
  <p class="p" style="margin-top:22px;font-size:30px">Espalha entre os balões foscos. É o que dá o acabamento de festa profissional.</p>
  <div class="cartao" style="position:relative;margin-top:56px;padding:26px 28px"><b style="font:800 28px Inter">25 metalizados de 5"</b><p class="p" style="font-size:24px">cores à escolha</p><div class="preco" style="font-size:52px;margin-top:6px">R$ 14,98</div></div></div>"""),
 dict(fundo='lilas', html=f"""
  <div class="blk" style="top:260px"><div class="k">pro destaque</div><h2 class="t2" style="margin-top:12px">Os de 18" {mk('*brilham*')}</h2></div>
  <div class="blk" style="top:410px;display:grid;grid-template-columns:1fr 1fr;gap:22px">
   {card('met18_estrela.jpg','Estrela holográfica 18"','11,98')}{card('met17_coracao.jpg','Coração holográfico 17"','11,98')}
   {card('met18_futebol.jpg','Bola de futebol 18"','12,99')}{card('met18_safari.jpg','Safari animal print 18"','11,98')}</div>"""),
 dict(fundo='pessego', html=f"""
  <div class="ft" style="left:96px;top:260px;width:888px;height:660px"><img src="{L}bubble_personalizado.webp" style="object-position:50% 35%"></div>
  <div class="blk" style="top:960px"><div class="k">sob encomenda</div><h2 class="t2" style="margin-top:12px">Bubble com o {mk('*nome*')} da festa</h2>
  <p class="p" style="margin-top:14px">Balão transparente com o nome e balõezinhos dentro.</p></div>"""),
 dict(fundo='berry', html=f"""
  <div class="ftc" style="left:96px;top:260px;width:330px;height:330px"><img src="{ESP}dica.jpg" style="object-position:45% 18%"></div>
  <div class="mao" style="position:absolute;left:470px;top:390px">dica da especialista</div>
  <div class="bolha" style="left:96px;right:96px;top:660px;font-size:40px">Arco todo fosco? Troca <b>alguns balões por metalizado</b> e espalha. A festa ganha brilho sem gastar muito.</div>
  <div class="blk" style="top:1050px;display:flex;gap:16px;flex-wrap:wrap"><span class="pill br">glowbos.com.br</span><span class="pill" style="background:rgba(255,255,255,.16)">chega hoje em SP</span></div>"""),
])
