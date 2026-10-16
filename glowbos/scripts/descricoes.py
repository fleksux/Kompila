# Descrições dos produtos da Glowbos (16/10/2026).
# Fonte dos fatos: descrições dos anúncios da Mayara Festas na Shopee (export 16/10) e o que a
# loja já dizia. Nada de duração do balão cheio (não temos o dado).
import json, sys, re

S = sys.argv[1]
prods = {p['id']: p for p in json.load(open(S + '/woo_produtos.json'))}

CM = {5: 'aprox. 13 cm', 8: 'aprox. 20 cm', 9: 'aprox. 25 cm', 12: 'aprox. 30 cm', 16: 'aprox. 40 cm'}

ENTREGA = ('<h3>Entrega</h3><ul>'
           '<li><b>São Paulo e Grande SP:</b> pedido pago até 12h chega no mesmo dia, de motoboy.</li>'
           '<li><b>Outras regiões:</b> pelos Correios (PAC ou SEDEX). O valor e o prazo aparecem no carrinho pelo seu CEP.</li>'
           '</ul>')
TROCA = ('<h3>Troca e garantia</h3><p>Você tem 7 dias pra se arrepender da compra. '
         'Chegou algum balão com defeito? Chama a gente no WhatsApp com uma foto.</p>')
LOJA = ('<p class="gb-d-loja">A Glowbos é a loja própria da Mayara Festas, a mesma loja da Shopee, '
        'com nota 4,9 e mais de 121 mil vendidos.</p>')


def encher(tam):
    t = ', '.join(f'{n}" ({CM[n]})' for n in tam)
    return (f'<h3>Tamanho e como encher</h3><ul><li><b>Tamanho cheio:</b> {t}.</li>'
            '<li><b>Encher:</b> com ar (bomba manual ou elétrica) ou com gás hélio.</li></ul>')


def bloco(intro, vem, tam, extra='', marca=None, reemb=True):
    vem_html = '<h3>O que vem</h3><ul>' + ''.join(f'<li>{v}</li>' for v in vem) + '</ul>'
    mar = ''
    if marca:
        mar = f'<li><b>Marca dos balões:</b> {marca}.</li>'
    emb = ''
    if reemb:
        emb = ('<li><b>Embalagem:</b> montado pela nossa equipe a partir das embalagens originais da marca, '
               'com a quantidade certa de cada cor. Os balões são originais e novos.</li>')
    info = f'<h3>Sobre o produto</h3><ul><li><b>Material:</b> látex.</li>{mar}{emb}</ul>' if (mar or emb) else ''
    return f'<p>{intro}</p>' + vem_html + encher(tam) + extra + info + ENTREGA + TROCA + LOJA


def cachos(n):
    return f'<p><b>Rende:</b> uns {n // 4} cachos de 4 balões, o jeito mais usado pra montar arco e painel.</p>'


out = {}

# Pacotes de 8" com cores à escolha
for pid, n, c in [(32, 50, 2), (34, 75, 3), (36, 100, 4), (46, 125, 5)]:
    out[pid] = dict(
        curta=f'{n} balões de látex de 8 polegadas em até {c} cores escolhidas por você, na ordem do cacho. Chega hoje em SP e Grande SP.',
        desc=bloco(f'Você escolhe até {c} cores na ordem em que elas vão aparecer no cacho, e a gente monta o pacote com {n} balões de 8 polegadas.',
                   [f'{n} balões de látex de 8"', f'Até {c} cores, divididas em partes iguais'], [8], cachos(n), 'Happy Day'))

# Pacotes de 75 com combinação pronta
for pid, cores in [(18, 'azul, vermelho e amarelo'), (20, 'vermelho, preto e amarelo'), (22, 'laranja, marrom e verde'), (24, 'rosa, lilás e azul candy')]:
    out[pid] = dict(
        curta=f'75 balões de látex de 8 polegadas, 25 de cada cor: {cores}. Combinação pronta, chega hoje em SP e Grande SP.',
        desc=bloco(f'Combinação pronta e testada: {cores}. Um dos pacotes que mais vendem na nossa loja da Shopee.',
                   ['75 balões de látex de 8"', f'25 balões de cada cor: {cores}'], [8], cachos(75), 'Happy Day'))

# Candy (tons pastel) com cores à escolha
for pid, n, c in [(78, 50, 2), (79, 75, 3), (80, 100, 4)]:
    out[pid] = dict(
        curta=f'{n} balões candy (tons pastel) de 8 polegadas em até {c} cores à escolha. Chega hoje em SP e Grande SP.',
        desc=bloco(f'Tons pastel, os mais pedidos pra chá de bebê, chá revelação e festa infantil. Você escolhe até {c} cores e a gente monta o pacote com {n} balões.',
                   [f'{n} balões candy de látex de 8"', f'Até {c} cores, divididas em partes iguais'], [8], cachos(n), 'Happy Day'))

