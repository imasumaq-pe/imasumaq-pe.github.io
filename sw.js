// Guarda la app en el equipo para que abra sin internet. Cada versión nueva reemplaza a la anterior.
const V = 'imasumaq-1301c97acb';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icono-192.png', './icono-512.png', './icono-mask.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // lo de Google pasa directo
  e.respondWith(caches.open(V).then(c => c.match(e.request, { ignoreSearch: true }).then(guardado => {
    const red = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => guardado || c.match('./index.html'));
    return guardado || red;
  })));
});
