# Motor do feed da Glowbos (17/10/2026). Um arquivo por post em posts/, este motor monta o HTML
# panorâmico (N x 1080 x 1440, molde aprovado 08/10) ou o Reels (1080 x 1920 animado) e o render.js
# tira os JPG / o MP4. Linguagem: foto real grande, paleta inteira da marca (berry, pink, rosa,
# pêssego, lilás sobre creme e grafite), letra de mão Caveat como acento, a especialista dando dica,
# texto pra quem nunca montou um balão. Faixa de 5 cores da marca atravessa o carrossel inteiro.
import importlib.util, json, pathlib, sys, html as H

BASE = pathlib.Path(__file__).parent
IMG = '../../../tema/glowbos/img/'      # do <slug>/pano.html até o tema
ESP = '../especialista/'                 # fotos da especialista
LOGO = IMG + 'D_logo_crop.png'

PAL = dict(berry='#B0124F', pink='#FF1F7A', rosa='#FF8DB8', pessego='#FFC2A1', lilas='#B99CF0',
           creme='#F7F3EA', grafite='#1d1a1f', bebe='#FFF2F6')

FONTES = '<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">'

CSS = r"""
:root{--rosa:#F93388;--rosaf:#FFD8E8;--preto:#000;--ink:#1a1418;--mut:#5c5258;--por:linear-gradient(135deg,#F87838,#A040C8);--oceano:linear-gradient(135deg,#60E8F0,#4080F8);--citrico:linear-gradient(135deg,#98E0B8,#F8D830);--holo:#D0C0E8;--algodao:linear-gradient(135deg,#F8C8D8,#C0D8F0);--neon:linear-gradient(135deg,#100038,#08B0F8);--abobora:#F07000;--roxo:#502070;--noite:#201040;--vela:#F8A810;--berry:#F93388;--pink:#F93388;--grafite:#000;--bebe:#FFD8E8;--creme:#fff}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#bbb}
#pano{position:relative;height:1440px;overflow:hidden;font-family:Nunito,sans-serif;color:var(--ink)}
.sl{position:absolute;top:0;width:1080px;height:1440px;overflow:hidden}
.x{position:absolute;z-index:6}            /* elemento que atravessa slides (coordenada do canvas) */
/* fundos */
.f-creme{background:var(--creme)}.f-bebe{background:var(--bebe)}.f-branco{background:#fff}
.f-lilas{background:#EEE6FF}.f-pessego{background:#FFE9DC}.f-rosa{background:#FFE1EC}
.f-berry{background:var(--berry);color:#fff}.f-pink{background:var(--pink);color:#fff}.f-grafite{background:var(--grafite);color:#fff}
.f-lilasf{background:var(--lilas);color:#fff}.f-pessegof{background:var(--pessego)}
.f-branco{background:#fff}.f-rosaf{background:var(--rosaf)}.f-rosa{background:var(--rosa);color:#fff}.f-preto{background:#000;color:#fff}
.f-por{background:var(--por);color:#fff}.f-oceano{background:var(--oceano);color:#fff}.f-citrico{background:var(--citrico)}.f-holo{background:var(--holo)}.f-algodao{background:var(--algodao)}.f-neon{background:var(--neon);color:#fff}
.f-noite{background:var(--noite);color:#fff}.f-abobora{background:var(--abobora);color:#fff}
.f-rosa .k,.f-preto .k,.f-por .k,.f-oceano .k,.f-neon .k,.f-noite .k,.f-abobora .k{color:#fff;opacity:.9}
.f-rosa .p,.f-preto .p,.f-por .p,.f-oceano .p,.f-neon .p,.f-noite .p,.f-abobora .p{color:rgba(255,255,255,.92)}
.f-preto .m,.f-noite .m,.f-neon .m{color:var(--rosaf)}.f-rosa .m,.f-por .m,.f-oceano .m,.f-abobora .m{color:#fff}.f-noite .m{color:var(--abobora)}
/* topo e rodapé fixos */
.lg{position:absolute;left:96px;top:150px;height:58px;z-index:7}
.f-berry .lg,.f-pink .lg,.f-grafite .lg,.f-lilasf .lg{filter:drop-shadow(0 4px 14px rgba(0,0,0,.18))}
.pg{position:absolute;right:96px;top:164px;font:800 20px Nunito;letter-spacing:.1em;opacity:.65;z-index:7}
.faixa{display:none;position:absolute;left:0;bottom:0;height:16px;z-index:8;background:linear-gradient(90deg,var(--berry) 0 20%,var(--pink) 20% 40%,var(--rosa) 40% 60%,var(--pessego) 60% 80%,var(--lilas) 80% 100%);background-size:1080px 16px}
.site{position:absolute;left:96px;bottom:150px;font:800 22px Nunito;letter-spacing:.06em;opacity:.75;z-index:7}
.seta{position:absolute;right:96px;bottom:150px;font:800 22px Nunito;letter-spacing:.14em;text-transform:uppercase;z-index:7}
/* tipografia */
.k{font:800 22px Nunito;letter-spacing:.16em;text-transform:uppercase;color:var(--rosa)}
.f-berry .k,.f-pink .k,.f-grafite .k,.f-lilasf .k{color:#fff;opacity:.85}
.t{font:700 96px/1 Fredoka;letter-spacing:-.01em}
.t2{font:700 68px/1.04 Fredoka;letter-spacing:-.005em}
.t3{font:600 44px/1.1 Fredoka}
.m{font:inherit;color:var(--rosa)}
.f-berry .m,.f-pink .m,.f-grafite .m{color:#FFD0E1}.f-lilasf .m{color:#fff}
.p{font:600 34px/1.4 Nunito;color:var(--mut)}
.f-berry .p,.f-pink .p,.f-grafite .p,.f-lilasf .p{color:rgba(255,255,255,.86)}
.mao{font:600 40px/1.15 Fredoka;color:var(--rosa)}
.f-berry .mao,.f-pink .mao,.f-grafite .mao{color:#FFD0E1}
.blk{position:absolute;left:96px;right:96px}
/* fotos */
.ft{position:absolute;overflow:hidden;border-radius:30px;background:#eee;box-shadow:0 20px 50px rgba(29,26,31,.16)}
.ft img,.ftc img,.pol img{width:100%;height:100%;object-fit:cover;display:block}
.ftc{position:absolute;overflow:hidden;border-radius:50%;box-shadow:0 18px 40px rgba(29,26,31,.18);border:10px solid #fff}
.pol{position:absolute;background:#fff;padding:16px 16px 64px;border-radius:6px;box-shadow:0 18px 44px rgba(29,26,31,.18)}
.pol i{position:absolute;left:0;right:0;bottom:12px;text-align:center;font:600 30px Fredoka;color:var(--rosa);font-style:normal}
.full{position:absolute;inset:0}.full img{width:100%;height:100%;object-fit:cover}
.vel{position:absolute;left:0;right:0;bottom:0;height:62%;background:linear-gradient(180deg,rgba(29,26,31,0),rgba(29,26,31,.82) 70%)}
.velc{position:absolute;left:0;right:0;bottom:0;height:58%;background:linear-gradient(180deg,rgba(247,243,234,0),var(--creme) 62%)}
/* peças */
.pill{display:inline-flex;align-items:center;gap:12px;height:72px;padding:0 30px;border-radius:99px;background:var(--pink);color:#fff;font:800 30px Nunito}
.pill.br{background:#fff;color:var(--berry)}.pill.gr{background:var(--grafite)}
.num{display:grid;place-items:center;width:96px;height:96px;border-radius:50%;background:var(--pink);color:#fff;font:700 48px Fredoka;flex:none}
.num.out{background:transparent;border:5px solid currentColor;color:var(--pink)}
.cartao{position:absolute;background:#fff;border-radius:30px;padding:34px 36px;box-shadow:0 16px 44px rgba(29,26,31,.12);color:var(--ink)}
.cartao .p{color:var(--mut)}
.preco{font:700 66px Fredoka;color:var(--rosa)}
.preco small{font:700 26px Inter;color:var(--mut);letter-spacing:0;margin-right:8px}
.estrela{color:#F5A623;letter-spacing:3px;font:800 30px Nunito}
/* especialista: selo com foto redonda */
.esp{position:absolute;display:flex;align-items:center;gap:18px;z-index:7}
.esp .ftc{position:relative;width:110px;height:110px;border-width:6px}
.esp b{display:block;font:800 26px Inter}.esp small{display:block;font:600 22px Inter;opacity:.7}
.lista{list-style:none;display:flex;flex-direction:column;gap:26px}
.lista li{display:flex;gap:24px;align-items:flex-start;font:600 34px/1.3 Inter}
.lista li b{font-weight:800}
.lista .num{width:72px;height:72px;font-size:38px}
.bolha{position:absolute;background:#fff;border-radius:34px 34px 34px 8px;padding:30px 34px;font:600 32px/1.38 Inter;color:var(--ink);box-shadow:0 14px 36px rgba(29,26,31,.14)}
.bolha b{font-weight:800}
/* movimento (5 s por slide; o render grava em vídeo) */
@keyframes sobe{from{opacity:0;transform:translateY(46px)}to{opacity:1;transform:none}}
@keyframes zoom{from{transform:scale(1.0)}to{transform:scale(1.09)}}
@keyframes flut{from{translate:0 0}to{translate:0 -16px}}
.sl .k,.sl .t,.sl .t2,.sl .t3,.sl .p,.sl .mao,.sl .pill,.sl .preco,.sl .cartao,.sl .bolha,.sl .lista li,.sl .num,.sl .esp{animation:sobe .9s cubic-bezier(.2,.8,.2,1) both}
.sl .k{animation-delay:.15s}.sl .t,.sl .t2{animation-delay:.3s}.sl .t3,.sl .mao{animation-delay:.45s}.sl .p,.sl .preco{animation-delay:.6s}
.sl .cartao,.sl .bolha{animation-delay:.75s}.sl .pill{animation-delay:.9s}
.sl .lista li:nth-child(1){animation-delay:.5s}.sl .lista li:nth-child(2){animation-delay:.7s}.sl .lista li:nth-child(3){animation-delay:.9s}.sl .lista li:nth-child(4){animation-delay:1.1s}.sl .lista li:nth-child(5){animation-delay:1.3s}
.ft img,.full img,.ftc img{animation:zoom 5s linear both}
.pol,.ftc,.x{animation:flut 2.5s ease-in-out infinite alternate}
.pol:nth-of-type(2n){animation-delay:-1.2s}
"""

