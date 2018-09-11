import RestaurantHelper from './restaurantHelper';
import RestaurantDB from '../database/RestaurantDB';

class FavoriteHelper extends RestaurantHelper {
  constructor() {
    super()
  }

  // get favorites endpoint
  static get FAVORITES_URL() {
    const url = super.DATABASE_URL;
    return `${url}/?is_favorite=true`;
  }

  static fetchFavorites(callback) {
    fetch(this.FAVORITES_URL)
      .then(res => res.json())
      .then(favorites => {
        return callback(null, favorites)
      })
      .catch(err => {
        RestaurantDB.getFavorites()
          .then(favorites => {
            return callback(null, favorites)
          })
          if (!favorites || favorites.length === 0) {
            return callback(err, null)
          }
      })
  }

  static fetchFavoriteByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    this.fetchFavorites( (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  static fetchFavoriteByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    this.fetchFavorites((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  static fetchFavoriteRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    this.fetchFavorites((error, restaurants) => {
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

  static fetchFavoriteNeighborhoods(callback) {
    // Fetch all restaurants
    this.fetchFavorites((error, restaurants) => {
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

  static fetchFavoriteCuisines(callback) {
    // Fetch all restaurants
    this.fetchFavorites((error, restaurants) => {
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
    fetch(`${super.DATABASE_URL}/${id}/?is_favorite=true`, {method: 'put'})
      // .then(data => console.log(data))
      .catch(err => console.log(`FETCH ERROR:  ${err}`))
  }

  // remove a restaurant from the favorites endpoint
  static pullFavoriteRestaurant(id) {
    // fire off the put request to remove as favorite
    fetch(`${super.DATABASE_URL}/${id}/?is_favorite=false`, {method: 'put'})
      // .then(data => console.log(data))
      .catch(err => console.log(`FETCH ERROR:  ${err}`))
  }


}

export { FavoriteHelper as default }
