// Keeps an offline copy of the app's own files so it opens with no signal
// (floor plans are usually needed indoors). Your plans never pass through here:
// they are read straight from your files and kept in the browser's IndexedDB.
//
// Bump the version in CACHE whenever the icons or the manifest change.
// (index.html refreshes itself: see the navigation branch below.)
var PREFIX = 'where-am-i-';
var CACHE = PREFIX + 'v1';
var SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/favicon-32.png',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      // cache:'reload' skips the HTTP cache, so a new version never stores old files
      .then(function (c) { return c.addAll(SHELL.map(function (u) { return new Request(u, { cache: 'reload' }); })); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  // On GitHub Pages every project of an account shares one origin (and so one set
  // of caches). Only ever delete this app's own old caches.
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k.indexOf(PREFIX) === 0 && k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

function fromCache(key) {
  return caches.open(CACHE).then(function (c) { return c.match(key); });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    // Open instantly from the cache and fetch a fresh copy in the background for
    // next time, so a weak indoor signal never stalls the app.
    var saving = null;
    var fresh = fetch(req).then(function (res) {
      var type = res.headers.get('content-type') || '';
      if (res.ok && res.type === 'basic' && !res.redirected && type.indexOf('text/html') === 0) {
        var copy = res.clone();
        saving = caches.open(CACHE).then(function (c) { return c.put('index.html', copy); });
      }
      return res;
    });
    e.waitUntil(fresh.then(function () { return saving; }).catch(function () {}));
    e.respondWith(fromCache('index.html').then(function (hit) { return hit || fresh; }));
    return;
  }

  // Everything else: the cached copy, or fetch it and keep it (this also rebuilds the
  // cache if something else on the origin ever cleared it).
  e.respondWith(fromCache(req).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) {
      if (res.ok && res.type === 'basic') {
        var copy = res.clone();
        var put = caches.open(CACHE).then(function (c) { return c.put(req, copy); });
        try { e.waitUntil(put); } catch (err) { /* event already settled: the put still runs */ }
      }
      return res;
    });
  }));
});
