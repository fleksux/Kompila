from motor import IMG, ESP, mk
# Linha H · Reels do meio · "As festas de vocês": fotos reais de clientes da Shopee, uma por cena com o @ entrando.
# 12 s. Texto só dentro do recorte 3:4 (y 390 a 1530).
HD = '../../carrossel/2026-10-16_votacao/hd/'
CENAS = [  # (foto, @, posição da foto)
 ('r025.jpg', 'scarlettsilva153', '50% 45%'),
 ('r009.jpg', 'emylegb', '50% 40%'),
 ('r016.jpg', 'stefanesoares352', '50% 45%'),
 ('r031.jpg', 'giiholliver595', '50% 45%'),
 ('r034.jpg', 'jessicasilva908534', '50% 45%'),
 ('r036.jpg', 'dannygomes35', '50% 50%'),
 ('r040.jpg', 'natalialesnock082', '50% 50%'),
]
T = 1.25
html = f"""<div class="ab"><div class="k">feitas em casa</div><h1 class="t" style="font-size:118px;margin-top:16px">As festas<br>{mk('*de vocês*')}</h1></div>"""
for i, (f, n, pos) in enumerate(CENAS):
    t0 = 1.6 + i * T
    html += f"""<div class="cena" style="animation-delay:{t0}s"><img src="{HD}{f}" style="object-position:{pos};animation-delay:{t0}s">
  <span class="tag" style="animation-delay:{t0 + .2}s">@{n}</span><span class="cnt" style="animation-delay:{t0 + .1}s">{i + 1}/{len(CENAS)}</span></div>"""
fim = 1.6 + len(CENAS) * T
html += f"""<div class="fim" style="animation-delay:{fim - .2}s"><h1 class="t" style="color:#fff;font-size:120px">Marca a gente<br>na sua {mk('*festa*')}</h1>
<p class="p" style="margin-top:30px">A próxima pode aparecer aqui.</p>
<div style="margin-top:50px;display:flex;gap:16px;flex-wrap:wrap"><span class="pill br">@glowbosbaloes</span><span class="pill" style="background:rgba(255,255,255,.16)">glowbos.com.br</span></div></div>
<div class="barra"><i></i></div>"""
css = f"""
.ab{{position:absolute;left:96px;right:96px;top:620px;animation:ab 1.8s ease both}}
@keyframes ab{{0%{{opacity:0;transform:translateY(40px)}}25%{{opacity:1;transform:none}}85%{{opacity:1}}100%{{opacity:0}}}}
.cena{{position:absolute;inset:0;opacity:0;animation:cena {T + .25}s linear both}}
@keyframes cena{{0%{{opacity:0}}10%{{opacity:1}}88%{{opacity:1}}100%{{opacity:0}}}}
.cena img{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:zoom {T + .25}s linear both}}
.cena .tag{{position:absolute;left:96px;top:1380px;background:#fff;color:var(--ink);border-radius:99px;padding:18px 30px;font:800 40px Inter;box-shadow:0 14px 34px rgba(0,0,0,.25);animation:sobe .5s cubic-bezier(.2,.8,.2,1) both;max-width:888px}}
.cena .cnt{{position:absolute;right:96px;top:420px;background:var(--pink);color:#fff;border-radius:99px;padding:12px 24px;font:800 30px Inter;animation:sobe .5s ease both}}
.fim{{position:absolute;inset:0;background:var(--berry);padding:600px 96px 0;opacity:0;animation:fim 1s ease-out both}}
@keyframes fim{{from{{opacity:0;transform:translateY(60px)}}to{{opacity:1;transform:none}}}}
.fim .p{{color:rgba(255,255,255,.88)}}
.barra{{position:absolute;left:96px;right:96px;top:350px;height:8px;border-radius:9px;background:rgba(29,26,31,.14);overflow:hidden;z-index:9}}
.barra i{{display:block;height:100%;width:100%;background:var(--pink);transform-origin:left;animation:bar 12s linear both}}
@keyframes bar{{from{{transform:scaleX(0)}}to{{transform:scaleX(1)}}}}
"""
POST = dict(ordem=20, slug='h2_reel_festas', tipo='reel', dur=12, fundo='rosa', html=html, css=css, leg="""
As festas de vocês 🎈💗

Cada foto aqui foi mandada por uma cliente de verdade, com os balões que saíram da nossa loja. Arco, mesa, bolo e muita criança feliz.

Fez festa com balão da Glowbos? Marca a gente @glowbosbaloes que a sua pode entrar no próximo vídeo.
👉 glowbos.com.br

#festainfantil #arcodebaloes #festaemcasa #clienteglowbos #glowbos
""")
