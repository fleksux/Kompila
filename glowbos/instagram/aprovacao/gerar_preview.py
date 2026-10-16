# Preview do Insta da Glowbos: perfil simulado (grade 3:4, caixa grande, Guias, Observações).
# Molde: o preview da Kompila (/Volumes/Dados/KOMPILA/08_INSTAGRAM/aprovacao/gerar_preview.py); CSS, guias e app
# vêm de lá a cada rodada pra não divergir. Post novo = nova linha de 3 no TOPO de POSTS.
# Linha de 3: carrossel | post de marca no meio | carrossel. Postado = travado; export só depois do ok.
import pathlib, html, json, re
BASE = pathlib.Path(__file__).parent
K = pathlib.Path('/Volumes/Dados/KOMPILA/08_INSTAGRAM/aprovacao/gerar_preview.py').read_text()
def bloco(nome):
    m = re.search(nome + r' = r?"""(.*?)"""', K, re.S); return m.group(1)
CSS, ICONES, BODY, APP = bloco('CSS'), bloco('ICONES'), bloco('BODY'), bloco('APP')
CAR = '../carrossel/'
def leg(arq): return html.escape((BASE / CAR / arq).read_text().strip()).replace('\n', '<br>')

V = CAR + '2026-10-16_votacao/export/'
POSTS = [
 dict(id=1, local='São Paulo', leg=leg('2026-10-16_votacao/legenda.txt'),
      slides=[dict(tipo='postado', img=V + f'glowbos_votacao_{i:02d}.jpg') for i in range(1, 13)]),
]

BODY = (BODY.replace('<h2>kompila</h2><b>Kompila</b>', '<h2>glowbosbaloes</h2><b>Glowbos Decoração</b>')
        .replace('IA sob medida pra pequena e média empresa · do bruto ao pronto.', 'Balões e kits de arco · chega hoje em SP e Grande SP · glowbos.com.br'))
APP = APP.replace('<b>kompila</b>', '<b>glowbosbaloes</b>').replace("'kompila_insta_obs'", "'glowbos_insta_obs'")
CSS = CSS.replace('FONTES_CLIENTES', '').replace('background:#0A0B0E url(avatar.png)', 'background:#FBEDF1 url(avatar.png)')
js = 'const P=' + json.dumps(POSTS, ensure_ascii=False) + ';const ICONES=' + json.dumps(ICONES) + ';'
page = ('<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>Insta Glowbos · Aprovação</title>'
        '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">'
        '<style>' + CSS + '</style></head><body>' + BODY + '<script>' + js + APP + '</script></body></html>')
(BASE / 'preview_insta.html').write_text(page)
print('ok', len(POSTS))