def esc(t): return H.escape(t)
def mk(t):
    """*palavra* vira letra de mão; o resto escapado."""
    import re
    return re.sub(r'\*(.+?)\*', r'<span class="m">\1</span>', esc(t))

def carregar():
    sys.path.insert(0, str(BASE)); posts = []
    for f in sorted((BASE / 'posts').glob('*.py')):
        spec = importlib.util.spec_from_file_location(f.stem, f); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        p = m.POST; p['arq'] = f.stem; posts.append(p)
    return posts

def pagina_carrossel(p):
    n = len(p['slides']); W = n * 1080
    out = []
    for i, s in enumerate(p['slides']):
        fundo = s.get('fundo', 'creme')
        # logo só no primeiro e no último card (manual da Glowbos + Reynolds); contador nos outros
        lg = f'<img class="lg" src="{LOGO}" alt="">' if i in (0, n - 1) else ''
        topo = '' if s.get('sem_topo') else lg + (f'<span class="pg">{i+1}/{n}</span>' if n > 1 else '')
        pe = s.get('pe', 'seta' if i < n - 1 else 'site')
        rod = {'seta': '<span class="seta">arrasta →</span>', 'site': '<span class="site">glowbos.com.br</span>', '': ''}[pe]
        out.append(f'<section class="sl f-{fundo}" style="left:{i*1080}px">{s["html"]}{topo}{rod}</section>')
    cross = ''.join(p.get('cross', []))
    faixa = f'<div class="faixa" style="width:{W}px"></div>'
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>{esc(p["slug"])}</title>{FONTES}<style>{CSS}{p.get("css","")}</style></head>'
            f'<body><div id="pano" style="width:{W}px">{"".join(out)}{cross}{faixa}</div></body></html>')

