from motor import IMG, ESP, mk
# Linha C · combinações que nunca erram (as 16 paletas fotografadas na parede)
def grupo(fundo, k, titulo, itens, dica, forma='colunas'):
    n = len(itens)
    def cel(f, nome, h):
        return f"""<div><div style="height:{h}px;border-radius:24px;overflow:hidden;box-shadow:0 14px 34px rgba(29,26,31,.14)"><img src="{IMG}{f}" style="width:100%;height:100%;object-fit:cover"></div>
<div style="font:800 26px/1.15 Inter;margin-top:12px">{nome}</div></div>"""
    if forma == 'destaque':   # 1 grande à esquerda, 2 empilhadas à direita
        grade = f"""<div class="blk" style="top:440px;display:grid;grid-template-columns:1.25fr 1fr;gap:24px">{cel(*itens[0], 640)}
<div style="display:flex;flex-direction:column;gap:24px">{cel(*itens[1], 290)}{cel(*itens[2], 290)}</div></div>"""
    else:
        cols = 2 if n == 4 else 3; h = {3: 560, 4: 290, 6: 250}[n]
        grade = f'<div class="blk" style="top:440px;display:grid;grid-template-columns:repeat({cols},1fr);gap:24px">' + ''.join(cel(f, nm, h) for f, nm in itens) + '</div>'
    return dict(fundo=fundo, html=f"""
  <div class="blk" style="top:270px"><div class="k">{k}</div><h2 class="t2" style="margin-top:14px">{titulo}</h2></div>
  {grade}
  <div class="mao" style="position:absolute;left:96px;right:96px;bottom:225px">{dica}</div>""")
POST = dict(ordem=9, slug='c3_combinacoes', tipo='carrossel', leg="""
Não sabe que cores escolher? Essas combinações nunca erram 🎨

Vivas, de tons vizinhos, pastel e candy, e as cores dos temas que mais saem.
Todas dá pra montar no Monte seu pacote, com a ordem que você quiser.

Qual é a sua? Comenta o nome 👇
👉 glowbos.com.br

#arcodebaloes #paletadecores #festainfantil #festaemcasa #glowbos
""", slides=[
 dict(fundo='creme', html=f"""
  <div class="ft" style="left:96px;top:270px;width:420px;height:480px;transform:rotate(-4deg)"><img src="{IMG}arco_01_vivo_arco-iris.webp"></div>
  <div class="ft" style="left:560px;top:250px;width:420px;height:480px;transform:rotate(3deg)"><img src="{IMG}arco_09_candy_algodao.webp"></div>
  <div class="blk" style="top:830px"><div class="k">16 paletas testadas</div>
  <h1 class="t" style="margin-top:18px">Combinações que<br>{mk('*nunca erram*')}</h1>
  <p class="p" style="margin-top:22px">Arrasta e escolhe a da sua festa.</p></div>"""),
 grupo('pessego', 'cores vivas', f"Pra festa {mk('*animada*')}",
   [('arco_01_vivo_arco-iris.webp', 'Arco-íris'), ('arco_02_vivo_primarias.webp', 'Primárias'), ('arco_03_vivo_joias.webp', 'Joias')], 'combina com festa infantil e personagem', 'destaque'),
 grupo('lilas', 'tons vizinhos', f"Pra quem gosta de {mk('*harmonia*')}",
   [('arco_04_analoga_quente.webp', 'Quente'), ('arco_05_analoga_fria.webp', 'Fria'), ('arco_06_analoga_lilas.webp', 'Lilás')], 'cores lado a lado, o arco fica degradê'),
 grupo('rosa', 'pastel e candy', f"Pra festa {mk('*delicada*')}",
   [('arco_07_pastel_neutro.webp', 'Pastel neutro'), ('arco_08_pastel_bebe.webp', 'Pastel bebê'), ('arco_09_candy_algodao.webp', 'Candy algodão'), ('arco_10_candy_morango.webp', 'Candy morango')], 'chá revelação, batizado, 1 aninho'),
 grupo('creme', 'cores dos temas', f"Pra festa {mk('*temática*')}",
   [('arco_11_tema_homem-aranha.webp', 'Homem-Aranha'), ('arco_12_tema_bob-esponja.webp', 'Bob Esponja'), ('arco_13_tema_moana.webp', 'Moana'), ('arco_14_vermelho_preto_amarelo.webp', 'Vermelho, preto e amarelo'), ('arco_15_preto_e_branco.webp', 'Preto e branco'), ('arco_16_verde_e_branco.webp', 'Verde e branco')], 'as cores do personagem, sem erro'),
 dict(fundo='grafite', html=f"""
  <div class="ftc" style="left:96px;top:260px;width:300px;height:300px"><img src="{ESP}cores.jpg" style="object-position:50% 35%"></div>
  <div class="mao" style="position:absolute;left:430px;top:380px">dica da especialista</div>
  <h2 class="t2 blk" style="top:580px;color:#fff">Uma cor {mk('*manda,*')}<br>uma acompanha,<br>uma {mk('*brilha.*')}</h2>
  <p class="p blk" style="top:900px">Escolheu a paleta? Monta no site com a ordem que você quiser.</p>
  <div class="blk" style="top:1080px"><span class="pill">glowbos.com.br</span></div>"""),
])
