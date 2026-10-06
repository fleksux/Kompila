#!/usr/bin/env python3
"""Gera as páginas do blog "<segmento> na era da IA" a partir dos guias (05/10/2026).

Pedido do Alex: "cada um desses PDFs vai virar uma página do blog, SEO e GEO no hard" e
"dicas de verdade, coisas que vão ser vistas por outras pessoas".
Fonte do conteúdo: os dados dos guias feitos pela outra sessão (um .py por segmento, com dado e fonte).
Saída: blog/<slug>/index.html, blog/img/<seg>-*.webp, blog/pdf/<slug>.pdf, o bloco de guias no blog/index.html,
o sitemap e o llms.txt. Depois: python3 scripts/montar_site.py (menu e rodapé), commit, push e rsync (CLAUDE.md).
Uso: python3 scripts/gerar_blog_guias.py
"""
import html, importlib.util, json, re, subprocess
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
GUIAS = Path('/Volumes/Dados/KOMPILA/01_INTELIGENCIA/APRESENTACOES/na_era_da_ia_segmentos_2026-10-05')
SITE = 'https://kompila.com.br'
DATA = '2026-10-05'
AUTOR = 'Alexsandro Reges'
CONSULTOR = 'https://wa.me/5511967342512?text=Ol%C3%A1%2C%20vim%20pelo%20site%20Kompila'
# ordem do índice: os de maior volume na base de captação primeiro
SEGS = ['barbearia', 'studio', 'clinica', 'restaurante', 'loja', 'roupas', 'oficina', 'imobiliaria', 'contabilidade', 'academia', 'ecommerce']
e = html.escape


def carregar(seg):
    spec = importlib.util.spec_from_file_location(seg, GUIAS / 'dados' / f'{seg}.py')
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m.D


def limpo(s):  # texto puro (SEO, JSON-LD): sem ** e com hífen normal
    return re.sub(r'\*\*', '', s).replace('‑', '-')


def mk(s):  # **x** do guia vira destaque
    return re.sub(r'\*\*(.+?)\*\*', r'<em>\1</em>', e(s.replace('‑', '-')))


def slug(seg):
    return f'{seg}-na-era-da-ia'


def nome(D):
    return limpo(D['nome_curto'])


def artigo_de(D):  # "numa barbearia" / "num restaurante"
    return limpo(D['de_seg']).replace('da ', 'numa ', 1).replace('do ', 'num ', 1)


def imagens(seg):
    out = RAIZ / 'blog' / 'img'; out.mkdir(parents=True, exist_ok=True)
    for tipo in ('capa', 'dentro'):
        dst = out / f'{seg}-{tipo}.webp'
        if not dst.exists():
            subprocess.run(['cwebp', '-quiet', '-q', '80', '-resize', '1600', '0', str(GUIAS / 'img' / f'{seg}_{tipo}_cinematic.png'), '-o', str(dst)], check=True)
    pdf = RAIZ / 'blog' / 'pdf'; pdf.mkdir(exist_ok=True)
    # comprimido (o original tem ~6 MB; o do site fica com ~600 KB)
    subprocess.run(['gs', '-q', '-sDEVICE=pdfwrite', '-dPDFSETTINGS=/ebook', '-dNOPAUSE', '-dBATCH', f'-sOutputFile={pdf / (slug(seg) + ".pdf")}', str(GUIAS / f'PDF_{seg}_na_era_da_ia_2026-10-05.pdf')], check=True)


