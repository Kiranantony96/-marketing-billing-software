const CACHE_NAME = 'markeledger-v2';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './db.js',
    './modules/about.js',
    './modules/clients.js',
    './modules/dashboard.js',
    './modules/expenses.js',
    './modules/finance.js',
    './modules/invoices.js',
    './modules/payments.js',
    './modules/pricing.js',
    './modules/projects.js',
    './modules/quotations.js',
    './modules/recurring.js',
    './modules/settings.js',
    './modules/staff.js',
    './modules/tasks.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://unpkg.com/dexie@latest/dist/dexie.js',
    'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', e => {
    // Force the waiting service worker to become the active service worker.
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching assets');
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Network First, fallback to cache (Great for dev/desktop PWA)
self.addEventListener('fetch', e => {
    e.respondWith(
        fetch(e.request)
            .then(res => {
                // Update the cache with the new response
                const resClone = res.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(e.request, resClone);
                });
                return res;
            })
            .catch(() => caches.match(e.request))
    );
});
