from motor import IMG, ESP, mk
# Linha B · Reels do meio · stop motion do arco crescendo na parede, 12 s
CENAS = [
 (0.0, '1', 'o primeiro cacho', f'{IMG}montagem/a09_1.webp'),
 (2.2, '2', 'mais uma cor', f'{IMG}montagem/a09_2.webp'),
 (4.4, '3', 'a curva aparece', f'{IMG}montagem/a09_3.webp'),
 (6.6, '4', 'arco montado', f'{IMG}montagem/a09_4.webp'),
 (8.8, '♥', 'festa pronta', f'{ESP}pronto.jpg'),
]
html = ''
for t0, n, frase, foto in CENAS:
    html += f"""<div class="cena" style="animation-delay:{t0}s"><div class="foto"><img src="{foto}" style="animation-delay:{t0}s"></div>
  <div class="passo"><span class="num">{n}</span><span class="frase">{frase}</span></div></div>"""
html += f"""<div class="topo"><div class="k">tutorial</div><h1 class="t2">Arco de balões<br>em {mk('*4 passos*')}</h1></div>
<div class="fim"><h1 class="t" style="color:#fff;font-size:130px">Você<br>{mk('*consegue.*')}</h1>
<p class="p" style="margin-top:30px">Kit de arco a partir de R$ 31,99, com as cores que você escolher. Chega hoje em SP e Grande SP.</p><span class="pill br" style="margin-top:50px">glowbos.com.br</span></div>
<div class="barra"><i></i></div>"""
css = """
.cena{position:absolute;inset:0;opacity:0;animation:cena 2.25s linear both}
@keyframes cena{0%{opacity:0}3%{opacity:1}97%{opacity:1}100%{opacity:0}}
.cena .foto{position:absolute;left:0;right:0;top:0;bottom:0;overflow:hidden}
.cena .foto img{width:100%;height:100%;object-fit:cover;animation:zoom 2.3s linear both}
@keyframes zoom{from{transform:scale(1.02)}to{transform:scale(1.09)}}
.topo{position:absolute;left:96px;right:96px;top:300px;z-index:5;animation:topo 12s linear both}
@keyframes topo{0%,72%{opacity:1}75%,100%{opacity:0}}
.passo{position:absolute;left:96px;right:96px;top:1380px;display:flex;align-items:center;gap:28px;background:#fff;border-radius:30px;padding:30px 34px;box-shadow:0 18px 50px rgba(29,26,31,.18)}
.passo .num{width:110px;height:110px;font-size:60px}
.passo .frase{font:800 72px/1 'Bricolage Grotesque';letter-spacing:-.04em}
.fim{position:absolute;inset:0;background:var(--pink);padding:520px 96px 0;opacity:0;animation:fim 1.2s ease-out both;animation-delay:10.6s;z-index:8}
@keyframes fim{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
.fim .p{color:rgba(255,255,255,.88)}
.barra{position:absolute;left:96px;right:96px;top:72px;height:8px;border-radius:9px;background:rgba(29,26,31,.12);overflow:hidden;z-index:9}
.barra i{display:block;height:100%;width:100%;background:var(--pink);transform-origin:left;animation:bar 12s linear both}
@keyframes bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
"""
POST = dict(ordem=5, slug='b2_reel_arco', tipo='reel', dur=12, fundo='creme', html=html, css=css, leg="""
Do primeiro cacho ao arco pronto 🎈

Quem nunca montou acha difícil. Não é: cacho de 4, encaixa na fita, alterna as cores e preenche os buracos.

Kit de arco a partir de R$ 31,99, com as cores que você escolher. Em SP e Grande SP chega no mesmo dia.
👉 glowbos.com.br

Manda pra quem vai te ajudar a montar 👇

#arcodebaloes #tutorial #festaemcasa #decoracao #glowbos
""")
