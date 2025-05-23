const CACHE_NAME = 'football-teams-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/App.js',
  '/components/PlayerManagement.js',
  '/components/PlayerSelection.js',
  '/components/TeamDisplay.js',
  '/rules/teamBalancer.js',
  '/rules/playerManagement.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
}); 