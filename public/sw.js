// One Up Day — service worker (PWA / Play Store TWA)
// REGRA: nada de HTML em cache. Só arquivos estáticos com hash no nome.
// Assim o app instalado nunca fica preso numa versão antiga.
const CACHE = 'oud-v3';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k)))) // limpa TUDO das versoes antigas
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // paginas, APIs e auth: sempre da rede, nunca do cache
  const isPage = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isPage || url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return;

  // so imutaveis (chunks com hash, fontes, icones) entram no cache
  const cacheable = url.pathname.startsWith('/_next/static/')
    || /\.(png|jpg|jpeg|svg|ico|webmanifest|woff2?)$/.test(url.pathname);
  if (!cacheable) return;

  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }))
  );
});

// ---- Push: recebe e mostra a notificacao ----
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data && e.data.text() }; }
  const title = d.title || 'One Up Day';
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    icon: '/app-icon-192.png',
    badge: '/app-icon-192.png',
    tag: d.tag || 'oud',
    renotify: false,
    data: { url: d.url || '/home' },
  }));
});

// ---- Clique: abre a aba do app ou foca a existente ----
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || '/home';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) {
          c.navigate(target);
          return c.focus();
        }
      }
      return clients.openWindow(target);
    })
  );
});
