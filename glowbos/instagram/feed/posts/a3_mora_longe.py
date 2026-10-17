from motor import IMG, mk
# Linha A · público: quem mora longe, não tem loja boa por perto e sonha com uma festa bonita.
# Elenco: "a moça comum que ama decorar" (16/10). Provas = comentários reais da Shopee.
EL = '../../elenco/'
VEL = '<div class="vel" style="height:70%"></div>'
POST = dict(ordem=3, slug='a3_mora_longe', tipo='carrossel', leg="""
Na sua cidade não tem loja de balão boa? A festa bonita vai até você 💗

Entregamos pra todo o Brasil pelos Correios, PAC ou SEDEX. As cores que você escolheu, no pacote certinho.

"Aqui na minha cidade um pacote desse sairia o dobro do valor." (cliente na Shopee)
"Fizemos o arco de um dia para o outro e nenhum murchou." (@kalebabymodainfantil)

A festa que ela sonhou, montada por você, na sua sala.
glowbos.com.br

#festainfantil #festaemcasa #arcodebaloes #baloes #glowbos
""", slides=[
 dict(fundo='grafite', html=f"""
  <div class="full"><img src="{EL}historias/longe_portao.jpg" style="object-position:50% 40%"></div>{VEL}
  <div class="blk" style="bottom:300px"><div class="k">mora longe?</div>
  <h1 class="t" style="color:#fff;margin-top:22px">Na sua cidade não tem.<br>{mk('*A gente leva.*')}</h1>
  <p class="p" style="margin-top:24px">Entrega pra todo o Brasil.</p></div>"""),
 dict(fundo='pessego', html=f"""
  <div class="blk" style="top:300px"><div class="k">o que ela contou</div>
  <p style="margin-top:40px;font:italic 400 92px/1.04 'Instrument Serif';color:var(--berry);letter-spacing:-.01em">“Aqui na minha cidade um pacote desse sairia o dobro do valor.”</p>
  <p style="margin-top:34px;font:600 26px Inter;color:var(--mut)">cliente na Shopee <span class="estrela" style="font-size:24px">★★★★★</span></p>
  <p class="p" style="margin-top:70px;color:var(--ink)">Por isso a Glowbos manda pra qualquer lugar do país.</p></div>"""),
 dict(fundo='grafite', html=f"""
  <div class="full"><img src="{EL}cenas/08_amigas_montando_em_casa.jpg" style="object-position:50% 40%"></div>{VEL}
  <div class="blk" style="bottom:300px"><h2 class="t2" style="color:#fff">Chega pelos Correios, {mk('*na sua casa.*')}</h2>
  <p class="p" style="margin-top:24px;max-width:820px">PAC ou SEDEX. Pacote com as cores que você escolheu. O kit de arco já vem com a fita.</p></div>"""),
 dict(fundo='lilas', html=f"""
  <div class="blk" style="top:290px"><div class="k">e aguenta a festa</div><h2 class="t2" style="margin-top:18px">Balão grosso, {mk('*que não murcha.*')}</h2></div>
  <div class="cartao" style="left:96px;right:96px;top:590px"><p class="p" style="color:var(--ink);font-size:33px">“Fizemos o arco de um dia para o outro e nenhum murchou, cores lindas pessoalmente!”</p>
  <p style="margin-top:14px;font:600 22px Inter;color:var(--mut)">@kalebabymodainfantil <span class="estrela" style="font-size:22px">★★★★★</span></p></div>
  <div class="cartao" style="left:96px;right:96px;top:900px"><p class="p" style="color:var(--ink);font-size:33px">“Já tem quase 1 mês que fiz um bolinho para o meu filho e as bolas continuam intactas.”</p>
  <p style="margin-top:14px;font:600 22px Inter;color:var(--mut)">@thaiselima2 <span class="estrela" style="font-size:22px">★★★★★</span></p></div>"""),
 dict(fundo='grafite', html=f"""
  <div class="full"><img src="{EL}historias/longe_arco.jpg" style="object-position:50% 35%"></div>{VEL}
  <div class="blk" style="bottom:300px"><h2 class="t" style="color:#fff;font-size:86px">A festa que ela {mk('*sonhou.*')}</h2>
  <p class="p" style="margin-top:24px">Montada por você, na sua sala.</p></div>"""),
 dict(fundo='lilasf', html=f"""
  <div class="blk" style="top:330px"><div class="k">Glowbos</div><h2 class="t" style="color:#fff;margin-top:22px">Mora longe?<br>{mk('*A festa vai até você.*')}</h2>
  <div style="margin-top:56px;display:flex;flex-direction:column;gap:16px;align-items:flex-start"><span class="pill br">glowbos.com.br</span><span class="pill" style="background:rgba(255,255,255,.2)">Correios pra todo o Brasil</span></div></div>"""),
])
