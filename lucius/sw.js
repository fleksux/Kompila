// Luciu's Lanches · app da página de pedido. Sem cache (a página nova sempre chega). Existe pra instalar e pro aviso "seu pedido saiu".
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {})
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {} } catch (x) { d = { title: "Luciu's Lanches", body: e.data ? e.data.text() : '' } }
  e.waitUntil(self.registration.showNotification(d.title || "Luciu's Lanches", { body: d.body || '', tag: d.tag, renotify: true, icon: 'img/icone_192.png' }))
})
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(self.clients.openWindow(self.registration.scope)) })
