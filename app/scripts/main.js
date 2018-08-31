// this is the import statement for the RestaurantHelper class
import RestaurantHelper from '../services/restaurantHelper';

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
  RestaurantHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

const fetchFavoriteNeighborhoods = () => {
  RestaurantHelper.fetchFavoriteNeighborhoods((error, neighborhoods) => {
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
  while (select.firstChild) {
    select.removeChild(select.firstChild) // clear out selections
  }

  const option = document.createElement('option');
  option.innerHTML = 'All Neighborhoods';
  option.value = 'All Neighborhoods';
  select.append(option);

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
  RestaurantHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

const fetchFavoriteCuisines = () => {
  RestaurantHelper.fetchFavoriteCuisines((error, cuisines) => {
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
  while (select.firstChild) {
    select.removeChild(select.firstChild) // clear out selections
  }

  const option = document.createElement('option');
  option.innerHTML = 'All Cuisines';
  option.value = 'All Cuisines';
  select.append(option);

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
  const favoriteToggle = document.getElementById('favorite-switch')

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  if (favoriteToggle.checked) {
    RestaurantHelper.fetchFavoriteRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML(restaurants);
        lazyLoad()
      }
    })
  } else {
    RestaurantHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML(restaurants);
        lazyLoad()
      }
    })
  }
}

// adds/removes the restaurant from the favorite database.
// updates the restaurant database.
// updates the html
function addRemoveFavorite(e) {
  if ( e.target.classList.contains('favorite-btn') ) {
    // fetch the restaurant from the restaurants db || from the network, by id
    RestaurantHelper.fetchRestaurantById(e.target.dataset.id, (error, restaurant) => {
      // if the restaurant favorite status is true
      if ( restaurant.is_favorite == "true") {
        // pull restaurant from favorite endpoint
        RestaurantHelper.pullFavoriteRestaurant(e.target.dataset.id)
        // change restaurant is_favorite status to false
        RestaurantHelper.updateRestaurantData(e.target.dataset.id, "false");
        // remove restaurant from the favorite db
        RestaurantHelper.removeFavoriteRestaurantDB(e.target.dataset.id, (error, restaurant) => {
          if (error) { console.log(error) }
        })

        // change the inner html of the target button to the outline heart
        e.target.innerHTML = '♡';
      } else {
        // push restaurant to favorite endpoint
        RestaurantHelper.pushFavoriteRestaurant(e.target.dataset.id)
        // change the is_favorite property for the restaurant db to true
        RestaurantHelper.updateRestaurantData(e.target.dataset.id, "true");
        // add restaurant to the favorite db
        RestaurantHelper.addFavoriteRestaurantDB(e.target.dataset.id, (err, res) => {
          if(err) console.log(err)
        })
        // update the target button's html to the filled heart
        e.target.innerHTML = '❤';
      }
    })
  }
} // end addRemoveFavorite()

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
  image.setAttribute('data-src', `${RestaurantHelper.imageUrlForRestaurant(restaurant, 'src')}`)
  image.src = RestaurantHelper.imageUrlForRestaurant(restaurant, 'datasrc');
  image.alt = `${restaurant.name} Restaurant`
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  // favorite button
  const favorite = document.createElement('button')
  favorite.className = 'favorite-btn'
  favorite.setAttribute('data-id', `${restaurant.id}`);
  // setting the btn color
  (restaurant.is_favorite == "true") ? favorite.innerHTML = '❤' : favorite.innerHTML = '♡';
  li.append(favorite)


  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute('aria-label', 'view details');
  more.href = RestaurantHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = RestaurantHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

// toggle viewing your favorites
const showFavorites = (e, restaurants = self.restaurants) => {
  if (e.srcElement.checked) {
    RestaurantHelper.fetchFavorites( (err, favorites) => {
      resetRestaurants(favorites)
      fetchFavoriteCuisines()
      fetchFavoriteNeighborhoods()
      addMarkersToMap(favorites)
      fillRestaurantsHTML(favorites)
      lazyLoad()
    })
  } else {
    RestaurantHelper.fetchRestaurants( (err, restaruants) => {
      resetRestaurants(restaruants)
      fetchCuisines()
      fetchNeighborhoods()
      addMarkersToMap(restaruants)
      fillRestaurantsHTML(restaruants)
      lazyLoad()
    })
  }
  window.requestAnimationFrame(showFavorites)
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
  lazyLoad();
});

// event handler for lazy loading the imgs
registerListener('load', lazyLoad);

// toggle the favorites
const favoriteToggle = document.querySelector('#favorite-switch')
favoriteToggle.addEventListener('change', showFavorites)
// favorite btns event listener
document.addEventListener('click', addRemoveFavorite)
