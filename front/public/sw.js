// GlaciAgua PWA Offline-First Service Worker (v2)
// Diseñado para alta montaña y conectividad intermitente (2G/3G/Offline)

const SHELL_CACHE = 'glaciagua-shell-v2'
const RUNTIME_CACHE = 'glaciagua-runtime-v2'
const TILE_CACHE = 'glaciagua-tiles-v1'

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/app-icon.svg',
]

// Instalación: precachea el shell básico de inmediato
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

// Activación: limpia cachés antiguas y toma el control inmediato
self.addEventListener('activate', (event) => {
  const currentCaches = [SHELL_CACHE, RUNTIME_CACHE, TILE_CACHE]
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => !currentCaches.includes(k)).map((k) => caches.delete(k))
      )
    }).then(() => self.clients.claim())
  )
})

// Interceptación de peticiones de red
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Solo procesar peticiones GET
  if (request.method !== 'GET') return

  // 1. Peticiones a la API del Backend (FastAPI :8000 o :8001): Network con timeout rápido
  if (url.port === '8000' || url.port === '8001' || url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .catch(() => {
          // Si el backend no responde o no hay red, responder JSON offline informativo
          return new Response(
            JSON.stringify({ offline: true, mensaje: 'Modo sin conexión. Servidor no accesible.' }),
            { headers: { 'Content-Type': 'application/json' } }
          )
        })
    )
    return
  }

  // 2. Teselas del mapa cartográfico (ESRI Topo, Satélite, OpenTopoMap, OSM): Cache-First
  if (
    url.hostname.includes('tile.') ||
    url.hostname.includes('openstreetmap') ||
    url.hostname.includes('opentopomap') ||
    url.hostname.includes('arcgisonline.com')
  ) {
    event.respondWith(
      caches.open(TILE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse
          return fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone())
            }
            return networkResponse
          }).catch(() => {
            // Retorna transparente si la tesela no está en caché
            return new Response('', { status: 404, statusText: 'Tile not cached' })
          })
        })
      })
    )
    return
  }

  // 3. Recursos estáticos locales (.js, .css, .svg, .woff2, imágenes): Cache-First con actualización en segundo plano
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Si está en caché, servirlo de inmediato y actualizar en segundo plano si hay red
          fetch(request).then((networkResp) => {
            if (networkResp && networkResp.status === 200) {
              caches.open(RUNTIME_CACHE).then((c) => c.put(request, networkResp))
            }
          }).catch(() => {})
          return cached
        }

        return fetch(request).then((networkResp) => {
          if (networkResp && networkResp.status === 200) {
            const clone = networkResp.clone()
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, clone))
          }
          return networkResp
        })
      })
    )
    return
  }

  // 4. Navegación HTML (PWA App Shell): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((networkResp) => {
        if (networkResp && networkResp.status === 200) {
          caches.open(SHELL_CACHE).then((c) => c.put(request, networkResp.clone()))
        }
        return networkResp
      }).catch(() => {
        return cached || caches.match('/') || caches.match('/index.html')
      })

      // Retorna de inmediato la versión en caché si existe, o espera a la red
      return cached || networkFetch
    })
  )
})
