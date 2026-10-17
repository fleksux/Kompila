from motor import IMG, ESP, mk
# Linha D · novidade · Sets prontos (sob encomenda, orçamento pelo site com WhatsApp, data e CEP)
S = '../img_sets/'
POST = dict(ordem=10, slug='d1_sets_prontos', tipo='carrossel', leg="""
Chegou novidade na Glowbos: os Sets prontos 🎈

É a festa montada no estilo do tema: número gigante, base de balões, figuras e buquê, tudo combinando.
Já tem 4 temas:
• Carros, número 4
• Borboleta Rosê, número 5
• Safári, número 1
• Chá Revelação

É sob encomenda: você pede o orçamento no site, conta a data e o CEP, e a gente responde no WhatsApp.

Qual tema você quer ver aqui depois? Comenta 👇
glowbos.com.br

#festainfantil #decoracaodefesta #festaemcasa #baloes #glowbos
""", slides=[
 dict(fundo='creme', html=f"""
  <div class="full"><img src="{S}set_menina_5anos.jpg" style="object-position:50% 20%"></div><div class="velc" style="height:52%"></div>
  <div class="blk" style="bottom:240px"><span class="pill" style="height:58px;font-size:24px">novidade</span>
  <h1 class="t" style="margin-top:26px">Sets {mk('*prontos*')}</h1>
  <p class="p" style="margin-top:20px;color:var(--ink)">A festa montada no estilo do tema.</p></div>"""),
 dict(fundo='pessego', html=f"""
  <div class="ft" style="left:560px;top:250px;width:424px;height:530px"><img src="{S}set_safari_1ano.jpg"></div>
  <div class="blk" style="top:290px;right:560px"><div class="k">o que vem</div><h2 class="t2" style="margin-top:16px">Tudo {mk('*combinando*')}</h2></div>
  <ul class="lista blk" style="top:840px">
   <li><span class="num">1</span><div><b>Número gigante</b> metalizado da idade</div></li>
   <li><span class="num">2</span><div><b>Base de balões</b> nas cores do tema</div></li>
   <li><span class="num">3</span><div><b>Figuras e buquê</b> no mesmo estilo</div></li></ul>"""),
 dict(fundo='lilas', html=f"""
  <div class="ft" style="left:96px;top:250px;width:720px;height:760px"><img src="{S}set_carros_4anos.jpg" style="object-position:50% 40%"></div>
  <div class="blk" style="top:1050px"><div class="mao">set carros</div><h2 class="t3" style="margin-top:8px">Número 4 vermelho, bandeira {mk('*e carrinho*')}</h2></div>"""),
 dict(fundo='rosa', html=f"""
  <div class="pol" style="left:110px;top:470px;width:400px;height:560px;transform:rotate(-4deg)"><img src="{S}set_menina_5anos.jpg"><i>borboleta rosê · 5</i></div>
  <div class="pol" style="left:570px;top:560px;width:400px;height:560px;transform:rotate(5deg)"><img src="{S}set_safari_1ano.jpg"><i>safári · 1</i></div>
  <div class="blk" style="top:270px"><div class="k">pra cada festa</div><h2 class="t2" style="margin-top:14px">Menina, menino, {mk('*bichinho*')}</h2></div>"""),
 dict(fundo='berry', html=f"""
  <div class="ftc" style="left:270px;top:250px;width:540px;height:540px;border-color:rgba(255,255,255,.9)"><img src="{S}set_cha_revelacao.jpg" style="object-position:50% 30%"></div>
  <div class="blk" style="top:850px;text-align:center"><div class="k">set chá revelação</div>
  <h2 class="t2" style="margin-top:16px;color:#fff;font-size:60px">O balão preto<br>com a {mk('*interrogação*')}</h2>
  <p class="p" style="margin-top:20px">Com o buquê em rosa e azul em volta.</p></div>"""),
 dict(fundo='creme', html=f"""
  <div class="blk" style="top:280px"><div class="k">como pedir</div><h2 class="t2" style="margin-top:16px">Escolha o tema {mk('*e a idade*')}</h2></div>
  <div class="cartao" style="left:96px;right:96px;top:520px"><ul class="lista">
   <li><span class="num">1</span><div>Abre o set no <b>glowbos.com.br</b></div></li>
   <li><span class="num">2</span><div>Conta a <b>data da festa</b> e o <b>CEP</b></div></li>
   <li><span class="num">3</span><div>A gente responde no <b>WhatsApp</b> com o orçamento</div></li></ul></div>
  <div class="blk" style="top:990px;display:flex;gap:18px;flex-wrap:wrap"><span class="pill">glowbos.com.br</span><span class="pill gr">sob encomenda</span></div>"""),
], cross=[
 f'<div class="x ftc" style="left:{1080*3-120}px;top:860px;width:230px;height:230px"><img src="{IMG}numero_5_rose.webp" style="object-position:50% 20%"></div>',
])
