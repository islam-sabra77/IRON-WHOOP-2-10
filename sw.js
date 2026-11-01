// IRON service worker: the app opens and works without a connection.
// App files are network-first (always fresh when online) with the cache as the offline fallback.
// API calls are never cached. Exercise thumbnails and fonts are cached as you view them.
const VERSION = 'iron-2026-11-01-2';
const SHELL = [
  './', 'index.html', 'css/app.css',
  'js/01-data-exercises-plan-generator.js', 'js/02-questionnaire-periodization-whoop.js', 'js/03-home-train-share.js',
  'js/04-plan-travel-whoop-inbody.js', 'js/05-progress-builder-coaching.js', 'js/06-supplement-guide.js',
  'js/07-supps-habits-videos-sync.js', 'js/08-timer-helpers-display-actions.js', 'js/09-errors.js',
  'manifest.webmanifest', 'icon-512.png', 'apple-touch-icon.png', 'privacy.html',
];
const EXTERNAL = ['i.ytimg.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== 'iron-ext').map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (url.pathname.startsWith('/api/')) return; // live data only
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
    return;
  }
  if (EXTERNAL.includes(url.hostname)) {
    e.respondWith(caches.open('iron-ext').then((c) => c.match(req).then((hit) => {
      const net = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});
// Tapping a rest-timer notification brings the app back.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((cs) => (cs[0] ? cs[0].focus() : self.clients.openWindow('./'))));
});
