// import modules
import RestaurantDB from '../database/RestaurantDB'

/**
 * Common database helper functions.
 */
class RestaurantHelper {
  constructor() {}

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static get FAVORITES_URL() {
    const url = this.DATABASE_URL;
    return `${url}/?is_favorite=true`;
  }

  /**
   * @desc Fetch all restaurants from the database || the restaurant endpoint if there is
   *       no data in the database already
   * @arg { Function } callback this takes in error(str) & restaurants(arr) as arguments
   */
  static fetchRestaurants(callback) {
    RestaurantDB.getRestaurants().then(restaurants => {
      if ( !restaurants || restaurants.length === 0 ) {
        return fetch(RestaurantHelper.DATABASE_URL)
          .then(res => res.json())
          .then(restaurants => {
            restaurants.forEach( restaurant => {
              if (restaurant.photograph) { restaurant.photograph = `${restaurant.photograph}` }
              else { restaurant.photograph = `${restaurant.id}`}
            })
            restaurants.forEach(restaurant => {
              RestaurantDB.addRestaurant(restaurant)
            })
            return callback(null, restaurants) // return the json array
          })
          .catch(err => {
            callback(err, null)
          });
      } else {
          return callback(null, restaurants) // return the array from the db
      }
    })
  }

  static fetchFavorites(callback) {
    RestaurantDB.getFavorites()
      .then(favorites => {
        if (!favorites || favorites.length === 0) {
          return fetch(this.FAVORITES_URL)
            .then(res => res.json())
            .then(favorites => {
              favorites.forEach(f => RestaurantDB.addFavorite(f))
              return callback(null, favorites)
            })
            .catch(err => callback(err, null))
        } else {
          return callback(null, favorites)
        }
      })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    RestaurantHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    RestaurantHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  static fetchFavoriteByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    RestaurantHelper.fetchFavorites( (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    RestaurantHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  static fetchFavoriteByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    RestaurantHelper.fetchFavorites((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    RestaurantHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);

        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  static fetchFavoriteRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    RestaurantHelper.fetchFavorites((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'All Cuisines') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'All Neighborhoods') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    RestaurantHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  static fetchFavoriteNeighborhoods(callback) {
    // Fetch all restaurants
    RestaurantHelper.fetchFavorites((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    RestaurantHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  static fetchFavoriteCuisines(callback) {
    // Fetch all restaurants
    RestaurantHelper.fetchFavorites((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  // put a restaurant into the favorites endpoint
  static pushFavoriteRestaurant(id) {
    // fire off the put request to add the restaurant to the favorites endpoint
    fetch(`${RestaurantHelper.DATABASE_URL}/${id}/?is_favorite=true`, {method: 'put'})
      .then(data => console.log(data))
      .catch(err => console.log(`FETCH ERROR:  ${err}`))
  }

  // remove a restaurant from the favorites endpoint
  static pullFavoriteRestaurant(id) {
    // fire off the put request to remove as favorite
    fetch(`${RestaurantHelper.DATABASE_URL}/${id}/?is_favorite=false`, {method: 'put'})
      .then(data => console.log(data))
      .catch(err => console.log(`FETCH ERROR:  ${err}`))
  }
  // add an indivual restaurant to the favorite db
  static addFavoriteRestaurantDB(id, callback) {
    fetch(`http://localhost:1337/restaurants/${id}`)
      .then( res => res.json())
      .then( restaurant => {
        RestaurantDB.addFavorite(restaurant);
        return callback(null, restaurant)
      })
  }

  // remove an indivual restaurant to the favorite db
  static removeFavoriteRestaurantDB(id, callback) {
    fetch(`http://localhost:1337/restaurants/${id}`)
      .then( res => res.json())
      .then( restaurant => {
        RestaurantDB.removeFavorite(restaurant.id);
        return callback(null, restaurant)
      })
  }

  static updateRestaurantData(value) {
    RestaurantDB.updateRestaurantData(value)
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant, src) {
    if (src === 'src') {
      return (`/images/${restaurant.photograph}.jpg`);
    } else {
      return (`/images/${restaurant.photograph}-8x6_compressed.jpg`);
    }
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: RestaurantHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}


export { RestaurantHelper as default }
