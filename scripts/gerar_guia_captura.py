#!/usr/bin/env python3
# Páginas de captura dos guias "na era da IA" (05/10/2026, Alex: "página de captura irmão").
# Quem comenta "IA" num carrossel recebe no Direct o link guia/<seg>/ (ig_webhook, regra instagram.isca do conector kompila).
# Aqui a pessoa deixa nome, WhatsApp e negócio: entra no CRM pelo mesmo caminho do chat da Liz (chat_site, mesma sessão do liz.js),
# a Liz responde na própria página, e o PDF libera na hora. Dados: scripts/guia_captura.json (os mesmos números dos carrosséis).
# Uso: python3 scripts/gerar_guia_captura.py  → guia/index.html + guia/<seg>/index.html
import html, json, pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
D = json.loads((RAIZ / 'scripts' / 'guia_captura.json').read_text(encoding='utf-8'))
e = html.escape

CSS = """
:root{--verde:#2FD67B;--verde-e:#12803F;--menta:#E3F8EC;--carbono:#0A0B0E;--texto:#1E2328;--cinza:#5E6873;--linha:#E1E5DE;--off:#F5F6F2}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,system-ui,sans-serif;color:var(--texto);background:var(--off);-webkit-font-smoothing:antialiased}
a{color:inherit}
.topo{max-width:1200px;margin:0 auto;padding:22px 24px;display:flex;justify-content:space-between;align-items:center}
.logo{font:700 22px 'JetBrains Mono',monospace;text-decoration:none;color:var(--carbono);white-space:nowrap} .logo b{color:var(--verde-e)}
.topo small{font-size:14px;color:var(--cinza)}
.palco{max-width:1200px;margin:0 auto;padding:12px 24px 60px;display:grid;grid-template-columns:1.05fr .95fr;grid-template-areas:'cab form' 'resto form';gap:0 48px;align-items:start}
.cab{grid-area:cab}.resto{grid-area:resto}.form-col{grid-area:form}
.tag{display:inline-block;font:700 14px 'JetBrains Mono',monospace;color:var(--verde-e);background:var(--menta);padding:8px 14px;border-radius:999px}
h1{font-size:clamp(36px,5vw,60px);line-height:1.03;font-weight:800;letter-spacing:-.035em;color:var(--carbono);margin:18px 0 16px}
h1 .mk{background:var(--verde);padding:0 .1em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.sub{font-size:19px;line-height:1.5;color:#48505a;max-width:560px}
.capa{margin-top:28px;border-radius:24px;overflow:hidden;aspect-ratio:16/10;background:#dfe5df}
.capa img{width:100%;height:100%;object-fit:cover;display:block}
.num{margin-top:28px;display:flex;gap:18px;align-items:center;background:#fff;border-radius:20px;padding:20px 24px;outline:1.5px solid var(--linha);outline-offset:-1.5px}
.num b{font:700 34px 'JetBrains Mono',monospace;letter-spacing:-.03em;color:var(--carbono);white-space:nowrap}
.num b i{font-style:normal;color:var(--verde-e)}
.num p{font-size:16px;line-height:1.4;color:#48505a} .num small{display:block;color:var(--cinza);font-size:13px;margin-top:4px}
.itens{margin-top:28px;display:flex;flex-direction:column;gap:18px}
.it{display:grid;grid-template-columns:44px 1fr;gap:2px 16px}
.it i{grid-row:span 2;width:44px;height:44px;border-radius:50%;background:var(--verde);display:grid;place-items:center;font:700 16px 'JetBrains Mono';font-style:normal;color:var(--carbono)}
.it b{font-size:19px;line-height:1.25;color:var(--carbono)} .it span{font-size:16px;line-height:1.45;color:#48505a}
.mais{margin-top:18px;font-weight:700;color:var(--verde-e)}
.cartao{position:sticky;top:24px;background:#fff;border-radius:28px;padding:34px;outline:1.5px solid var(--linha);outline-offset:-1.5px}
.cartao h2{font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-.02em;color:var(--carbono)}
.cartao .p{font-size:16px;color:#48505a;margin:8px 0 22px;line-height:1.45}
label{display:block;font-size:14px;font-weight:700;color:var(--carbono);margin:14px 0 6px}
input{width:100%;font:500 17px Inter,sans-serif;padding:15px 16px;border-radius:14px;border:1.5px solid #D5DBD3;background:#fff;color:var(--carbono);outline:none}
input:focus{border-color:var(--verde-e)}
button{margin-top:22px;width:100%;font:800 18px Inter,sans-serif;padding:18px;border:0;border-radius:999px;background:var(--verde);color:var(--carbono);cursor:pointer;position:relative;overflow:hidden}
button:disabled{opacity:.6;cursor:wait}
.priv{font-size:13px;color:var(--cinza);margin-top:14px;line-height:1.45} .priv a{color:var(--verde-e)}
.erro{display:none;margin-top:12px;font-size:14px;color:#B3261E;font-weight:600}
.ok{display:none}
.ok h2 span{color:var(--verde-e)}
.baixar{display:block;text-align:center;margin-top:20px;font:800 18px Inter;padding:18px;border-radius:999px;background:var(--carbono);color:#fff;text-decoration:none}
.liz{margin-top:22px;background:var(--menta);border-radius:6px 20px 20px 20px;padding:16px 18px;font-size:16px;line-height:1.5;color:#0d3a20;display:none;white-space:pre-line}
.liz b{display:block;font:700 13px 'JetBrains Mono';color:var(--verde-e);margin-bottom:4px}
.conversar{display:block;text-align:center;margin-top:12px;font:700 16px Inter;padding:14px;border-radius:999px;border:1.5px solid var(--carbono);text-decoration:none;color:var(--carbono)}
.rodape{max-width:1200px;margin:0 auto;padding:24px;font-size:13px;color:var(--cinza);border-top:1px solid var(--linha)}
.lista{max-width:1200px;margin:0 auto;padding:12px 24px 60px;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
.lista a{display:block;background:#fff;border-radius:22px;overflow:hidden;text-decoration:none;outline:1.5px solid var(--linha);outline-offset:-1.5px}
.lista img{width:100%;aspect-ratio:16/10;object-fit:cover;display:block}
.lista b{display:block;padding:16px 18px;font-size:18px;color:var(--carbono)}
@media(max-width:900px){.palco{grid-template-columns:1fr;grid-template-areas:'cab' 'form' 'resto';gap:22px}.cartao{position:static;padding:26px}.topo small{display:none}.num{flex-direction:column;align-items:flex-start;gap:8px}.resto .capa{margin-top:6px}}
"""

