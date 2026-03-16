/* sw.js — IBDA3 PWA Service Worker */

const CACHE_NAME = 'ibda3-v1';
const CACHE_URLS = [
  '/pages/dashboard.html',
  '/pages/courses.html',
  '/pages/favorites.html',
  '/pages/profile.html',
  '/pages/about.html',
  '/pages/support.html',
  '/css/styles.css',
  '/js/shared.js',
  '/js/supabase.js',
];

// ═══ Install — كاش الملفات الأساسية ═══
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ═══ Activate — امسح الكاش القديم ═══
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ═══ Fetch — Network First, Cache Fallback ═══
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase API — مش بنكاشه، يعمل online بس
  if (url.hostname.includes('supabase.co') || url.hostname.includes('telegram.org')) {
    return;
  }

  // باقي الطلبات — Network first, fallback للكاش
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // لو الرد تمام، احفظه في الكاش
        if (res && res.status === 200 && e.request.method === 'GET') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
        }
        return res;
      })
      .catch(() => {
        // مفيش نت — جيب من الكاش
        return caches.match(e.request).then(cached => {
          if (cached) return cached;
          // لو مش موجود في الكاش — ارجع صفحة أوفلاين
          if (e.request.destination === 'document') {
            return caches.match('/pages/dashboard.html');
          }
        });
      })
  );
});
