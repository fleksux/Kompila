/* Pixel da Meta da Kompila (conjunto de dados "Kompila Vendas") . O Google Analytics 4 (G-L4B7092014) vem pelo medicao.js do CRM.
   Marca: visita (PageView), clique pra falar com a Liz ou no WhatsApp (Contact) e formulário enviado (Lead).
   As vendas fechadas chegam pelo servidor, pelo CRM (Conversions API). */
(function () {
  var PIXEL = '1117150727666593';
  // 09/11/2026: o fbq e a fila nascem já (PageView entra na fila), mas o script de 200 KB do Facebook só baixa
  // depois que a página terminou de abrir e o navegador ficou livre. Nenhum evento se perde: a fila é enviada quando ele chega.
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    var poe = function () { t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) };
    var depois = function () { (f.requestIdleCallback || function (cb) { setTimeout(cb, 1200) })(poe, { timeout: 3000 }) };
    if (b.readyState === 'complete') depois(); else f.addEventListener('load', depois);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', PIXEL);
  fbq('track', 'PageView');

  // Google Analytics 4: carregado pelo medicao.js do CRM (medição avançada, 31/10), não aqui

  var marcado = {};
  function uma(chave, fn) { if (marcado[chave]) return; marcado[chave] = 1; fn(); }

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a, button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (a.hasAttribute('data-liz') || href === '#liz') {
      uma('liz', function () { fbq('track', 'Contact', { content_name: 'Liz no site' }); });
    } else if (/wa\.me|api\.whatsapp\.com/.test(href)) {
      uma('wa', function () { fbq('track', 'Contact', { content_name: 'WhatsApp' }); });
    }
  }, true);

  // leu a página: rolou até a metade ou ficou 30 s (separa quem só abriu de quem se interessou)
  var pagina = location.pathname.replace(/index\.html$/, '') || '/';
  function leu() { uma('leu', function () { fbq('track', 'ViewContent', { content_name: pagina }); }); }
  setTimeout(leu, 30000);
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    if ((h.scrollTop + innerHeight) / h.scrollHeight >= 0.5) leu();
  }, { passive: true });

  document.addEventListener('submit', function (ev) {
    var nome = (ev.target && (ev.target.getAttribute('name') || ev.target.id)) || 'formulario';
    fbq('track', 'Lead', { content_name: nome });
  }, true);
})();