HEAD = """<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{titulo}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="{canon}">
<meta property="og:title" content="{titulo}"><meta property="og:description" content="{desc}">
<meta property="og:image" content="{og}"><meta property="og:url" content="{canon}">
<link rel="icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
<style>{css}</style>
<script src="https://crm.kompila.com.br/liz.js" data-chave="kmp_kompila" defer></script>
<script src="https://crm.kompila.com.br/acessos.js" data-chave="kmp_kompila" defer></script>
<script src="/js/pixel.js" defer></script>
<script src="/js/anima.js" defer></script>
</head><body>
<header class="topo"><a class="logo" href="/"><b>[</b> kompila <b>]</b></a><small>IA sob medida pra pequena e média empresa</small></header>
"""

JS = r"""<script>
(function () {
  var URL_CHAT = 'https://fmbxnfebumfhrviumkbu.supabase.co/functions/v1/chat_site', CHAVE = 'kmp_kompila';
  var f = document.getElementById('form-guia'), erro = document.getElementById('erro'), bt = f.querySelector('button');
  // mesma sessão do chat da Liz (liz.js): quem continuar a conversa no balão cai no mesmo lead
  function sessao() { var K = 'liz_sessao_' + CHAVE; try { var v = localStorage.getItem(K); if (!v) { var a = new Uint8Array(16); crypto.getRandomValues(a); v = Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2) }).join(''); localStorage.setItem(K, v) } return v } catch (e) { var a2 = new Uint8Array(16); crypto.getRandomValues(a2); return Array.prototype.map.call(a2, function (b) { return ('0' + b.toString(16)).slice(-2) }).join('') } }
  function utm() { var o = {}; new URLSearchParams(location.search).forEach(function (v, k) { if (/^utm_/.test(k)) o[k] = v }); if (!o.utm_campaign) o.utm_campaign = 'guia_ia_' + f.dataset.seg; return o }
  function post(corpo) { return fetch(URL_CHAT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.erro || 'erro'); return j }) }) }
  f.addEventListener('submit', function (ev) {
    ev.preventDefault(); erro.style.display = 'none';
    var nome = f.nome.value.trim(), tel = f.whatsapp.value.replace(/\D/g, ''), neg = f.negocio.value.trim();
    if (nome.length < 2) return mostrar('Me diz seu nome.');
    if (tel.length < 10 || tel.length > 13) return mostrar('WhatsApp com DDD, ex.: 11 99999-9999.');
    if (neg.length < 2) return mostrar('Qual é o seu negócio?');
    bt.disabled = true; bt.textContent = 'Liberando o guia...';
    var s = sessao(), base = { chave: CHAVE, sessao: s, url: location.href, utm: utm() };
    post(Object.assign({ nome: nome, telefone: tel }, base))
      .then(function () { return post(Object.assign({ texto: 'Peguei o guia ' + f.dataset.palavra + ' na era da IA. Meu negócio: ' + neg }, base)).catch(function () { return null }) })
      .then(function (j) {
        document.getElementById('passo1').style.display = 'none';
        var ok = document.getElementById('passo2'); ok.style.display = 'block';
        ok.querySelector('.quem').textContent = nome.split(' ')[0];
        var ia = j && j.mensagens ? j.mensagens.filter(function (m) { return m.de === 'ia' }).pop() : null;
        if (ia) { var l = document.getElementById('liz'); l.lastChild.textContent = ia.texto; l.style.display = 'block' }
        window.open(f.dataset.pdf, '_blank');
      })
      .catch(function (e) { bt.disabled = false; bt.textContent = 'Quero o guia'; mostrar(e.message === 'erro' ? 'Não deu certo agora. Tenta de novo?' : e.message) });
  });
  function mostrar(t) { erro.textContent = t; erro.style.display = 'block' }
})();
</script>"""


