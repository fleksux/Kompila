# Página de comparação Nano Banana Pro x Cinematic dos 20 posts (roda de novo quando chegar slide novo).
import pathlib, html
B = pathlib.Path(__file__).parent
def tira(d, m):
    fs = sorted((d / m).glob('*.jpg'))
    return ''.join(f'<img src="{d.name}/{m}/{f.name}?v={int(f.stat().st_mtime)}" loading="lazy" onclick="z(this)">' for f in fs) or '<em>gerando...</em>'
blocos = ''
for d in sorted(p for p in B.iterdir() if p.is_dir() and p.name[:2].isdigit()):
    leg = (d / 'legenda.txt').read_text().strip().split('\n')[0] if (d / 'legenda.txt').exists() else ''
    reel = 'reel' in d.name
    blocos += f'''<section><h2><b>{d.name[:2]}</b> {html.escape(d.name[3:].replace('_',' '))}{' · Reels' if reel else ''}</h2><p class="lg">{html.escape(leg)}</p>
<div class="m"><span>Nano Banana</span><div class="t{' r' if reel else ''}">{tira(d,'nano')}</div></div>
<div class="m"><span>Cinematic</span><div class="t{' r' if reel else ''}">{tira(d,'cine')}</div></div></section>'''
page = f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Glowbos · Nano x Cinematic</title>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:wght@600;800&display=swap" rel="stylesheet">
<style>*{{box-sizing:border-box}}body{{margin:0;background:#FFF5F9;font:15px Nunito,sans-serif;color:#1a1418}}
header{{position:sticky;top:0;z-index:5;background:#F93388;color:#fff;padding:16px 24px}}header h1{{margin:0;font:700 24px Fredoka}}header p{{margin:4px 0 0;opacity:.9}}
section{{max-width:1600px;margin:0 auto;padding:22px 24px;border-bottom:1px solid #f6d3e2}}h2{{margin:0;font:700 22px Fredoka}}h2 b{{color:#F93388;margin-right:6px}}.lg{{margin:4px 0 12px;color:#5c5258}}
.m{{display:flex;gap:14px;align-items:flex-start;margin:10px 0}}.m>span{{flex:none;width:110px;font:800 13px Nunito;letter-spacing:.08em;text-transform:uppercase;color:#F93388;padding-top:6px}}
.t{{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px}}.t img{{height:300px;aspect-ratio:3/4;object-fit:cover;border-radius:8px;cursor:zoom-in;box-shadow:0 6px 16px rgba(249,51,136,.15)}}.t.r img{{aspect-ratio:9/16}}
#z{{position:fixed;inset:0;background:rgba(0,0,0,.88);display:none;place-items:center;z-index:9}}#z.on{{display:grid}}#z img{{max-height:94vh;max-width:94vw;border-radius:8px}}</style></head><body>
<header><h1>Glowbos · 20 posts nos dois modelos</h1><p>Nano Banana Pro em cima, Cinematic embaixo. Clica pra ampliar. Me fala qual modelo fica em cada post.</p></header>{blocos}
<div id="z" onclick="this.classList.remove('on')"><img id="zi"></div><script>function z(i){{document.getElementById('zi').src=i.src;document.getElementById('z').classList.add('on')}}</script></body></html>'''
(B / 'comparar.html').write_text(page); print('ok')
