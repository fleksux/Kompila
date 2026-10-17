from motor import IMG, ESP, mk
# Linha B · pra quem não entende nada: o que muda de um tamanho de balão pro outro
def fase(fundo, pol, foto, titulo, uso, preco, qtd, lado='esq'):
    if lado == 'esq':
        num = f'<div style="position:absolute;right:96px;top:250px;font:800 280px/1 \'Bricolage Grotesque\';letter-spacing:-.06em;color:var(--pink);text-align:right">{pol}<span style="font-size:170px">"</span></div>'
        ft = f'<div class="ft" style="left:96px;top:250px;width:460px;height:620px"><img src="{IMG}{foto}"></div>'
    else:
        num = f'<div style="position:absolute;left:96px;top:250px;font:800 280px/1 \'Bricolage Grotesque\';letter-spacing:-.06em;color:var(--pink)">{pol}<span style="font-size:170px">"</span></div>'
        ft = f'<div class="ft" style="right:96px;top:250px;width:460px;height:620px"><img src="{IMG}{foto}"></div>'
    return dict(fundo=fundo, html=f"""{num}{ft}
  <div class="blk" style="top:920px"><h2 class="t2">{titulo}</h2>
  <p class="p" style="margin-top:18px;color:var(--ink)">{uso}</p>
  <div class="preco" style="margin-top:22px;font-size:56px"><small>{qtd}</small>{preco}</div></div>""")
POST = dict(ordem=6, slug='b3_tamanhos', tipo='carrossel', leg="""
5, 8, 9, 12, 16 polegadas... qual eu compro? 🤔

A especialista explica pra quem nunca comprou:
🎈 5": o pequeno, preenche os buracos do arco e faz detalhe
🎈 8" e 9": o tamanho do arco, a base de tudo
🎈 12": dá volume, fica lindo em cacho e no teto
🎈 16": o grandão, faz o destaque

Segredo de decoradora: misture 3 tamanhos e o arco fica natural.

Todos com as cores que você escolher 👉 glowbos.com.br

#baloes #arcodebaloes #dicas #festaemcasa #glowbos
""", slides=[
 dict(fundo='grafite', html=f"""
  <div class="ftc" style="left:96px;top:330px;width:250px;height:250px"><img src="{IMG}pacote_5pol.webp"></div>
  <div class="ftc" style="left:320px;top:290px;width:320px;height:320px"><img src="{IMG}pacote_9pol.webp"></div>
  <div class="ftc" style="left:604px;top:260px;width:380px;height:380px"><img src="{IMG}pacote_16pol.webp"></div>
  <div class="blk" style="top:760px"><div class="k">pra quem não entende nada</div>
  <h1 class="t" style="color:#fff;margin-top:20px">Tamanho de balão:<br>pra que serve {mk('*cada um*')}</h1>
  <p class="p" style="margin-top:26px">A especialista explica em 4 slides.</p></div>"""),
 fase('rosa', '5', 'pacote_5pol.webp', f"O {mk('*pequeno*')}", 'Preenche os buracos do arco e faz detalhe na mesa do bolo.', 'R$ 9,99', '50 un.'),
 fase('pessego', '9', 'pacote_9pol.webp', f"O tamanho {mk('*do arco*')}", 'É a base de tudo. O nosso pacote padrão é de 8", de 50 a 125 balões, com até 5 cores.', 'R$ 18,99', '50 un. de 9"', 'dir'),
 fase('lilas', '12', 'pacote_12pol.webp', f"O do {mk('*volume*')}", 'Fica lindo em cacho, preso no teto ou misturado no arco pra dar corpo.', 'R$ 15,99', '25 un.'),
 fase('creme', '16', 'pacote_16pol.webp', f"O {mk('*destaque*')}", 'O grandão. Aparece no meio do arco e chama a atenção na foto.', 'R$ 15,99', '12 un.', 'dir'),
 dict(fundo='berry', html=f"""
  <div class="ft" style="left:96px;top:250px;width:888px;height:580px"><img src="{ESP}dica.jpg" style="object-position:50% 22%"></div>
  <div class="blk" style="top:870px"><div class="mao">dica da especialista</div>
  <h2 class="t2" style="color:#fff;margin-top:10px">Misture {mk('*3 tamanhos.*')}</h2>
  <p class="p" style="margin-top:18px">O arco fica natural, com cara de decoradora.</p>
  <div style="margin-top:34px"><span class="pill br">glowbos.com.br</span></div></div>"""),
])
