// Sistema Coleve · recebe o aviso mesmo com o sistema fechado e abre direto no pedido
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch { d = { titulo: 'Sistema Coleve', corpo: e.data?.text() || '' }; }
  e.waitUntil(self.registration.showNotification(d.titulo || 'Sistema Coleve', {
    body: d.corpo || '', tag: d.tag, renotify: true,
    icon: '/coleve/sistema/icones/app_192.png', badge: '/coleve/sistema/icones/app_192.png',
    data: { url: d.url || '/coleve/sistema/' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/coleve/sistema/';
  e.waitUntil((async () => {
    const abertas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const aba = abertas.find(c => c.url.includes('/coleve/sistema/'));
    if (aba) { await aba.navigate(url).catch(() => {}); return aba.focus(); }
    return self.clients.openWindow(url);
  })());
});
