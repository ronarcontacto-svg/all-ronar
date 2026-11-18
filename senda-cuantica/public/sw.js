// Service worker básico: cachea la cáscara de la app para abrirla sin red.
// No gestiona notificaciones push ni sincronización.
const CACHE = 'senda-cuantica-v1';
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Nunca cachear Supabase ni llamadas a la API: datos siempre en vivo.
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then((res) => {
        // Solo cachear respuestas correctas: un 500 no debe quedar guardado para uso sin conexión.
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request).then((hit) => hit || caches.match('/'))),
  );
});