def pagina_reel(p):
    # Reels 1080x1920; animações CSS com duração total p['dur'] segundos. O render pausa e avança o tempo quadro a quadro.
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>{esc(p["slug"])}</title>{FONTES}<style>{CSS}'
            '#reel{position:relative;width:1080px;height:1920px;overflow:hidden;font-family:Nunito,sans-serif;color:var(--ink)}'
            '#reel .lg{top:390px}#reel .faixa{width:1080px}'
            f'{p.get("css","")}</style></head><body><div id="reel" class="f-{p.get("fundo","creme")}">{p["html"]}'
            f'<img class="lg" src="{LOGO}" alt=""><div class="faixa"></div></div></body></html>')

def montar():
    posts = carregar(); idx = []
    for p in posts:
        d = BASE / p['slug']; (d / 'export').mkdir(parents=True, exist_ok=True)
        if p['tipo'] == 'reel':
            (d / 'reel.html').write_text(pagina_reel(p))
        else:
            (d / 'pano.html').write_text(pagina_carrossel(p))
        (d / 'legenda.txt').write_text(p['leg'].strip() + '\n')
        idx.append(dict(slug=p['slug'], tipo=p['tipo'], n=len(p.get('slides', [])), dur=p.get('dur', 0), ordem=p['ordem']))
    (BASE / 'indice.json').write_text(json.dumps(sorted(idx, key=lambda x: x['ordem']), ensure_ascii=False, indent=1))
    print('montados', len(posts))

if __name__ == '__main__':
    montar()
