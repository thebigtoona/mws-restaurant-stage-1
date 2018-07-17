import RestaurantDB from './database/RestaurantDB'

/**
 * setting variables
 */
const cacheName = 'restaurant-reviews-v1'
const cachedAssets = [
  '/',
  'restaurant.html',
  'styles/styles.css',
  'styles/styles-md.css',
  'styles/styles-lg.css',
  'scripts/dbhelper.js',
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
  RestaurantDB.openDatabase();
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
  if (event.request.url === 'http://localhost:1337/restaurants') {
    fetch(event.request)
      .then(response => response.json())
      .then(restaurants => restaurants.forEach(restaurant => {
        RestaurantDB.addItem(restaurant)
      })) && fetch(event.request)
  } else {
    event.respondWith(
      caches.match(event.request).then( response =>
        response || fetch(event.request)
      )
    )
  }
})
