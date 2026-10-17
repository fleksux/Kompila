from motor import IMG, ESP, mk, esc
# Linha H · exaltar o cliente · a festa de uma cliente real da Shopee (foto, comentário e compra reais).
HD = '../../carrossel/2026-10-16_votacao/hd/'
AV = IMG + 'avaliacoes/perfil/'
N = 'oiu7aucmxu'
FOTO = HD + 'r020.jpg'
AVA = AV + 'o-lxcwgj5htf3zf8.webp'
COM = 'Excelente qualidade, material bem grosso então sugiro bomba pra encher!'
def av(sz):
    return (f'<span style="width:{sz}px;height:{sz}px;border-radius:50%;padding:5px;background:conic-gradient(var(--pessego),var(--pink),var(--lilas),var(--pessego));flex:none;display:block">'
            f'<span style="display:block;width:100%;height:100%;border-radius:50%;border:5px solid #fff;overflow:hidden"><img src="{AVA}" style="width:100%;height:100%;object-fit:cover"></span></span>')

POST = dict(css='', ordem=19, slug='h1_festa_cliente', tipo='carrossel', leg=f"""
Essa festa é da @{N} e a gente não para de olhar 💗

Mesa posta, a criançada toda reunida e o arco que ela montou com o pacote de 75 balões da Glowbos.
A dica dela: o material é bem grosso, então usa bomba pra encher.

Obrigado por deixar a gente fazer parte. Você fez isso!

Fez festa com balão da Glowbos? Marca a gente que a sua pode ser a próxima 🎈
👉 glowbos.com.br

#festainfantil #arcodebaloes #festaemcasa #clienteglowbos #glowbos
""", slides=[
 dict(fundo='grafite', html=f"""
  <div class="full"><img src="{FOTO}" style="object-position:50% 45%"></div><div class="vel" style="height:70%"></div>
  <div class="blk" style="bottom:230px"><div class="k" style="color:#FFD0E1">a festa da cliente</div>
  <h1 class="t" style="color:#fff;margin-top:18px;font-size:82px">@{N}</h1>
  <p class="p" style="margin-top:20px;max-width:820px">Você fez isso. A gente só levou os {mk('*balões*')}.</p></div>"""),
 dict(fundo='creme', html=f"""
  <div class="blk" style="top:260px"><div class="k">o que ela comprou</div><h2 class="t2" style="margin-top:14px">Um pacote.<br>A festa {mk('*inteira*')}.</h2></div>
  <div class="pol" style="left:96px;top:600px;width:420px;height:500px;transform:rotate(-4deg)"><img src="{IMG}pack_azul_verm_amar.webp"><i>pacote 75 balões</i></div>
  <div class="pol" style="left:560px;top:560px;width:420px;height:500px;transform:rotate(3deg)"><img src="{FOTO}" style="object-position:50% 70%"><i>a festa dela</i></div>
  <div class="blk" style="top:1140px"><div class="preco" style="font-size:52px"><small>até 3 cores à escolha</small>R$ 25,99</div></div>"""),
 dict(fundo='rosa', html=f"""
  <div class="ft" style="left:96px;top:260px;width:888px;height:480px"><img src="{FOTO}" style="object-position:50% 35%"></div>
  <div class="cartao" style="left:96px;right:96px;top:690px;padding:40px 40px">
   <div style="display:flex;gap:22px;align-items:center">{av(104)}<div><b style="display:block;font:800 32px Inter">{N}</b><span class="estrela" style="font-size:26px">★★★★★</span></div></div>
   <p style="font:700 44px/1.2 'Bricolage Grotesque';letter-spacing:-.02em;margin-top:26px">"{esc(COM)}"</p>
   <p class="p" style="font-size:24px;margin-top:16px">avaliação real na Shopee · pacote 75 balões</p></div>"""),
 dict(fundo='pessego', html=f"""
  <div class="ft" style="left:440px;top:240px;width:544px;height:720px"><img src="{ESP}bomba.jpg" style="object-position:50% 30%"></div>
  <div class="blk" style="top:300px;right:680px"><div class="k">a dica dela</div><h2 class="t2" style="margin-top:14px;font-size:60px">Usa {mk('*bomba*')}</h2></div>
  <div class="bolha" style="left:96px;right:96px;top:1010px;font-size:34px"><b>A especialista assina embaixo:</b> balão de material grosso é resistente, mas cansa no fôlego. Com a bomba manual, a festa enche num instante.</div>"""),
 dict(fundo='berry', html=f"""
  <div style="position:absolute;left:96px;top:270px">{av(180)}</div>
  <div class="blk" style="top:500px"><h2 class="t" style="color:#fff;font-size:84px">Obrigado,<br>{mk(f'*@{N}*')}</h2>
  <p class="p" style="margin-top:28px;max-width:840px">Fez festa com balão da Glowbos? Marca a gente. A sua pode ser a próxima aqui.</p>
  <div style="margin-top:44px;display:flex;gap:18px;flex-wrap:wrap"><span class="pill br">@glowbosbaloes</span><span class="pill" style="background:rgba(255,255,255,.16)">glowbos.com.br</span></div></div>"""),
])
