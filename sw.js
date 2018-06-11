/**
 * setting variables
 */
const cacheName = 'restaurant-reviews-v5'
const cachedAssets = [
  '/',
  'restaurant.html',
  'css/styles.css',
  'css/styles-md.css',
  'css/styles-lg.css',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js'
]

/**
 * install event
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
        return cache.addAll(cachedAssets)
    })
  )
})

/**
 * activate event - delete old caches
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      Promise.all(
        cacheNames.filter( name => name != cacheName )
          .map( names => caches.delete(names) )
      )
    })
  )
})

/**
 * checking cache for assets and serving from cache
 */
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then( response =>
      response || fetch(event.request)
    )
  )
})
