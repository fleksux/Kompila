from motor import IMG, ESP, mk
# Linha E · público: festa com tema de personagem · as cores certas (sem nome de personagem como produto)
HEX = dict(vermelho='#D7263D', azul='#2B5BD7', preto='#1d1a1f', amarelo='#F7C531', turquesa='#22A6A1', coral='#F2786B',
           bege='#E6D3B3', verde='#2E9E4F', branco='#ffffff', laranja='#F58A1F', roxo='#7B3FB8')
def chips(*cs):
    return '<div style="display:flex;gap:12px;margin-top:16px">' + ''.join(
        f'<span style="width:54px;height:54px;border-radius:50%;background:{HEX[c]};border:4px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.15)"></span>' for c in cs) + '</div>'
def par(a, la, ca, b, lb, cb):
    return f"""
  <div class="ft" style="left:96px;top:190px;width:430px;height:640px"><img src="{IMG}{a}"></div>
  <div class="ft" style="left:554px;top:190px;width:430px;height:640px"><img src="{IMG}{b}"></div>
  <div style="position:absolute;left:96px;width:430px;top:870px"><h3 class="t3" style="font-size:38px">{la}</h3>{chips(*ca)}</div>
  <div style="position:absolute;left:554px;width:430px;top:870px"><h3 class="t3" style="font-size:38px">{lb}</h3>{chips(*cb)}</div>"""
css = ".g4{position:absolute;left:96px;right:96px;display:grid;grid-template-columns:1fr 1fr;gap:16px}.g4 div{height:330px;border-radius:24px;overflow:hidden}.g4 img{width:100%;height:100%;object-fit:cover}"
POST = dict(ordem=15, slug='e3_cores_do_tema', tipo='carrossel', css=css, leg="""
O tema já tá escolhido? Agora é só acertar as cores 🎨

Super-herói: vermelho, azul e preto
Ratinho clássico: vermelho, preto e amarelo
Fundo do mar: amarelo, turquesa e vermelho
Praia e ilha: turquesa, coral e bege
Futebol: verde, branco e preto
Halloween: laranja, preto e roxo

No pacote de 75 balões você escolhe até 3 cores (R$ 25,99). Quer 4 cores? Vai no de 100 (R$ 32,99).

Qual é o tema da próxima festa aí? Comenta que a especialista te diz as cores 👇
glowbos.com.br

#festainfantil #festatematica #arcodebaloes #baloes #glowbos
""", slides=[
 dict(fundo='creme', html=f"""
  <div class="blk" style="top:190px"><div class="k">festa com tema</div><h1 class="t" style="margin-top:16px;font-size:84px">As cores certas {mk('*do tema*')}</h1></div>
  <div class="g4" style="top:500px"><div><img src="{IMG}arco_11_tema_homem-aranha.webp"></div><div><img src="{IMG}arco_14_vermelho_preto_amarelo.webp"></div>
  <div><img src="{IMG}arco_12_tema_bob-esponja.webp"></div><div><img src="{IMG}arco_13_tema_moana.webp"></div></div>"""),
 dict(fundo='bebe', html=par('arco_11_tema_homem-aranha.webp', 'Super-herói', ('vermelho', 'azul', 'preto'),
                              'arco_14_vermelho_preto_amarelo.webp', 'Ratinho clássico', ('vermelho', 'preto', 'amarelo'))
      + f'<div class="blk" style="top:1150px"><p class="p">Três cores e a foto já conta qual é o tema.</p></div>'),
 dict(fundo='pessego', html=par('arco_12_tema_bob-esponja.webp', 'Fundo do mar', ('amarelo', 'turquesa', 'vermelho'),
                                'arco_13_tema_moana.webp', 'Praia e ilha', ('turquesa', 'coral', 'bege'))),
 dict(fundo='lilas', html=f"""
  <div class="ft" style="left:96px;top:190px;width:888px;height:800px"><img src="{IMG}premium_5_futebol.webp" style="object-position:50% 40%"></div>
  <div class="blk" style="top:1030px;display:flex;justify-content:space-between;align-items:flex-end;gap:20px"><div><div class="mao">futebol</div><h2 class="t3">Verde, branco e preto</h2></div>{chips('verde', 'branco', 'preto')}</div>"""),
 dict(fundo='grafite', html=f"""
  <div class="full"><img src="{IMG}hero_halloween_1.webp" style="object-position:50% 30%"></div><div class="vel"></div>
  <div class="blk" style="bottom:190px"><div class="k" style="color:#FFC2A1">31 de outubro</div><h2 class="t2" style="color:#fff;margin-top:14px">Halloween: {mk('*laranja, preto e roxo*')}</h2>{chips('laranja', 'preto', 'roxo')}</div>"""),
 dict(fundo='rosa', html=f"""
  <div class="ftc" style="left:96px;top:200px;width:300px;height:300px"><img src="{ESP}cores.jpg" style="object-position:50% 25%"></div>
  <div class="mao" style="position:absolute;left:430px;top:300px">dica da especialista</div>
  <div class="bolha" style="left:96px;right:96px;top:560px;font-size:38px">Escolhe as cores no <b>pacote de 75 balões</b>: até 3 cores e você monta a sequência.</div>
  <div class="blk" style="top:880px"><div class="preco"><small>pacote 75 balões</small>R$ 25,99</div><p class="p" style="margin-top:10px">4 cores? O de 100 balões sai R$ 32,99.</p>
  <div style="margin-top:40px"><span class="pill">glowbos.com.br</span></div></div>"""),
])