def pagina(seg, d):
    pal = e(d['palavra'])
    titulo_txt = f'O que eu faria se tivesse {d["art"]} {d["palavra"]} na era da IA'
    pdf = f'/blog/pdf/{seg}-na-era-da-ia.pdf'
    its = ''.join(f'<div class="it"><i>0{i+1}</i><b>{e(t)}</b><span>{e(x)}</span></div>' for i, (t, x) in enumerate(d['tres']))
    corpo = f'''<main class="palco">
<div class="cab">
  <span class="tag">[ guia grátis · PDF ]</span>
  <h1>O que eu faria se tivesse {e(d["art"])} <span class="mk">{pal}</span> na era da IA</h1>
  <p class="sub">10 coisas que já dá pra deixar rodando sozinhas, ligando os sistemas que você já usa. Com os números do seu ramo e a fonte de cada um.</p>
</div>
<div class="resto">
  <div class="capa"><img src="/blog/img/{seg}-capa.webp" alt="{e(titulo_txt)}"></div>
  <div class="num"><b><i>[</i> {e(d["num"])} <i>]</i></b><p>{e(d["num_frase"])}<small>Fonte: {e(d["fonte"])}</small></p></div>
  <div class="itens">{its}</div>
  <p class="mais">E mais 7 no guia.</p>
</div>
<div class="form-col"><div class="cartao">
  <div id="passo1">
    <h2>Recebe o guia agora</h2>
    <p class="p">Deixa seu nome e WhatsApp. O PDF abre na hora.</p>
    <form id="form-guia" name="guia_{seg}" data-seg="{seg}" data-palavra="{pal}" data-pdf="{pdf}" novalidate>
      <label for="nome">Seu nome</label><input id="nome" name="nome" autocomplete="given-name" placeholder="Como você se chama">
      <label for="whatsapp">WhatsApp</label><input id="whatsapp" name="whatsapp" inputmode="tel" autocomplete="tel" placeholder="11 99999-9999">
      <label for="negocio">Seu negócio</label><input id="negocio" name="negocio" placeholder="Ex.: Barbearia do João">
      <button type="submit" class="kmv-btn">Quero o guia</button>
      <p class="erro" id="erro"></p>
      <p class="priv">Seus dados ficam com a Kompila e servem pra gente conversar com você. Nada de spam. <a href="/privacidade/">Privacidade</a></p>
    </form>
  </div>
  <div id="passo2" class="ok">
    <h2>Pronto, <span class="quem"></span>. O guia é seu.</h2>
    <a class="baixar" href="{pdf}" target="_blank" rel="noopener">Baixar o guia em PDF</a>
    <div class="liz" id="liz"><b>Liz, da Kompila</b><span></span></div>
    <a class="conversar" data-liz href="#liz">Conversar com a Liz</a>
  </div>
</div></div>
</main>'''
    h = HEAD.format(titulo=e(titulo_txt) + ' · Kompila', desc=e('Guia grátis em PDF: 10 coisas que a IA já faz ' + ('no ' if d['art'] == 'um' else 'na ') + d['palavra'] + ', ligando os sistemas que você já usa.'),
                    canon=f'https://kompila.com.br/guia/{seg}/', og=f'https://kompila.com.br/blog/img/{seg}-capa.webp', css=CSS)
    return h + corpo + '<footer class="rodape">Kompila · CNPJ 65.907.771/0001-02 · Mogi das Cruzes/SP · <a href="/">kompila.com.br</a></footer>' + JS + '</body></html>\n'


def indice():
    cards = ''.join(f'<a href="/guia/{s}/"><img src="/blog/img/{s}-capa.webp" alt=""><b>{e(d["palavra"].capitalize())} na era da IA</b></a>' for s, d in D.items())
    h = HEAD.format(titulo='Guias grátis: o seu negócio na era da IA · Kompila', desc='Escolha o seu ramo e receba o guia em PDF com 10 coisas que a IA já faz.',
                    canon='https://kompila.com.br/guia/', og='https://kompila.com.br/blog/img/barbearia-capa.webp', css=CSS)
    return h + '''<main class="palco" style="display:block"><span class="tag">[ guias grátis ]</span>
<h1>Qual é o <span class="mk">seu negócio</span>?</h1><p class="sub">Escolhe o seu ramo e recebe o guia com 10 coisas que a IA já faz por ele.</p></main>
<div class="lista">''' + cards + '</div><footer class="rodape">Kompila · <a href="/">kompila.com.br</a></footer></body></html>\n'


if __name__ == '__main__':
    g = RAIZ / 'guia'; g.mkdir(exist_ok=True)
    (g / 'index.html').write_text(indice(), encoding='utf-8')
    for seg, d in D.items():
        (g / seg).mkdir(exist_ok=True)
        (g / seg / 'index.html').write_text(pagina(seg, d), encoding='utf-8')
    print('ok', len(D), 'páginas')
