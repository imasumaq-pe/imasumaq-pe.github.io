// Guarda la app en el equipo para que abra sin internet. Cada versión nueva reemplaza a la anterior
// (las fotos guardadas, en 'fotos-imasumaq', se conservan).
const V = 'imasumaq-76a2843552';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icono-192.png', './icono-512.png', './icono-mask.png'];
self.addEventListener('install', e => {
  // cache: 'reload' = trae los archivos frescos del servidor (no la copia vieja del navegador)
  e.waitUntil(caches.open(V).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k.indexOf('imasumaq-') === 0).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // lo de Google pasa directo
  // La página: primero intenta la versión nueva (hasta 3 s); sin señal, abre la guardada al instante.
  if (e.request.mode === 'navigate') {
    e.respondWith(caches.open(V).then(c => {
      const red = fetch(u.pathname, { cache: 'no-cache' }).then(r => { if (r.ok) c.put('./index.html', r.clone()); return r; });
      const guardada = () => c.match('./index.html');
      return Promise.race([red, new Promise(ok => setTimeout(ok, 3000))]).then(r => r || guardada()).catch(guardada)
        .then(r => r || red.catch(guardada));
    }));
    return;
  }
  e.respondWith(caches.open(V).then(c => c.match(e.request, { ignoreSearch: true }).then(guardado => {
    const red = fetch(e.request, { cache: 'no-cache' }).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => guardado);
    return guardado || red;
  })));
});
