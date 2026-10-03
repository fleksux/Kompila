/* Pixel da Meta da Kompila (conjunto de dados "Kompila Vendas").
   Marca: visita (PageView), clique pra falar com a Liz ou no WhatsApp (Contact) e formulário enviado (Lead).
   As vendas fechadas chegam pelo servidor, pelo CRM (Conversions API). */
(function () {
  var PIXEL = '1117150727666593';
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', PIXEL);
  fbq('track', 'PageView');

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

  document.addEventListener('submit', function (ev) {
    var nome = (ev.target && (ev.target.getAttribute('name') || ev.target.id)) || 'formulario';
    fbq('track', 'Lead', { content_name: nome });
  }, true);
})();
