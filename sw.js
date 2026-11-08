/* SW v3 — cache shell (GitHub Pages) + cache aplikasi (Apps Script) */
var CACHE_SHELL = 'simak-kerangka-v3';
var CACHE_APP   = 'simak-aplikasi-v1';
var SHELL = ['./', './index.html', './config.js', './manifest.webmanifest',
             './icons/icon-192.png', './icons/icon-512.png'];

// Cocokkan URL eksekusi Apps Script (bukan halaman cetak dengan ?page=...)
var GAS_RE = /^https:\/\/script\.google\.com\/macros\/[^/]+\/(exec|dev)(\?|$)/;
var GAS_PRINT_RE = /[?&]page=/;   // halaman cetak: JANGAN di-cache (params dinamis)

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_SHELL)
      .then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(
        ks.filter(function (k) { return k !== CACHE_SHELL && k !== CACHE_APP; })
          .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);

  // ─── 1. SHELL (GitHub Pages) — cache-first ──────────────────
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(function (m) {
        if (m) return m;
        return fetch(req).then(function (res) {
          if (res && res.ok) {
            var clone = res.clone();
            caches.open(CACHE_SHELL).then(function (c) {
              c.put(req, clone).catch(function () {});
            });
          }
          return res;
        });
      }).catch(function () { return caches.match('./index.html'); })
    );
    return;
  }

  // ─── 2. APLIKASI (Apps Script) — stale-while-revalidate ─────
  // Hanya cache halaman utama (Gate & Index), skip halaman cetak dinamis
  if (GAS_RE.test(req.url) && !GAS_PRINT_RE.test(url.search)) {
    event.respondWith(
      caches.open(CACHE_APP).then(function (cache) {
        return cache.match(req).then(function (cached) {
          var network = fetch(req).then(function (res) {
            if (res && res.ok) {
              return cache.put(req, res.clone())
                .then(function () { return res; })
                .catch(function () { return res; });
            }
            return res;
          }).catch(function () { return cached; });

          if (cached) {
            event.waitUntil(network);   // revalidate di background
            return cached;              // user lihat cache SEKARANG (instan)
          }
          return network;
        });
      })
    );
    return;
  }

  // Halaman cetak dinamis & lain-lain: biarkan pass-through
});
