const CACHE_NAME = 'lrt-tracker-v1';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './schedule_data.js',
    './manifest.json',
    './lrt_jabodebek_widget_schedule.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
