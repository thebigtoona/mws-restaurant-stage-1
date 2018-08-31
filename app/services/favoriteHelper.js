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
}
