// this is the import statement for the dbhelper class
import DBHelper from './dbhelper';

let restaurants,
    neighborhoods,
    cuisines;

// made these explicit to the window object and now it works lol
window['map']
window['markers'] = [];


/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
window.updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}


/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  li.setAttribute('role', 'listitem');
  li.setAttribute('tabindex', '0');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.setAttribute('data-src', `${DBHelper.imageUrlForRestaurant(restaurant, 'src')}`)
  image.src = DBHelper.imageUrlForRestaurant(restaurant, 'datasrc');
  image.alt = `${restaurant.name} Restaurant`
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute('aria-label', 'view details');
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

// toggle viewing your favorites
const showFavorites = (e, restaurants = self.restaurants) => {
  if (e.srcElement.checked) {
    DBHelper.fetchFavorites( (err, favorites) => {
      resetRestaurants(favorites)
      addMarkersToMap(favorites)
      fillRestaurantsHTML(favorites)
    })
  } else {
    DBHelper.fetchRestaurants( (err, restaruants) => {
      resetRestaurants(restaruants)
      addMarkersToMap(restaruants)
      fillRestaurantsHTML(restaruants)
    })
  }
}

/**
 * register service worker
 */
const registerWorker = () => {
  if('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('/sw.js')
             .then(() => console.log("Service Worker Registered"))
             .catch(err => console.log(err));
  }
}

/**
 * lazy load images
 */
const lazyLoad = () => {
  // imgs to lazy load (only the restaurant imgs)
  const imgs = document.querySelectorAll('img.restaurant-img');

  // set options for observer
  const options = {
    root: null,
    rootmargin: '0px',
    threshold: 0.1
  };

  // fn to fetch the image
  const fetchImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      // if img loads resolve the promise
      img.onload = resolve;
      // error
      img.onerror = reject;
    })
  }

  // load img function
  const loadImage = (img) => {
    const src = img.dataset.src;
    // fetch the img and change the src
    fetchImage(src).then(() => {
      // change the src here
      img.src = src;
    })
  }

  // handler function
  const handlerFunction = (entries, observer) => {
    entries.forEach(entry => {
      if(entry.intersectionRatio > 0) {
        loadImage(entry.target)
      }
    })
  }

  // create new observer
  const observer = new IntersectionObserver(handlerFunction, options);

  imgs.forEach(img => {
    observer.observe(img);
  })
}

// polyfill for lazy load event handler
function registerListener(event, func) {
  if (window.addEventListener) {
      window.addEventListener(event, func)
  } else {
      window.attachEvent('on' + event, func)
  }
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  registerWorker();
  fetchNeighborhoods();
  fetchCuisines();
});

// event handler for lazy loading the imgs
registerListener('load', lazyLoad);

// toggle the map
const favoriteToggle = document.querySelector('#favorite-switch')
favoriteToggle.addEventListener('change', showFavorites)
