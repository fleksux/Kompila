from motor import IMG, ESP, mk, esc
# Linha H · exaltar o cliente · "Cliente nota 10": outra cliente real da Shopee, layout diferente do h1.
HD = '../../carrossel/2026-10-16_votacao/hd/'
N = 'ddaianefonseca'
FOTO = HD + 'r017.jpg'
COM = 'Balões bem resistentes, cores fortes. Gostei muito. Comprem sem medo!'

POST = dict(css='', ordem=21, slug='h3_cliente_nota10', tipo='carrossel', leg=f"""
Cliente nota 10: @{N} ⭐⭐⭐⭐⭐

Olha essa aniversariante no meio da festa que a família montou em casa, com o arco de balões nas cores fortes do tema.
Ela comprou o pacote de 75 balões e deixou o recado: "Comprem sem medo!"

Obrigado pela confiança e pela foto linda 💗

A próxima festa que aparece aqui pode ser a sua. Marca a gente!
👉 glowbos.com.br

#festainfantil #arcodebaloes #festaemcasa #clienteglowbos #glowbos
""", slides=[
 dict(fundo='lilas', html=f"""
  <div class="ft" style="left:0;top:0;width:600px;height:1440px;border-radius:0"><img src="{FOTO}" style="object-position:50% 40%"></div>
  <div class="blk" style="left:650px;top:300px"><div class="k">cliente nota 10</div>
  <div style="font:800 190px/0.85 'Bricolage Grotesque';letter-spacing:-.06em;color:var(--berry);margin-top:18px">10</div>
  <span class="estrela" style="display:block;font-size:34px;margin-top:20px">★★★★★</span>
  <h2 class="t3" style="margin-top:40px;font-size:38px;word-break:break-all">@{N}</h2>
  <p class="p" style="margin-top:20px;font-size:28px">a festa que a família montou em casa</p></div>"""),
 dict(fundo='creme', html=f"""
  <div class="blk" style="top:250px;font:italic 400 300px/0.8 'Instrument Serif';color:var(--pink)">“</div>
  <div class="blk" style="top:470px"><p style="font:700 74px/1.08 'Bricolage Grotesque';letter-spacing:-.03em">Balões bem resistentes, cores fortes. Gostei muito. {mk('*Comprem sem medo!*')}</p>
  <div style="display:flex;gap:18px;align-items:center;margin-top:50px"><span class="num" style="width:76px;height:76px;font-size:36px;background:var(--lilas)">{N[0].upper()}</span><div><b style="display:block;font:800 30px Inter">{N}</b><small style="font:600 24px Inter;color:var(--mut)">avaliação real na Shopee · pacote 75 balões</small></div></div></div>"""),
 dict(fundo='grafite', html=f"""
  <div class="blk" style="top:260px"><h2 class="t2" style="color:#fff">Repara nos {mk('*detalhes*')}</h2></div>
  <div class="pol" style="left:96px;top:450px;width:400px;height:480px;transform:rotate(-4deg)"><img src="{FOTO}" style="object-position:50% 8%"><i>o arco</i></div>
  <div class="pol" style="left:540px;top:420px;width:440px;height:520px;transform:rotate(3deg)"><img src="{FOTO}" style="object-position:50% 85%"><i>o bolo</i></div>
  <div class="blk" style="top:1060px"><p class="p">Cores fortes do tema, montadas em casa com o pacote de 75 balões.</p></div>"""),
 dict(fundo='pessegof', html=f"""
  <div class="ftc" style="right:96px;top:250px;width:380px;height:380px"><img src="{FOTO}" style="object-position:50% 30%"></div>
  <div class="blk" style="top:700px"><h2 class="t" style="font-size:88px">Obrigado,<br>{mk(f'*@{N}*')}</h2>
  <p class="p" style="margin-top:26px;color:var(--ink)">A próxima festa que aparece aqui pode ser a sua. Marca a gente!</p>
  <div style="margin-top:40px;display:flex;gap:18px;flex-wrap:wrap"><span class="pill">@glowbosbaloes</span><span class="pill gr">glowbos.com.br</span></div></div>"""),
])
