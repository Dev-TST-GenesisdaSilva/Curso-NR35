const CACHE_NAME = 'nr35-app-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Instalação: Guarda os arquivos básicos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptador de requisições: Tenta a rede, se falhar (offline), usa o cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      // Se tiver internet, atualiza o cache e retorna a página
      const resClone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
      return response;
    }).catch(() => {
      // Se estiver OFFLINE, puxa do cache
      return caches.match(event.request).then(res => res || caches.match('./index.html'));
    })
  );
});