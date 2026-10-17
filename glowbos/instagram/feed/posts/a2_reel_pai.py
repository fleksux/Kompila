from motor import mk
# Linha A · Reels do meio · a mesma história do pai em 12 s. Foto cheia, texto dentro do recorte 3:4 (y 390 a 1530).
EL = '../../elenco/'
CENAS = [  # (início s, foto, linha 1, linha 2)
 (0.0, 'historias/pai_saindo.jpg', '19h40.', 'Saindo do trabalho. A festa é amanhã.'),
 (2.4, 'historias/pai_sofa.jpg', '21h.', 'Ele dormiu. O pedido saiu pelo celular.'),
 (4.8, 'historias/pai_montando.jpg', 'No dia seguinte.', 'Chegou. Ele montou o arco na sala.'),
 (7.2, 'cenas/menino/menino_carros_a.jpg', '17h.', 'Parabéns pra você.'),
]
html = ''
for t0, foto, l1, l2 in CENAS:
    html += f"""<div class="cena" style="animation-delay:{t0}s"><img src="{EL}{foto}" style="animation-delay:{t0}s">
<div class="vel2"></div><div class="tx"><div class="h">{l1}</div><div class="s">{l2}</div></div></div>"""
html += f"""<div class="fim"><div class="k" style="color:#fff">Glowbos</div><h1 class="t" style="color:#fff;font-size:118px;margin-top:20px">Não deu tempo de planejar?<br>{mk('*A festa chega.*')}</h1>
<p class="p" style="margin-top:30px">SP e Grande SP pelo motoboy. Resto do Brasil pelos Correios.</p><span class="pill br" style="margin-top:44px">glowbos.com.br</span></div>"""
css = """
.cena{position:absolute;inset:0;opacity:0;animation:cena 2.7s linear both;overflow:hidden}
@keyframes cena{0%{opacity:0}7%{opacity:1}90%{opacity:1}100%{opacity:0}}
.cena>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:zoomr 2.7s linear both}
@keyframes zoomr{from{transform:scale(1.02)}to{transform:scale(1.12)}}
.vel2{position:absolute;left:0;right:0;bottom:0;height:62%;background:linear-gradient(180deg,rgba(29,26,31,0),rgba(29,26,31,.85) 65%)}
.cena .tx{position:absolute;left:96px;right:96px;top:1150px;color:#fff}
.cena .h{font:800 120px/1 'Bricolage Grotesque';letter-spacing:-.04em}
.cena .s{margin-top:18px;font:600 44px/1.25 Inter;color:rgba(255,255,255,.92)}
.fim{position:absolute;inset:0;background:var(--berry);padding:560px 96px 0;opacity:0;animation:fim 1.2s cubic-bezier(.2,.8,.2,1) both;animation-delay:9.8s}
@keyframes fim{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
.fim .p{color:rgba(255,255,255,.9)}
#reel .lg{filter:drop-shadow(0 4px 14px rgba(0,0,0,.3))}
"""
POST = dict(ordem=2, slug='a2_reel_pai', tipo='reel', dur=12.5, fundo='grafite', html=html, css=css, leg="""
19h40 saindo do trabalho. 17h do dia seguinte, parabéns pra você 🎈

Não deu tempo de planejar? Pelo celular você escolhe as cores do tema, o kit de arco e o número.
SP e Grande SP pelo motoboy. Resto do Brasil pelos Correios.

Marca aqui o pai que sempre dá um jeito 👇
glowbos.com.br

#festainfantil #paidemenino #festaemcasa #glowbos
""")
