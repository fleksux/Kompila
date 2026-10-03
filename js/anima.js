/* kompila · anima.js (02/10/2026, Alex: "anima as coisas, nada acontece").
   Um arquivo só pro site inteiro: título sobe palavra por palavra, card e imagem entram em sequência,
   número conta, foto do topo dá zoom lento, clicável levanta no mouse, barra de leitura no topo.
   Não mexe em quem já anima sozinho (.aparece, .rv). Respeita "reduzir movimento". */
(function () {
  if (window.__kmv) return; window.__kmv = 1;
  var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var css = [
    '.kmv-bar{position:fixed;left:0;top:0;height:3px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#12803F,#2FD67B);z-index:100000;pointer-events:none}',
    '.kmv-w{display:inline-block;opacity:0;transform:translateY(.55em) rotate(2deg);filter:blur(4px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1),filter .7s}',
    '.kmv-on .kmv-w{opacity:1;transform:none;filter:none}',
    '.kmv-in{opacity:0;transform:translateY(46px) scale(.965);transition:opacity .85s cubic-bezier(.2,.7,.2,1),transform .85s cubic-bezier(.2,.7,.2,1)}',
    '.kmv-in.kmv-on{opacity:1;transform:none}',
    '.kmv-zoom{overflow:hidden}.kmv-zoom img,.kmv-zoom video{animation:kmvKen 18s ease-in-out infinite alternate}',
    '@keyframes kmvKen{from{transform:scale(1)}to{transform:scale(1.09)}}',
    '.kmv-hov{transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s}',
    '.kmv-hov:hover{transform:translateY(-6px);box-shadow:0 24px 50px rgba(10,30,20,.16)}',
    '.kmv-hov img{transition:transform .6s cubic-bezier(.2,.7,.2,1)}.kmv-hov:hover img{transform:scale(1.05)}',
    '.kmv-btn{position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s}',
    '.kmv-btn:hover{transform:translateY(-3px);box-shadow:0 12px 26px rgba(10,30,20,.2)}',
    '.kmv-btn::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.45),transparent);transform:skewX(-20deg);animation:kmvBrilho 4.5s ease-in-out infinite}',
    '@keyframes kmvBrilho{0%,70%{left:-60%}100%{left:130%}}',
    '.kmv-br{display:inline-block;animation:kmvPisca 2.6s ease-in-out infinite}',
    '@keyframes kmvPisca{0%,100%{opacity:1}50%{opacity:.35}}'
  ].join('');
  var st = document.createElement('style'); st.textContent = reduz ? '.kmv-bar{display:none}' : css; document.head.appendChild(st);
  if (reduz) return;

  // barra de leitura
  var bar = document.createElement('div'); bar.className = 'kmv-bar'; document.body.appendChild(bar);
  var pinta = function () { var h = document.documentElement; bar.style.transform = 'scaleX(' + Math.min(1, h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) + ')'; };
  addEventListener('scroll', pinta, { passive: true }); pinta();

  var jaAnima = function (el) { return el.closest('.aparece,.rv,.kmv-in,#kompila-liz,.kr-nav,header.nav,nav,footer,.faixa-anda,.cap-trilho'); };
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('kmv-on'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  // títulos: palavra por palavra (mantém <em>, <span>, <br>)
  document.querySelectorAll('main h1, main h2, section h1, section h2, article h3.cap-h, .cap h3').forEach(function (h) {
    if (jaAnima(h) || h.dataset.kmv) return; h.dataset.kmv = 1; var i = 0;
    (function quebra(no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var partes = c.textContent.split(/(\s+)/); var frag = document.createDocumentFragment();
          partes.forEach(function (p) {
            if (!p) return; if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var s = document.createElement('span'); s.className = 'kmv-w'; s.textContent = p; s.style.transitionDelay = (i++ * 55) + 'ms'; frag.appendChild(s);
          });
          no.replaceChild(frag, c);
        } else if (c.nodeType === 1 && !/^(BR|SVG|IMG)$/.test(c.tagName)) quebra(c);
      });
    })(h);
    io.observe(h);
  });

  // cards, imagens e blocos: entram em sequência dentro do mesmo pai
  var alvos = 'section .card, section article, section figure, section .perg, section .caixa, section .foto, section .b, section table, section .lado > *, section .num, section .tw, section .case';
  document.querySelectorAll(alvos).forEach(function (el) {
    if (jaAnima(el) || el.closest('.kmv-in') || el.classList.contains('cap')) return;
    var irmaos = Array.prototype.filter.call(el.parentElement.children, function (x) { return x.classList.contains('kmv-in'); }).length;
    el.classList.add('kmv-in'); el.style.transitionDelay = Math.min(irmaos, 6) * 90 + 'ms'; io.observe(el);
    if (/^(A|ARTICLE)$/.test(el.tagName) || el.classList.contains('card') || el.classList.contains('b') || el.classList.contains('case')) el.classList.add('kmv-hov');
  });

  // foto do topo: zoom lento
  document.querySelectorAll('section:first-of-type .foto, .hero .foto, .hero figure, .ph figure').forEach(function (f) { f.classList.add('kmv-zoom'); });

  // botões levantam e têm brilho
  document.querySelectorAll('a.btn, button.btn, .kr-btn').forEach(function (b) { if (!b.closest('#kompila-liz')) b.classList.add('kmv-btn'); });

  // colchetes do logo piscam
  document.querySelectorAll('.logo b, .kr-logo b').forEach(function (b, i) { if (i < 2) { b.classList.add('kmv-br'); b.style.animationDelay = (i * 0.4) + 's'; } });

  // números contam: "R$ 19.494", "[ R$ 38.700 ]", "5.900", "90 mil"
  var re = /^(\[?\s*(?:R\$\s?)?)([\d]{1,3}(?:\.\d{3})+|\d{2,5})(.*)$/;
  document.querySelectorAll('section b, section strong, section .v, section .val, section [class*="num"] b, section .total').forEach(function (el) {
    if (el.children.length || jaAnima(el) && !el.closest('.aparece,.rv')) return;
    var orig = el.textContent.trim(), m = orig.match(re); if (!m) return;
    var alvo = +m[2].replace(/\./g, ''); if (!alvo || alvo < 10) return;
    var fmt = function (n) { return m[1] + Math.round(n).toLocaleString('pt-BR') + m[3]; };
    var obs = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; obs.disconnect(); var t0 = performance.now();
      (function passo(agora) { var p = Math.min(1, (agora - t0) / 1400), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(alvo * e); if (p < 1) requestAnimationFrame(passo); else el.textContent = orig; })(t0);
    }, { threshold: 0.6 });
    el.textContent = fmt(0); obs.observe(el);
  });
})();
