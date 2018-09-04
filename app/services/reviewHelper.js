import RestaurantHelper from './restaurantHelper';
import RestaurantDB from '../database/RestaurantDB';

class ReviewHelper extends RestaurantHelper {
  constructor () {
    super()
  }
  // reviews url
  static get REVIEWS_URL() {
    return `${super.URL}/reviews`;
  }

  // reviews by id enpoint
  static get REVIEWS_BY_RESTAURANT(restaurantId) {
    return `${this.REVIEWS_URL}/?restaurant_id=${restaurantId}`;
  }

  // reviews by review id
  static get REVIEWS_BY_ID(reviewId) {
    return `${this.REVIEWS_URL}/${reviewId}`;
  }

}
