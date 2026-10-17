from motor import IMG, mk
# Linha A · público: o pai que sai tarde do trabalho e não deu tempo de planejar a festa.
# Elenco da Glowbos (pai e menino da cena "carros", 16/10). Prova = comentário real da Shopee.
EL = '../../elenco/'
VEL = '<div class="vel" style="height:70%"></div>'
POST = dict(ordem=1, slug='a1_pai_saiu_tarde', tipo='carrossel', leg="""
19h40. Você ainda está saindo do trabalho e o aniversário dele é amanhã.

Não deu tempo de planejar. Tudo bem.
Pelo celular, em poucos minutos: as cores do tema, o kit de arco, o número.
Em SP e Grande SP o motoboy entrega. Pagou até 12h, chega no mesmo dia. Depois disso, no dia seguinte.

"O arco foi fácil de montar, ficou lindo e super rápido!!!" (@brendhaalexia, cliente na Shopee)

Ele não vai lembrar que você saiu tarde. Vai lembrar da festa.
glowbos.com.br

#festainfantil #paidemenino #festaemcasa #arcodebaloes #saopaulo #glowbos
""", slides=[
 dict(fundo='grafite', html=f"""
  <div class="full"><img src="{EL}historias/pai_saindo.jpg" style="object-position:50% 35%"></div>{VEL}
  <div class="blk" style="bottom:300px"><div class="k">quinta, 19h40</div>
  <h1 class="t" style="color:#fff;margin-top:22px">O aniversário dele<br>é {mk('*amanhã.*')}</h1>
  <p class="p" style="margin-top:24px">E você ainda está saindo do trabalho.</p></div>"""),
 dict(fundo='grafite', html=f"""
  <div class="full"><img src="{EL}historias/pai_sofa.jpg" style="object-position:50% 40%"></div>{VEL}
  <div class="blk" style="bottom:300px"><h2 class="t2" style="color:#fff">Não deu tempo de planejar.<br>{mk('*Tudo bem.*')}</h2>
  <p class="p" style="margin-top:24px;max-width:800px">Ele já dormiu. Pelo celular você escolhe as cores do tema, o kit de arco e o número.</p></div>"""),
 dict(fundo='creme', html=f"""
  <div class="blk" style="top:270px"><div class="k">como chega</div><h2 class="t2" style="margin-top:18px">O motoboy leva {mk('*até a sua porta.*')}</h2></div>
  <div class="ft" style="left:96px;top:560px;width:420px;height:470px"><img src="{IMG}kit_151.webp"></div>
  <div class="ft" style="left:540px;top:560px;width:444px;height:470px"><img src="{IMG}pack_preto_verm_amar.webp"></div>
  <div class="blk" style="top:1070px"><p class="p" style="color:var(--ink)"><b>SP e Grande SP.</b> Pagou até 12h, chega no mesmo dia. Depois disso, no dia seguinte.</p></div>"""),
 dict(fundo='grafite', html=f"""
  <div class="full"><img src="{EL}historias/pai_montando.jpg" style="object-position:50% 30%"></div>{VEL}
  <div class="blk" style="bottom:300px"><h2 class="t2" style="color:#fff">De manhã, {mk('*você monta.*')}</h2>
  <div class="cartao" style="position:relative;margin-top:30px;padding:28px 32px"><p class="p" style="color:var(--ink);font-size:31px">“O arco foi fácil de montar, ficou lindo e super rápido!!!”</p>
  <p style="margin-top:12px;font:600 22px Inter;color:var(--mut)">@brendhaalexia · cliente na Shopee <span class="estrela" style="font-size:22px">★★★★★</span></p></div></div>"""),
 dict(fundo='grafite', html=f"""
  <div class="full"><img src="{EL}cenas/menino/menino_carros_b.jpg" style="object-position:50% 30%"></div>{VEL}
  <div class="blk" style="bottom:300px"><h2 class="t" style="color:#fff;font-size:82px">Ele não vai lembrar que você saiu tarde.</h2>
  <p class="p" style="margin-top:24px;font-size:40px;color:#fff">Vai lembrar {mk('*da festa.*')}</p></div>"""),
 dict(fundo='berry', html=f"""
  <div class="blk" style="top:330px"><div class="k">Glowbos</div><h2 class="t" style="color:#fff;margin-top:22px">Não deu tempo<br>de planejar?<br>{mk('*A festa chega.*')}</h2>
  <div style="margin-top:56px;display:flex;flex-direction:column;gap:16px;align-items:flex-start"><span class="pill br">glowbos.com.br</span><span class="pill" style="background:rgba(255,255,255,.16)">SP e Grande SP: motoboy</span><span class="pill" style="background:rgba(255,255,255,.16)">Resto do Brasil: Correios</span></div></div>"""),
])