def faq(D):
    n = nome(D).lower()
    um = 'uma' if limpo(D['de_seg']).startswith('da ') else 'um'
    return [
        (f'O que a IA já consegue fazer {artigo_de(D)}?',
         f'Hoje já dá pra deixar rodando sozinho: ' + '; '.join(limpo(c[0]).lower() for c in D['coisas']) + '. Tudo ligado aos sistemas que o negócio já usa.'),
        (f'A IA vai substituir funcionário {artigo_de(D)}?',
         limpo(D['verdade']) + ' Falar disso com honestidade é melhor do que fingir que não vai acontecer.'),
        ('Preciso trocar os sistemas que eu já uso?',
         'Não. ' + limpo(D['sistemas_dor']) + ' A ideia é ligar o que já existe, não trocar. ' + limpo(D['sistemas_fonte'])),
        (f'Por onde começar a usar IA {artigo_de(D)}?',
         f'Pela tarefa que mais toma tempo e se repete todo dia. Na maioria dos casos é a primeira da lista: {limpo(D["coisas"][0][0]).lower()}. Uma tarefa rodando sozinha já mostra, em número, quanto tempo volta.'),
        (f'Quanto custa colocar IA {um == "uma" and "na minha " + n or "no meu " + n}?',
         'Depende do que é montado pro negócio. Na Kompila, o escopo é escrito antes, com data, e a operação fica com a gente no mensal: você não precisa aprender ferramenta nem contratar ninguém.'),
        ('De onde vêm os números deste guia?',
         'De pesquisas públicas, com o link de cada uma no fim da página: ' + limpo(D['realidade_fonte']).replace('Fontes: ', '')),
    ]


def pagina(seg, D, todos):
    n = nome(D); url = f'{SITE}/blog/{slug(seg)}/'
    titulo = f'{n} na era da IA: 10 coisas que já rodam sozinhas'
    seo_t = f'{titulo} | Kompila'
    desc = f'Guia prático pro dono: o que a IA já faz {artigo_de(D)}, ligando os sistemas que você já usa. 10 dicas reais, com dados do Sebrae e fonte.'
    img = f'{SITE}/blog/img/{seg}-capa.webp'
    perguntas = faq(D)
    resposta_curta = (f'{limpo(D["capa_sub"])} As 10: ' + '; '.join(limpo(c[0]) for c in D['coisas']) + '.')
    ld = [
        {'@context': 'https://schema.org', '@type': 'Article', 'headline': titulo, 'description': desc, 'image': [img, f'{SITE}/blog/img/{seg}-dentro.webp'],
         'datePublished': DATA, 'dateModified': DATA, 'inLanguage': 'pt-BR', 'mainEntityOfPage': url,
         'author': {'@type': 'Person', 'name': AUTOR, 'url': f'{SITE}/', 'worksFor': {'@type': 'Organization', 'name': 'Kompila'}},
         'publisher': {'@type': 'Organization', 'name': 'Kompila', 'url': f'{SITE}/', 'logo': {'@type': 'ImageObject', 'url': f'{SITE}/favicon.ico'}},
         'about': [f'Inteligência artificial para {n.lower()}', 'Automação de atendimento no WhatsApp', 'Pequenos negócios'],
         'citation': [u for _, u in D['fontes']]},
        {'@context': 'https://schema.org', '@type': 'ItemList', 'name': f'10 coisas que a IA já faz {artigo_de(D)}',
         'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': limpo(c[0]), 'description': limpo(c[2])} for i, c in enumerate(D['coisas'])]},
        {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in perguntas]},
        {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Kompila', 'item': f'{SITE}/'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': f'{SITE}/blog/'},
            {'@type': 'ListItem', 'position': 3, 'name': f'{n} na era da IA', 'item': url}]},
    ]
    stats = ''.join(f'<div class="bg-stat rv"><b>{e(a)}</b><span>{e(b)}</span><small>{e(c)}</small></div>' for a, b, c in D['realidade'])
    chips = ''.join(f'<span class="bg-chip">{e(a)} <small>{e(b)}</small></span>' for a, b in D['sistemas'])
    blocos = ''
    for k in range(5):
        cab = D['blocos'][k] or 'Pra começar: o básico que já tira trabalho.'
        itens = ''
        for j, (t, dor, como, puxa) in enumerate(D['coisas'][k * 2:k * 2 + 2]):
            i = k * 2 + j + 1
            itens += (f'<article class="bg-item rv" id="dica-{i}"><span class="bg-n">{i:02d}</span><div><h3>{mk(t)}</h3><p>{mk(como)}</p>'
                      + (f'<p class="bg-dor">{mk(dor)}</p>' if dor else '')
                      + f'<p class="bg-liga">Liga: {" · ".join(e(x) for x in puxa)}</p></div></article>')
        blocos += f'<div class="bg-bloco"><h3 class="bg-bh rv">{mk(cab)}</h3>{itens}</div>'
    outros = ''.join(f'<a class="bg-outro rv" href="../{slug(s)}/"><img src="../img/{s}-capa.webp" alt="{e(nome(d))} na era da IA" loading="lazy" width="400" height="225"><span>{e(nome(d))} na era da IA</span></a>'
                     for s, d in todos if s != seg)
    fontes = ''.join(f'<li><a href="{e(u)}" target="_blank" rel="noopener">{e(t)}</a></li>' for t, u in D['fontes'])
    faqs = ''.join(f'<details{" open" if i == 0 else ""}><summary>{e(q)}</summary><p>{e(a)}</p></details>' for i, (q, a) in enumerate(perguntas))
    sumario = ''.join(f'<li><a href="#dica-{i + 1}">{mk(c[0])}</a></li>' for i, c in enumerate(D['coisas']))
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(seo_t)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta name="author" content="{AUTOR}">
<meta property="og:type" content="article">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Kompila">
<meta property="og:title" content="{e(titulo)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{img}">
<meta property="article:published_time" content="{DATA}">
<meta property="article:modified_time" content="{DATA}">
<meta property="article:author" content="{AUTOR}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../../favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../css/regua.css">
<link rel="stylesheet" href="../../css/blog.css">
<link rel="preload" as="image" href="../img/{seg}-capa.webp">
{''.join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in ld)}
<script src="https://crm.kompila.com.br/liz.js" data-chave="kmp_kompila" defer></script>
<script src="https://crm.kompila.com.br/acessos.js" data-chave="kmp_kompila" defer></script>
<script src="/js/pixel.js" defer></script>
<script src="/js/anima.js" defer></script>
</head>
<body class="kr bg-pag">
<!-- partes:menu -->
<!-- /partes:menu -->
<main>
<header class="bg-topo"><div class="bg-box bg-hero">
  <div class="bg-htxt">
    <nav class="bg-trilha" aria-label="Você está em"><a href="../../">Kompila</a> / <a href="../">Blog</a> / <span>{e(n)}</span></nav>
    <p class="bg-rot">Guia pro dono · {e(n)}</p>
    <h1>{mk(D["titulo"])}</h1>
    <p class="bg-lead">{mk(D["capa_sub"])}</p>
    <p class="bg-meta">Por <b>{AUTOR}</b>, Kompila · <time datetime="{DATA}">5 de outubro de 2026</time> · 8 min de leitura</p>
  </div>
  <div class="bg-hfoto"><img src="../img/{seg}-capa.webp" alt="{e(n)} na era da IA: o dono trabalhando enquanto a IA cuida do resto" width="1600" height="900" fetchpriority="high"></div>
