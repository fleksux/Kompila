#!/usr/bin/env python3
"""Copia o menu e o rodapé únicos (partes/menu.html e partes/rodape.html) pra todas as páginas do site.

Criado em 03/10/2026 (diagnóstico item 16): antes, menu e rodapé estavam copiados à mão em 9 páginas.
Uso: python3 scripts/montar_site.py          -> monta
     python3 scripts/montar_site.py --checar -> só confere (sai com erro se alguma página estiver diferente)
Depois de montar: commit, push e rsync pro 03_SITE (ver CLAUDE.md).
"""
import re
import sys
from pathlib import Path

RAIZ_REPO = Path(__file__).resolve().parent.parent
# página -> (R = caminho até a raiz, RAIZ = link da home)
PAGINAS = {
    'index.html': ('', './'),
    'trabalhos/index.html': ('../', '../'),
    'chatbot/index.html': ('../', '../'),
    'crm/index.html': ('../', '../'),
    'loja/index.html': ('../', '../'),
    'design/index.html': ('../', '../'),
    'trafego/index.html': ('../', '../'),
    'blog/index.html': ('../', '../'),
    'privacidade/index.html': ('../', '../'),
}
PARTES = {'menu': 'partes/menu.html', 'rodape': 'partes/rodape.html'}


def parte(nome: str, r: str, raiz: str) -> str:
    txt = (RAIZ_REPO / PARTES[nome]).read_text()
    txt = re.sub(r'^<!--.*?-->\n', '', txt, count=1, flags=re.S)   # tira o comentário de instrução do topo
    return f'<!-- partes:{nome} (não edite aqui: partes/{nome}.html + scripts/montar_site.py) -->\n' + txt.replace('{{RAIZ}}', raiz).replace('{{R}}', r).rstrip() + f'\n<!-- /partes:{nome} -->'


def montar(html: str, nome: str, bloco: str) -> str:
    marcado = re.compile(rf'<!-- partes:{nome} .*?<!-- /partes:{nome} -->', re.S)
    if marcado.search(html):
        return marcado.sub(lambda _: bloco, html, count=1)
    # primeira vez: troca o bloco que já existe na página
    alvos = [r'<header class="kr-nav">.*?</header>', r'<header class="nav">.*?</header>'] if nome == 'menu' \
        else [r'<footer class="kr-foot">.*?</footer>', r'<footer>.*?</footer>']
    for a in alvos:
        if re.search(a, html, re.S):
            return re.sub(a, lambda _: bloco, html, count=1, flags=re.S)
    raise SystemExit(f'não achei onde pôr o {nome}')


def garantir_regua(html: str, r: str) -> str:
    link = f'<link rel="stylesheet" href="{r}css/regua.css">'
    return html if 'css/regua.css' in html else html.replace('</head>', link + '\n</head>', 1)


def main() -> None:
    checar = '--checar' in sys.argv
    diferentes = []
    for pagina, (r, raiz) in PAGINAS.items():
        caminho = RAIZ_REPO / pagina
        antes = caminho.read_text()
        depois = garantir_regua(antes, r)
        for nome in PARTES:
            depois = montar(depois, nome, parte(nome, r, raiz))
        if depois != antes:
            diferentes.append(pagina)
            if not checar:
                caminho.write_text(depois)
    if checar and diferentes:
        raise SystemExit('menu/rodapé desatualizado em: ' + ', '.join(diferentes) + ' (rode python3 scripts/montar_site.py)')
    print(('conferido' if checar else 'montado') + f': {len(PAGINAS)} páginas' + (f', {len(diferentes)} mudaram' if diferentes else ', nada mudou'))


if __name__ == '__main__':
    main()
