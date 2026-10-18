#!/usr/bin/env python3
"""Publica a pasta publicar/ na @glowbosbaloes pela API (token da Página Glowbos em ~/.config/kompila/meta_ig.env).
Ordem: do 20 ao 01, pra o 01 ficar no topo do perfil. Registra o que já subiu em publicados.txt e pula na próxima rodada."""
import json, os, time, urllib.error, urllib.parse, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
PASTA = os.path.join(AQUI, 'publicar')
URL = 'https://glowbos.com.br/wp-content/uploads/ig/feed'
REG = os.path.join(AQUI, 'publicados.txt')
env = dict(l.strip().split('=', 1) for l in open(os.path.expanduser('~/.config/kompila/meta_ig.env')) if '=' in l and not l.startswith('#'))
TOK, IG = env['GLOWBOS_PAGE_TOKEN'].strip('"\''), env['GLOWBOS_IG_USER_ID'].strip('"\'')
API = 'https://graph.facebook.com/v21.0/'


def post(caminho, dados):
    dados['access_token'] = TOK
    req = urllib.request.Request(API + caminho, data=urllib.parse.urlencode(dados).encode())
    try:
        return json.load(urllib.request.urlopen(req, timeout=180))
    except urllib.error.HTTPError as e:
        return json.load(e)


def esperar(cid, limite=600):
    t = time.time()
    while time.time() - t < limite:
        r = json.load(urllib.request.urlopen(f'{API}{cid}?fields=status_code,status&access_token={TOK}', timeout=60))
        if r.get('status_code') == 'FINISHED':
            return True
        if r.get('status_code') == 'ERROR':
            print('  erro no processamento:', r)
            return False
        time.sleep(5)
    return False


feito = set(open(REG).read().split()) if os.path.exists(REG) else set()
for nome in sorted(os.listdir(PASTA), reverse=True):
    if nome in feito or not os.path.isdir(os.path.join(PASTA, nome)):
        continue
    d = os.path.join(PASTA, nome)
    leg = open(os.path.join(d, 'legenda.txt'), encoding='utf-8').read()
    fotos = sorted(f for f in os.listdir(d) if f.endswith('.jpg'))
    if os.path.exists(os.path.join(d, 'reel.mp4')):
        c = post(f'{IG}/media', {'media_type': 'REELS', 'video_url': f'{URL}/{nome}/reel.mp4', 'caption': leg, 'share_to_feed': 'true'})
    elif len(fotos) == 1:
        c = post(f'{IG}/media', {'image_url': f'{URL}/{nome}/{fotos[0]}', 'caption': leg})
    else:
        filhos = []
        for f in fotos:
            r = post(f'{IG}/media', {'image_url': f'{URL}/{nome}/{f}', 'is_carousel_item': 'true'})
            if 'id' not in r:
                raise SystemExit(f'{nome}/{f}: {r}')
            filhos.append(r['id'])
        for fid in filhos:
            esperar(fid, 120)
        c = post(f'{IG}/media', {'media_type': 'CAROUSEL', 'children': ','.join(filhos), 'caption': leg})
    if 'id' not in c:
        raise SystemExit(f'{nome}: {c}')
    if not esperar(c['id']):
        raise SystemExit(f'{nome}: não terminou de processar')
    p = post(f'{IG}/media_publish', {'creation_id': c['id']})
    if 'id' not in p:
        raise SystemExit(f'{nome}: {p}')
    open(REG, 'a').write(nome + '\n')
    print(nome, 'publicado', p['id'], flush=True)
    time.sleep(8)
print('FIM')
