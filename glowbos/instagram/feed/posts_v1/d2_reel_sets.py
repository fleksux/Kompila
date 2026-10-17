from motor import IMG, ESP, mk
# Linha D · Reels do meio · revelação dos 4 sets, um por cena com zoom lento; fim com o convite. 12 s.
S = '../img_sets/'
CENAS = [  # (início s, foto, nome, idade, cor do selo)
 (0.0, 'set_carros_4anos.jpg', 'Set Carros', 'número 4', 'var(--berry)'),
 (2.4, 'set_menina_5anos.jpg', 'Set Borboleta Rosê', 'número 5', 'var(--pink)'),
 (4.8, 'set_safari_1ano.jpg', 'Set Safári', 'número 1', '#7a8f5a'),
 (7.2, 'set_cha_revelacao.jpg', 'Set Chá Revelação', 'menino ou menina?', 'var(--grafite)'),
]
html = f"""<div class="topo"><div class="k">novidade</div><div class="t2" style="margin-top:10px">Sets {mk('*prontos*')}</div></div>"""
for t0, foto, nome, idade, cor in CENAS:
    html += f"""<div class="cena" style="animation-delay:{t0}s">
  <div class="foto"><img src="{S}{foto}" style="animation-delay:{t0}s"></div>
  <div class="nome" style="animation-delay:{t0+.35}s"><b>{nome}</b><span style="background:{cor}">{idade}</span></div></div>"""
html += f"""<div class="fim"><div class="k" style="color:#fff">sob encomenda</div>
<h1 class="t" style="color:#fff;font-size:112px;margin-top:18px">Escolha o tema<br>{mk('*e a idade.*')}</h1>
<p class="p" style="margin-top:34px">Número gigante, base de balões, figuras e buquê, tudo combinando.</p>
<span class="pill br" style="margin-top:56px">glowbos.com.br</span></div>"""
css = """
.topo{position:absolute;left:96px;top:480px;z-index:5}
.cena{position:absolute;left:0;right:0;top:0;height:1920px;opacity:0;animation:cena 2.7s linear both}
@keyframes cena{0%{opacity:0}8%{opacity:1}90%{opacity:1}100%{opacity:0}}
.cena .foto{position:absolute;left:96px;right:96px;top:640px;height:720px;border-radius:34px;overflow:hidden;box-shadow:0 24px 60px rgba(29,26,31,.18)}
.cena .foto img{width:100%;height:100%;object-fit:cover;animation:zoom 2.7s linear both}
@keyframes zoom{from{transform:scale(1.12)}to{transform:scale(1)}}
.cena .nome{position:absolute;left:96px;right:96px;top:1394px;display:flex;align-items:center;justify-content:space-between;gap:20px;animation:sobe .6s ease-out both}
@keyframes sobe{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
.cena .nome b{font:800 58px/1 'Bricolage Grotesque';letter-spacing:-.04em}
.cena .nome span{flex:none;height:66px;line-height:66px;padding:0 28px;border-radius:99px;color:#fff;font:800 28px Inter}
.fim{position:absolute;inset:0;background:var(--grafite);padding:620px 96px 0;opacity:0;animation:fim 1.2s ease-out both;animation-delay:9.8s;z-index:8}
@keyframes fim{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
.fim .p{color:rgba(255,255,255,.88)}
"""
POST = dict(ordem=11, slug='d2_reel_sets', tipo='reel', dur=12, fundo='creme', html=html, css=css, leg="""
Novidade: Sets prontos 🎈 Qual é a sua cara?

Carros número 4, Borboleta Rosê número 5, Safári número 1 e Chá Revelação.
Número gigante, base de balões, figuras e buquê, tudo no estilo da festa.

Sob encomenda: pede o orçamento no glowbos.com.br com a data e o CEP.

#festainfantil #decoracaodefesta #charevelacao #baloes #glowbos
""")
