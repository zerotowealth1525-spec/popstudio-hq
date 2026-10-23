// PopStudio HQ service worker: network-first for pages, cache-first for static assets
const CACHE = 'popstudio-v2';
const CORE = [
  './',
  './index.html',
  './dashboard.html',
  './manifest.webmanifest',
  './favicon.svg',
  './images/owner.webp',
  './fonts/poppins-600.woff2',
  './fonts/poppins-700.woff2',
  './fonts/dm-sans-400.woff2',
  './fonts/dm-sans-500.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const isPage = r.mode === 'navigate' || r.destination === 'document' || r.url.endsWith('.html');
  if (isPage) {
    e.respondWith(fetch(r).then(res => {
      const cp = res.clone();
      caches.open(CACHE).then(c => c.put(r, cp));
      return res;
    }).catch(() => caches.match(r, {ignoreSearch: true}).then(m => m || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
    const cp = res.clone();
    caches.open(CACHE).then(c => c.put(r, cp));
    return res;
  })));
});