</div></header>

<div class="bg-box bg-corpo">
<article class="bg-texto">
  <section class="bg-curta rv" aria-label="Resposta curta">
    <p class="bg-rot">Resposta curta</p>
    <p>{e(resposta_curta)}</p>
  </section>

  <h2>A verdade antes de tudo</h2>
  <p class="bg-forte">A IA vai ocupar cargos. Vai ter demissão. É melhor você saber antes do seu concorrente.</p>
  <p>{mk(D["verdade"])}</p>
  <div class="bg-dupla rv"><div><b>52%</b><span>dos pequenos negócios do Brasil já usaram IA nas duas semanas antes da pesquisa. Nos EUA foram 21%.</span></div><div><b>38%</b><span>dos que não usam dizem que não sabem o que a IA faz. Não é falta de vontade: é falta de alguém mostrar.</span></div></div>
  <p class="bg-fonte">Fonte: Sebrae com Meta, Transformação Digital nos Pequenos Negócios (ago/2026).</p>

  <h2>{mk(D["realidade_titulo"])}</h2>
  <div class="bg-stats">{stats}</div>
  <p class="bg-fonte">{e(D["realidade_fonte"])}</p>

  <h2>{mk(D["sistemas_titulo"])}</h2>
  <div class="bg-chips rv">{chips}</div>
  <p class="bg-forte">{mk(D["sistemas_dor"])}</p>
  <p class="bg-fonte">{e(D["sistemas_fonte"])}</p>

  <h2 id="as-10">As 10 coisas que eu deixaria rodando sozinhas</h2>
  <nav class="bg-sumario rv" aria-label="As 10 coisas"><ol>{sumario}</ol></nav>
  <figure class="bg-fig rv"><img src="../img/{seg}-dentro.webp" alt="Dia a dia {e(limpo(D['de_seg']))}, com a IA ligada aos sistemas" width="1600" height="900" loading="lazy"></figure>
  {blocos}

  <h2>{mk(D["dono_titulo"])}</h2>
  <p>{mk(D["dono_sub"])}</p>
  <div class="bg-zap rv"><div class="bg-zhd"><i>[k]</i><div>Resumo do dia<small>assistente {e(limpo(D["de_seg"]))}</small></div></div><div class="bg-bolha">{D["zap"]}<span>{e(D["zap_hora"])}</span></div></div>
  <p class="bg-fonte">Exemplo de mensagem, valores ilustrativos.</p>

  <section class="bg-kompila rv">
    <p class="bg-rot">Quem escreveu</p>
    <h2>A Kompila funciona exatamente assim.</h2>
    <p>Somos uma empresa de implementação de IA pra pequena e média empresa. A própria Kompila roda desse jeito: o dono e a IA, sem funcionário, cuidando de atendimento, vendas, financeiro e conteúdo. A gente monta, liga nos sistemas que você já usa e opera todo mês por você.</p>
    <div class="bg-ctas"><a class="bg-btn" data-liz href="#liz">Conversar com a Liz</a><a class="bg-btn bg-ghost" href="{CONSULTOR}" target="_blank" rel="noopener">Falar com um consultor</a><a class="bg-link" href="../../guia/{seg}/?utm_source=blog&utm_medium=artigo&utm_campaign=guia_ia_{seg}">Receber o guia em PDF</a></div>
  </section>

  <h2>Perguntas frequentes</h2>
  <div class="bg-faq">{faqs}</div>

  <h2>Fontes</h2>
  <ol class="bg-fontes">{fontes}</ol>
