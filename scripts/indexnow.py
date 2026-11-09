#!/usr/bin/env python3
"""Avisa Bing, Yandex e os outros buscadores do IndexNow que páginas do site mudaram (09/11/2026).
Uso, depois do push e de conferir no ar:
  python3 scripts/indexnow.py                      -> manda todas as URLs do sitemap.xml
  python3 scripts/indexnow.py /pedidos/ /loja/     -> manda só essas
A chave mora em /a2307788b1c4748df69ea3972529c926.txt na raiz do site: nunca apagar.
"""
import json, re, sys, urllib.request
CHAVE = 'a2307788b1c4748df69ea3972529c926'
HOST = 'kompila.com.br'
if len(sys.argv) > 1:
    urls = ['https://' + HOST + '/' + u.lstrip('/') for u in sys.argv[1:]]
else:
    urls = re.findall(r'<loc>(.*?)</loc>', open(__file__.rsplit('/scripts/', 1)[0] + '/sitemap.xml').read())
corpo = json.dumps({'host': HOST, 'key': CHAVE, 'keyLocation': f'https://{HOST}/{CHAVE}.txt', 'urlList': urls}).encode()
req = urllib.request.Request('https://api.indexnow.org/indexnow', data=corpo, headers={'Content-Type': 'application/json; charset=utf-8'})
try:
    r = urllib.request.urlopen(req, timeout=20); print('IndexNow', r.status, len(urls), 'URLs')
except urllib.error.HTTPError as e:
    print('IndexNow erro', e.code, e.read()[:200])
