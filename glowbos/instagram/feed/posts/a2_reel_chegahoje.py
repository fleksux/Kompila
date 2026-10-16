from motor import IMG, ESP, mk
# Linha A · Reels do meio · o dia do "chega hoje" em 4 horários. 10 s, sem fala (texto na tela + música no app).
# Cada cena entra e sai por keyframes com atraso; o render avança o relógio quadro a quadro.
CENAS = [  # (início s, hora, frase, foto)
 (0.0, '11:40', 'Lembrou que faltam os balões', f'{ESP}cores.jpg'),
 (2.3, '11:52', 'Escolheu as cores e pagou no site', f'{IMG}pack_candy.webp'),
 (4.6, '14:30', 'O motoboy tocou a campainha', f'{ESP}entrega.jpg'),
 (6.9, '16:00', 'Festa pronta', f'{ESP}pronto.jpg'),
]
html = ''
for i, (t0, hora, frase, foto) in enumerate(CENAS):
    html += f"""<div class="cena" style="animation-delay:{t0}s">
  <div class="foto"><img src="{foto}" style="animation-delay:{t0}s"></div>
  <div class="hora">{hora}</div><div class="frase">{frase}</div></div>"""
html += f"""<div class="fim"><div class="k" style="color:#fff">SP e Grande SP</div><h1 class="t" style="color:#fff;font-size:150px">Chega<br>{mk('*hoje.*')}</h1>
<p class="p" style="margin-top:30px">Pagou até 12h, o motoboy entrega no mesmo dia.</p><span class="pill br" style="margin-top:50px">glowbos.com.br</span></div>
<div class="barra"><i></i></div>"""
css = """
.cena{position:absolute;inset:0;opacity:0;animation:cena 2.6s linear both}
@keyframes cena{0%{opacity:0;transform:scale(1.04)}8%{opacity:1;transform:scale(1)}88%{opacity:1}100%{opacity:0}}
.cena .foto{position:absolute;left:0;right:0;top:0;height:1280px;overflow:hidden}
.cena .foto img{width:100%;height:100%;object-fit:cover;animation:zoom 2.6s linear both}
@keyframes zoom{from{transform:scale(1)}to{transform:scale(1.08)}}
.cena .hora{position:absolute;left:96px;top:1120px;font:900 260px/1 'Inter Tight';letter-spacing:-.06em;color:var(--pink);text-shadow:0 10px 40px rgba(0,0,0,.18)}
.cena .frase{position:absolute;left:96px;right:96px;top:1420px;font:800 64px/1.08 'Inter Tight';letter-spacing:-.03em;color:var(--ink)}
.fim{position:absolute;inset:0;background:var(--berry);padding:520px 96px 0;opacity:0;animation:fim 1.4s ease-out both;animation-delay:9.2s}
@keyframes fim{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
.fim .p{color:rgba(255,255,255,.88)}
.barra{position:absolute;left:96px;right:96px;top:72px;height:8px;border-radius:9px;background:rgba(29,26,31,.12);overflow:hidden;z-index:9}
.barra i{display:block;height:100%;width:100%;background:var(--pink);transform-origin:left;animation:bar 11s linear both}
@keyframes bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
"""
POST = dict(ordem=2, slug='a2_reel_chegahoje', tipo='reel', dur=11, fundo='creme', html=html, css=css, leg="""
11h40 lembrou. 16h a festa tava pronta 🎈

Em SP e Grande SP, pediu e pagou até as 12h, o motoboy entrega no mesmo dia. Frete R$ 10.

Marca aqui quem sempre deixa tudo pra última hora 👇
glowbos.com.br

#festainfantil #baloes #entregarapida #saopaulo #glowbos
""")
