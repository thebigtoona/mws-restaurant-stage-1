import RestaurantDB from './database/RestaurantDB'

/**
 * setting variables
 */
const cacheName = 'restaurant-reviews-v4'
const imageCache = 'images-v1'
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
    if (event.request.url.includes('restaurant.html')) {
      event.respondWith(
        caches.match('restaurant.html').then(response => {
          return response || fetch(event.request)
        })
      )
    }
    else if (event.request.url.includes('images') && !event.request.url.includes('maps')) {
      event.respondWith(
        // match from cache
        caches.match(event.request).then(response => {
          return response || fetch(event.request).then(response => {
            return caches.open(imageCache).then(cache => {
              cache.put(event.request, response.clone())
              return response || fetch(event.request)
            })
          })
        })
      )
    }
    else {
      event.respondWith(
        caches.match(event.request).then( response =>
          response || fetch(event.request)
        )
      )
    }
})

// retry sending reviews from the db
const sendReviews = (reviews) => {
  // send reviews function here
  RestaurantDB.getPending()
    .then(pendingItems => {
      pendingItems.forEach( item => {
        fetch(item.url, {
          method: item.method,
          headers: item.headers,
          redirect: item.redirect,
          mode: item.mode,
          body: item.body
        })
          .then(response => {
            if (response.ok) {
              RestaurantDB.delete(item.id)
            }
            return response.json()
          })
          .then(json => console.log(json))
          .catch(error => console.log(error))
      })
    })
}

// sync offline reviews
self.addEventListener('sync', function(event) {
  if (event.tag == 'send-reviews') {
    event.waitUntil(sendReviews());
  }
});