# Kits de arco (composição dos anúncios da Shopee)
kits = {
    26: ('Kit arco 60 peças', ['24 balões de 12"', '36 balões de 9"'], [12, 9], False),
    28: ('Kit arco 100 peças desconstruído', ['2 balões de 16"', '6 balões de 12"', '60 balões de 9"', '30 balões de 5"', '1 rolo de fita para arco de 5 m', '1 rolo de adesivo dupla face com 100 pontos'], [16, 12, 9, 5], True),
    57: ('Kit arco 112 peças', ['2 balões de 16"', '8 balões de 12"', '60 balões de 9"', '40 balões de 5"', '1 rolo de fita para arco de 5 m', '1 rolo de adesivo dupla face com 100 pontos'], [16, 12, 9, 5], True),
    59: ('Kit arco 120 peças', ['3 balões de 16"', '12 balões de 12"', '75 balões de 9"', '30 balões de 5"', '1 rolo de fita para arco de 5 m'], [16, 12, 9, 5], True),
}
for pid, (nome, vem, tam, fita) in kits.items():
    monta = ('<h3>Como montar</h3><p>Encha os balões em tamanhos variados, prenda na fita de arco pelos furos e fixe os menores com a dupla face pra preencher os espaços. '
             'O passo a passo está na página <a href="/como-montar/">Como montar seu arco</a>.</p>') if fita else (
             '<h3>Como montar</h3><p>Monte em cachos alternando os tamanhos de 12" e 9". Pra prender na parede, leve junto a '
             '<a href="/produto/fita-para-arco-5-m-dupla-face/">fita para arco com dupla face</a>. O passo a passo está em <a href="/como-montar/">Como montar seu arco</a>.</p>')
    out[pid] = dict(
        curta=f'{nome}: ' + ', '.join(vem) + '. Você escolhe as cores. Chega hoje em SP e Grande SP.',
        desc=bloco('Tudo pra montar em casa um arco de balões igual aos de festa profissional, sem pagar decorador. Você escolhe as cores.',
                   vem, tam, monta, 'Joy (certificada pelo Inmetro)'))

out[55] = dict(
    curta='100 balões de 8 polegadas (2 pacotes fechados de 50) em 2 cores à escolha. O jeito mais barato de montar um arco.',
    desc=bloco('O jeito mais barato de montar um arco: 100 balões do mesmo tamanho, em 2 cores escolhidas por você.',
               ['100 balões de látex de 8"', '2 pacotes fechados de 50 balões, um de cada cor'], [8], cachos(100), 'Happy Day', reemb=False))

out[30] = dict(
    curta='Fita para arco desconstruído de 5 metros com furos e 1 rolo de adesivo dupla face com 100 pontos.',
    desc=('<p>O que segura o arco na parede. A fita tem furos onde os balões entram pelo bico, e os pontos de dupla face prendem os balões menores nos espaços.</p>'
          '<h3>O que vem</h3><ul><li>1 rolo de fita para arco de 5 metros</li><li>1 rolo de adesivo dupla face com 100 pontos</li></ul>'
          + ENTREGA + TROCA + LOJA))

# Pacotes por tamanho (Joy)
for pid, n, pol, uso in [(49, 50, 5, 'O tamanho que preenche os espaços do arco e dá o acabamento.'),
                         (51, 50, 9, 'A base do arco desconstruído.'),
                         (61, 25, 12, 'O tamanho principal do arco desconstruído.'),
                         (53, 12, 16, 'Os grandes que dão volume ao arco.')]:
    out[pid] = dict(
        curta=f'{n} balões Joy de {pol} polegadas ({CM[pol]}), cores à escolha. {uso}',
        desc=bloco(f'{uso} Linha profissional da Joy, formato redondo.', [f'{n} balões de látex de {pol}"', 'Cores à escolha'], [pol], '', 'Joy'))

out[81] = dict(
    curta='25 balões metalizados de 5 polegadas, cores à escolha. O brilho que dá acabamento de festa profissional ao arco.',
    desc=bloco('O brilho que dá acabamento de festa profissional ao arco: espalhe entre os balões foscos.', ['25 balões metalizados de 5"', 'Cores à escolha'], [5], '', 'Happy Day'))

# Pacotes de 25 de 8" cor única (embalagem Glowbos)
for pid, p in prods.items():
    m = re.match(r'Pacote 25 balões 8" · (.+)', p['nome'])
    if m:
        cor = m.group(1)
        out[pid] = dict(
            curta=f'25 balões de látex de 8 polegadas (20 cm), todos na cor {cor.lower()}, na embalagem Glowbos.',
            desc=bloco(f'Pacote fechado com 25 balões de 8 polegadas, todos na cor {cor.lower()}. Pra completar a paleta da festa ou repor uma cor.',
                       [f'25 balões de látex de 8" na cor {cor.lower()}'], [8], cachos(25), None, reemb=False))

for k, v in out.items():
    assert '—' not in v['desc'] + v['curta'] and '–' not in v['desc'] + v['curta'], k
json.dump({str(k): v for k, v in out.items()}, open(S + '/descricoes.json', 'w'), ensure_ascii=False)
print(len(out), 'produtos;', 'faltam:', sorted(set(prods) - set(out)))
