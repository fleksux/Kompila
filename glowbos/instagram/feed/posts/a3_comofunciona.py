from motor import IMG, ESP, mk
# Linha A · tutorial pra quem nunca comprou: como funciona o Chega Hoje, com a especialista explicando
POST = dict(ordem=3, slug='a3_comofunciona', tipo='carrossel', leg="""
Nunca comprou balão pela internet? A especialista explica em 3 passos 👇

1. Escolhe no glowbos.com.br: pacote, kit de arco, número ou set pronto
2. Paga no site até as 12h
3. O motoboy entrega no mesmo dia em SP e Grande SP (R$ 10)

Mora fora da Grande SP? Vai pelos Correios, PAC ou SEDEX.

Ficou alguma dúvida? Pergunta aqui nos comentários que a gente responde 💬

#baloes #festaemcasa #festainfantil #comprarbaloes #glowbos
""", slides=[
 dict(fundo='creme', html=f"""
  <div class="ft" style="left:500px;top:170px;width:580px;height:1000px;border-radius:30px 0 0 30px"><img src="{ESP}dica.jpg" style="object-position:40% 20%"></div>
  <div class="blk" style="top:300px;right:610px"><div class="k">nunca comprou?</div>
  <h1 class="t" style="margin-top:22px;font-size:70px">Como funciona o {mk('*chega hoje*')}</h1>
  <p class="p" style="margin-top:28px">3 passos. Leva 2 minutos.</p></div>
  <div class="mao" style="position:absolute;left:96px;top:1220px">a especialista te mostra →</div>"""),
 dict(fundo='bebe', html=f"""
  <div class="blk" style="top:200px;display:flex;gap:28px;align-items:center"><span class="num">1</span><h2 class="t2">Escolhe {mk('*no site*')}</h2></div>
  <div class="ft" style="left:96px;top:420px;width:430px;height:540px"><img src="{IMG}arco_09_candy_algodao.webp"></div>
  <div class="ft" style="left:554px;top:420px;width:430px;height:255px"><img src="{IMG}pack_azul_verm_amar.webp"></div>
  <div class="ft" style="left:554px;top:705px;width:430px;height:255px"><img src="{IMG}numero_5_rose.webp" style="object-position:50% 25%"></div>
  <div class="blk" style="top:1010px"><p class="p" style="color:var(--ink)"><b>Pacote, kit de arco, número ou set pronto.</b> Você escolhe as cores, a gente separa.</p></div>"""),
 dict(fundo='pessego', html=f"""
  <div class="blk" style="top:200px;display:flex;gap:28px;align-items:center"><span class="num">2</span><h2 class="t2">Paga {mk('*até 12h*')}</h2></div>
  <div class="blk" style="top:470px;font:900 330px/0.85 'Inter Tight';letter-spacing:-.06em;color:var(--berry)">12:00</div>
  <div class="cartao" style="left:96px;right:96px;top:860px"><p class="p" style="color:var(--ink)"><b>Pagou até o meio-dia, sai hoje.</b><br>Depois disso, chega no dia seguinte. O carrinho já mostra quando chega.</p></div>"""),
 dict(fundo='lilas', html=f"""
  <div class="blk" style="top:200px;display:flex;gap:28px;align-items:center"><span class="num">3</span><h2 class="t2">O motoboy {mk('*entrega*')}</h2></div>
  <div class="ft" style="left:96px;top:420px;width:888px;height:560px"><img src="{IMG}hero_entrega_2.webp" style="object-position:70% 40%"></div>
  <div class="blk" style="top:1030px"><p class="p" style="color:var(--ink)"><b>SP e Grande SP, frete R$ 10.</b> Fora daqui vai pelos Correios, PAC ou SEDEX.</p></div>"""),
 dict(fundo='rosa', html=f"""
  <div class="ftc" style="left:96px;top:220px;width:300px;height:300px"><img src="{ESP}dica.jpg" style="object-position:45% 18%"></div>
  <div class="mao" style="position:absolute;left:430px;top:300px">dica da especialista</div>
  <div class="bolha" style="left:96px;right:96px;top:580px;font-size:40px"><b>Festa no sábado?</b> Pede na sexta de manhã. Chega no mesmo dia, você enche à noite e no sábado só monta.</div>
  <div class="blk" style="top:1000px;display:flex;gap:18px;flex-wrap:wrap"><span class="pill">glowbos.com.br</span><span class="pill gr">chega hoje em SP</span></div>"""),
])
