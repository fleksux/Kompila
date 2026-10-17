from motor import IMG, ESP, mk
# Linha D · coluna com número metalizado gigante de 0 a 9, sob encomenda (orçamento como os sets)
CORES = [('rose', 'Rosê'), ('ouro', 'Dourado'), ('lilas', 'Lilás'), ('azul', 'Azul')]
grade = ''.join(f'<div class="nq"><img src="{IMG}num_{CORES[i % 4][0]}_{i}.webp"><b>{i}</b></div>' for i in range(10))
cols = ''.join(f'<div class="nc"><div class="ft" style="position:relative;width:100%;height:520px"><img src="{IMG}num_{c}_{n}.webp"></div><span>{nome}</span></div>'
               for (c, nome), n in zip(CORES, [1, 2, 7, 4]))
css = """
.nq{position:relative;height:280px;border-radius:22px;overflow:hidden;background:#fff}
.nq img{width:100%;height:100%;object-fit:cover;object-position:50% 12%}
.nq b{position:absolute;left:12px;top:10px;width:48px;height:48px;border-radius:50%;background:var(--pink);color:#fff;display:grid;place-items:center;font:800 26px 'Bricolage Grotesque'}
.nc span{display:block;margin-top:16px;font:800 30px Inter;text-align:center}
"""
POST = dict(ordem=12, slug='d3_numeros', tipo='carrossel', css=css, leg="""
Qual é a idade? 🎂 O número gigante vem de 0 a 9, em 4 cores: rosê, dourado, lilás e azul.

É a coluna com o número metalizado em cima de uma base de balões nas cores da festa.
Sob encomenda: escolhe o número e a cor no site, conta a data e o CEP, e a gente manda o orçamento no WhatsApp.

Salva pra lembrar no próximo aniversário 💗
glowbos.com.br

#festainfantil #aniversario #baloes #numerometalizado #glowbos
""", slides=[
 dict(fundo='grafite', html=f"""
  <div class="blk" style="top:260px"><div class="k">de 0 a 9</div><h1 class="t" style="color:#fff;margin-top:16px">Qual é a {mk('*idade?*')}</h1></div>
  <div class="blk" style="top:470px;display:grid;grid-template-columns:repeat(5,1fr);gap:14px">{grade}</div>
  <div class="blk" style="top:1110px"><p class="p">Número gigante metalizado em cima de uma base de balões.</p></div>"""),
 dict(fundo='creme', html=f"""
  <div class="blk" style="top:270px"><div class="k">4 cores</div><h2 class="t2" style="margin-top:16px">Escolhe a cor {mk('*do número*')}</h2></div>
  <div class="blk" style="top:480px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px">{cols}</div>
  <div class="blk" style="top:1120px"><p class="p">A base vem nas cores que combinam com o número.</p></div>"""),
 dict(fundo='rosa', html=f"""
  <div class="ft" style="left:96px;top:250px;width:888px;height:790px"><img src="{IMG}num_rose_5.webp" style="object-position:50% 30%"></div>
  <div class="blk" style="top:1070px"><div class="mao">rosê, número 5</div><h2 class="t3" style="margin-top:8px">Base rosada {mk('*com florzinha*')}</h2></div>"""),
 dict(fundo='lilas', html=f"""
  <div class="pol" style="left:110px;top:280px;width:420px;height:620px;transform:rotate(-4deg)"><img src="{IMG}numero_3_ouro.webp"><i>dourado · 3</i></div>
  <div class="pol" style="left:550px;top:370px;width:420px;height:620px;transform:rotate(5deg)"><img src="{IMG}numero_7_lilas.webp"><i>lilás · 7</i></div>
  <div class="blk" style="top:1080px"><h2 class="t2" style="font-size:58px">Combina com {mk('*qualquer tema*')}</h2></div>"""),
 dict(fundo='pessegof', html=f"""
  <div class="ftc" style="right:96px;top:250px;width:340px;height:340px"><img src="{IMG}premium_2_numero.webp" style="object-position:50% 25%"></div>
  <div class="blk" style="top:300px;right:480px"><div class="k">como pedir</div><h2 class="t2" style="margin-top:16px">Sob {mk('*encomenda*')}</h2></div>
  <div class="cartao" style="left:96px;right:96px;top:650px"><ul class="lista">
   <li><span class="num">1</span><div>Escolhe <b>o número e a cor</b> no site</div></li>
   <li><span class="num">2</span><div>Conta a <b>data da festa</b> e o <b>CEP</b></div></li>
   <li><span class="num">3</span><div>O orçamento chega no <b>WhatsApp</b></div></li></ul></div>
  <div class="blk" style="top:1100px"><span class="pill">glowbos.com.br</span></div>"""),
])