</article>
</div>

<section class="bg-outros"><div class="bg-box"><h2>Outros guias da série</h2><div class="bg-ogrid">{outros}</div></div></section>
</main>
<!-- partes:rodape -->
<!-- /partes:rodape -->
</body>
</html>
'''


def indice(todos):
    # GRID EDITORIAL (Alex 06/10: "não dá pra fazer um grid no blog mais criativo?"): mosaico em 6 colunas com peças de tamanhos
    # diferentes (destaque, alta, número, foto, larga, faixa) e um fecho; o número de cada ramo vem de scripts/guia_captura.json.
    import json as _j
    nums = _j.loads((RAIZ / 'scripts' / 'guia_captura.json').read_text(encoding='utf-8'))
    tipos = ['hero', 'alto', 'num', 'foto', 'foto', 'largo', 'largo', 'alto', 'faixa', 'num', 'foto']
    cards = ''
    for i, (s, d) in enumerate(todos):
        t = tipos[i % len(tipos)]; n = nums.get(s, {})
        tit = f'{e(nome(d))} na era da IA'; sub = f'10 coisas que já rodam sozinhas {e(artigo_de(d))}'
        if t == 'num':
            cards += (f'<a class="bg-t bg-t-num rv" href="{slug(s)}/"><span class="bg-rot">Guia · {e(nome(d))}</span>'
                      f'<strong><i>[</i> {e(n.get("num", ""))} <i>]</i></strong><p>{e(n.get("num_frase", ""))}</p><b>{tit} →</b></a>')
        elif t == 'largo':
            cards += (f'<a class="bg-t bg-t-largo rv" href="{slug(s)}/"><img src="img/{s}-dentro.webp" alt="{tit}" loading="lazy">'
                      f'<span class="bg-txt"><span class="bg-rot">Guia · {e(nome(d))}</span><b>{tit}</b><small>{sub}</small><em>Ler o guia →</em></span></a>')
        else:
            img = 'capa' if t in ('hero', 'alto') else 'dentro'
            cards += (f'<a class="bg-t bg-t-{t} rv" href="{slug(s)}/"><img src="img/{s}-{img}.webp" alt="{tit}" loading="lazy">'
                      f'<span class="bg-sobre"><span class="bg-rot">Guia · {e(nome(d))}</span><b>{tit}</b>{f"<small>{sub}</small>" if t in ("hero", "faixa") else ""}</span></a>')
    fecho = ('<div class="bg-t bg-t-cta rv"><div><span class="bg-rot">Não achou o seu ramo?</span><b>A Liz monta a lista do seu negócio com você.</b></div>'
              '<a class="bg-btn" data-liz href="#liz">Conversar com a Liz</a></div>')
    return f'<!-- guias:inicio (gerado por scripts/gerar_blog_guias.py) -->\n<section class="bg-guias" id="guias"><div class="shell"><div class="dhead rv"><h1>O que eu faria se tivesse um negócio <em>na era da IA.</em></h1><p class="lead">Um guia por ramo, com 10 coisas que já dá pra deixar rodando sozinhas. Dados do Sebrae, com a fonte ao lado.</p></div><div class="bg-mosaico">{cards}</div>{fecho}</div></section>\n<!-- guias:fim -->'


def main():
    todos = [(s, carregar(s)) for s in SEGS]
    for s, D in todos:
        imagens(s)
        d = RAIZ / 'blog' / slug(s); d.mkdir(parents=True, exist_ok=True)
        (d / 'index.html').write_text(pagina(s, D, todos))
    # índice do blog
    ix = RAIZ / 'blog' / 'index.html'; h = ix.read_text(); bloco = indice(todos)
    if '<!-- guias:inicio' in h:
        h = re.sub(r'<!-- guias:inicio.*?<!-- guias:fim -->', lambda _: bloco, h, flags=re.S)
    else:
        h = h.replace('<section class="cases posts">', bloco + '\n\n<section class="cases posts">', 1)
    if 'css/blog.css' not in h:
        h = h.replace('</head>', '<link rel="stylesheet" href="../css/blog.css">\n</head>', 1)
    ix.write_text(h)
    # sitemap
    sm = RAIZ / 'sitemap.xml'; t = sm.read_text()
    t = re.sub(r'\s*<url><loc>https://kompila.com.br/blog/[^<]+-na-era-da-ia/</loc>.*?</url>', '', t)
    novas = ''.join(f'\n  <url><loc>{SITE}/blog/{slug(s)}/</loc><lastmod>{DATA}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>' for s, _ in todos)
    t = t.replace('</urlset>', novas.lstrip('\n') and novas + '\n</urlset>')
    sm.write_text(re.sub(r'\n\n+', '\n', t))
    # llms.txt
    ll = RAIZ / 'llms.txt'; t = ll.read_text()
    t = re.sub(r'\n## Guias: .*', '', t, flags=re.S)
    t = t.rstrip() + '\n\n## Guias: o que a IA já faz em cada tipo de negócio\n' + ''.join(
        f'- {nome(d)} na era da IA: 10 coisas que já rodam sozinhas {artigo_de(d)}, com dados do Sebrae e fonte. {SITE}/blog/{slug(s)}/\n' for s, d in todos)
    ll.write_text(t)
    # páginas novas no montar_site
    ms = RAIZ / 'scripts' / 'montar_site.py'; t = ms.read_text()
    falta = [s for s, _ in todos if f"'blog/{slug(s)}/index.html'" not in t]
    if falta:
        t = t.replace("    'blog/index.html': ('../', '../'),", "    'blog/index.html': ('../', '../'),\n" + ''.join(f"    'blog/{slug(s)}/index.html': ('../../', '../../'),\n" for s in falta).rstrip('\n'), 1)
        ms.write_text(t)
    print('ok:', len(todos), 'guias')


if __name__ == '__main__':
    main()
