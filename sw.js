/* ============================================================
   Service Worker — SIMAK SMAI DUBA
   Strategy:
   - Shell (HTML/CSS/JS/ikon) : stale-while-revalidate
   - Navigation                : network-first + navigationPreload
   - Data Google Apps Script   : TIDAK di-cache (selalu fresh)
   ============================================================ */
const VERSION = 'v15';                 // ⬅️ bump setiap kali file kerangka berubah
const CACHE = `simak-kerangka-${VERSION}`;
const KERANGKA = [
  './',
  './index.html',
  './config.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

/* ---------- INSTALL ---------- */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(KERANGKA))
      .then(() => self.skipWaiting())
  );
});

/* ---------- ACTIVATE ---------- */
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // Aktifkan navigation preload kalau didukung (Chrome/Edge)
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (e) {}
    }
    // Hapus cache versi lama
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

/* ---------- FETCH ---------- */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Jangan sentuh permintaan ke Google / CDN
  if (url.origin !== self.location.origin) return;

  // ── 1. Navigation: network-first + navigationPreload
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        // Coba ambil dari navigationPreload (lebih cepat)
        const preload = await e.preloadResponse;
        if (preload) {
          const clone = preload.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
          return preload;
        }
        // Fallback network
        const net = await fetch(req);
        const clone = net.clone();
        caches.open(CACHE).then((c) => c.put(req, clone));
        return net;
      } catch (err) {
        // Offline → pakai cache
        const cached = await caches.match(req);
        return cached || caches.match('./index.html');
      }
    })());
    return;
  }

  // ── 2. Aset kerangka: stale-while-revalidate
  e.respondWith((async () => {
    const cached = await caches.match(req);
    const fetchPromise = fetch(req).then((res) => {
      if (res && res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone));
      }
      return res;
    }).catch(() => cached);
    return cached || fetchPromise;
  })());
});

/* ---------- MESSAGE (dari halaman → update banner) ---------- */
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
