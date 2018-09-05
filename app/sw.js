import RestaurantDB from './database/RestaurantDB'

/**
 * setting variables
 */
const cacheName = 'restaurant-reviews-v3'
const cachedAssets = [
  '/',
  'restaurant.html',
  'styles/styles.css',
  'styles/responsive.css',
  'styles/restaurant.css',
  'services/restaurantHelper.js',
  'services/reviewHelper.js',
  'services/favoriteHelper.js',
  'scripts/main.js',
  'scripts/restaurant_info.js'
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
  // RestaurantDB.openDatabase();
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
