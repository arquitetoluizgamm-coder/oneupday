// One Up Day — service worker (PWA / Play Store TWA)
const CACHE = 'oud-v1';
const CORE = ['/', '/logo-symbol.png', '/app-icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return; // sempre rede

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (url.pathname.startsWith('/_next/static/') || /\.(png|jpg|jpeg|svg|ico|webmanifest|woff2?)$/.test(url.pathname))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((m) => m || caches.match('/')))
  );
});
