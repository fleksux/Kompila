/* App da Glowbos: só guarda arquivos estáticos (fotos, CSS, JS, fontes).
   Páginas, carrinho, checkout, conta e pagamentos sempre vêm da internet, nunca do cache. */
var C = 'glowbos-v1';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
	e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
	var r = e.request, u = new URL(r.url);
	if (r.method !== 'GET' || u.origin !== location.origin) return;
	if (/\/(wp-admin|wp-json|carrinho|finalizar-compra|minha-conta|acompanhar-pedido)\b|wc-ajax|add-to-cart|wc-api/.test(u.pathname + u.search)) return;
	var estatico = /\.(png|jpe?g|webp|gif|svg|ico|css|js|woff2?)$/.test(u.pathname);
	if (estatico) {
		e.respondWith(caches.open(C).then(function (c) { return c.match(r).then(function (hit) {
			var rede = fetch(r).then(function (res) { if (res.ok) c.put(r, res.clone()); return res; });
			return hit || rede;
		}); }));
		return;
	}
	if (r.mode === 'navigate') {
		e.respondWith(fetch(r).catch(function () { return new Response('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:sans-serif;text-align:center;padding:60px 20px;color:#1d1a1f"><h2 style="color:#FF1F7A">Sem internet</h2><p>Conecte-se pra ver os balões e finalizar sua compra.</p></body>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } }); }));
	}
});
