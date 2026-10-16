from motor import IMG, ESP, mk
# Linha F · Reels do meio · Candy colors: balões soltos subindo, pacote, arco pronto e os 3 pacotes com preço. 12 s.
BAL = [('b_rosa', 120, 0.0, 300), ('b_lilas', 420, 0.25, 360), ('b_azul_baby', 720, 0.5, 320), ('b_verde_agua', 260, 0.75, 280), ('b_branco', 600, 1.0, 300), ('b_rosa', 860, 1.2, 240)]
bal = ''.join(f'<img class="bal" src="{IMG}{n}.webp" style="left:{x}px;width:{w}px;animation-delay:{d}s">' for n, x, d, w in BAL)
pac = ''
for i, (q, c, pr) in enumerate([('50', '2 cores', '19,87'), ('75', '3 cores', '25,99'), ('100', '4 cores', '32,99')]):
    pac += (f'<div class="pc" style="top:{720+i*300}px;animation-delay:{7.6+i*0.35}s"><b>{q}</b><span>balões candy<br><small>até {c}</small></span>'
            f'<em>R$ {pr}</em></div>')
html = f"""
<div class="c1"><div class="blk" style="top:760px;text-align:center"><div class="k">tons pastel</div>
 <h1 class="t" style="font-size:170px;margin-top:20px">Candy<br>{mk('*colors*')}</h1></div>{bal}</div>
<div class="c2"><div class="foto"><img src="{IMG}pack_candy.webp"></div>
 <div class="blk" style="top:1330px"><h2 class="t2" style="font-size:76px">Os mais pedidos pra {mk('*chá de bebê*')}</h2>
 <p class="p" style="margin-top:22px">chá revelação e festa infantil</p></div></div>
<div class="c3"><div class="duo"><div><img src="{IMG}arco_09_candy_algodao.webp"></div><div><img src="{IMG}arco_10_candy_morango.webp"></div></div>
 <div class="blk" style="top:1330px"><h2 class="t2" style="font-size:76px">E vira {mk('*arco*')} na sua parede</h2></div></div>
<div class="c4"><div class="blk" style="top:420px"><div class="k">você escolhe as cores</div><h2 class="t2" style="margin-top:14px;font-size:84px">Qual pacote?</h2></div>{pac}</div>
<div class="fim"><h1 class="t" style="color:#fff;font-size:140px">Monta o<br>seu {mk('*candy*')}</h1>
 <p class="p" style="margin-top:30px">Em SP e Grande SP, pago até 12h chega hoje.</p><span class="pill br" style="margin-top:50px">glowbos.com.br</span></div>
"""
css = """
#reel{background:var(--bebe)}
.c1,.c2,.c3,.c4{position:absolute;inset:0;opacity:0;animation:cena 2.6s linear both}
.c1{animation-delay:0s;animation-duration:2.7s}.c2{animation-delay:2.5s}.c3{animation-delay:4.9s}.c4{animation-delay:7.3s;animation-duration:3.1s}
@keyframes cena{0%{opacity:0}7%{opacity:1}90%{opacity:1}100%{opacity:0}}
.c1{opacity:1;animation-name:sai}@keyframes sai{0%,90%{opacity:1}100%{opacity:0}}
.bal{position:absolute;top:1960px;animation:sobe 2.7s cubic-bezier(.2,.7,.3,1) both;filter:drop-shadow(0 20px 30px rgba(0,0,0,.12))}
@keyframes sobe{from{transform:translateY(0) rotate(-6deg)}to{transform:translateY(-1500px) rotate(6deg)}}
.c1 .blk{z-index:2}
.foto,.duo{position:absolute;left:96px;right:96px;top:250px;height:1020px;border-radius:40px;overflow:hidden;box-shadow:0 30px 60px rgba(29,26,31,.14)}
.foto img{width:100%;height:100%;object-fit:cover;animation:zoom 2.6s linear both;animation-delay:2.5s}
@keyframes zoom{from{transform:scale(1.12)}to{transform:scale(1)}}
.duo{display:grid;grid-template-columns:1fr 1fr;gap:16px;background:transparent;box-shadow:none;border-radius:0}
.duo div{border-radius:36px;overflow:hidden;box-shadow:0 24px 50px rgba(29,26,31,.14)}
.duo img{width:100%;height:100%;object-fit:cover}
.duo div:last-child{transform:translateY(60px)}
.pc{position:absolute;left:96px;right:96px;height:260px;background:#fff;border-radius:34px;display:flex;align-items:center;gap:30px;padding:0 44px;box-shadow:0 18px 40px rgba(29,26,31,.1);animation:entra .5s ease-out both}
@keyframes entra{from{opacity:0;transform:translateX(120px)}to{opacity:1;transform:none}}
.pc b{font:900 120px/1 'Inter Tight';letter-spacing:-.05em;color:var(--lilas);width:220px}
.pc span{font:800 36px/1.15 Inter;flex:1;white-space:nowrap}.pc small{font:600 30px Inter;color:var(--mut)}
.pc em{font:900 56px 'Inter Tight';font-style:normal;color:var(--pink)}
.fim{position:absolute;inset:0;background:var(--lilas);padding:560px 96px 0;opacity:0;animation:fim 1.2s ease-out both;animation-delay:10.3s}
@keyframes fim{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
.fim .p{color:rgba(255,255,255,.92)}.fim .m{color:#fff}
"""
POST = dict(ordem=17, slug='f2_reel_candy', tipo='reel', dur=12, fundo='bebe', html=html, css=css, leg="""
Candy colors: os tons pastel que viraram a cara do chá de bebê, do chá revelação e da festa infantil 🩷💜🩵

Você escolhe as cores e a gente monta o pacote:
50 balões · até 2 cores · R$ 19,87
75 balões · até 3 cores · R$ 25,99
100 balões · até 4 cores · R$ 32,99

Em SP e Grande SP, pago até 12h chega hoje.
👉 glowbos.com.br

#candycolors #chadebebe #charevelacao #arcodebaloes #glowbos
""")
