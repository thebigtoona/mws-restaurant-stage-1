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
  static REVIEWS_BY_RESTAURANT(restaurantId) {
    return `${this.REVIEWS_URL}/?restaurant_id=${restaurantId}`;
  }

  // reviews by review id
  static REVIEWS_BY_ID(reviewId) {
    return `${this.REVIEWS_URL}/${reviewId}`;
  }

  static fetchReviewsByRestaurantId(restaurantId, callback) {
    RestaurantDB.getReviewsByRestaurant(restaurantId)
      .then(reviews => {
        if (!reviews || reviews <= 0) {
          fetch(`${this.REVIEWS_BY_RESTAURANT(restaurantId)}`)
            .then(res => res.json())
            .then( reviews => {
              reviews.forEach(r => {
                RestaurantDB.addReview(r)
              })
              return callback(null, reviews)
            })
            .catch(err => {
              console.log(`FETCH ERROR: ${err}`)
              return callback(err, null)
            })
        } else {
          return callback(null, reviews)
        }
      })
      .catch(err => {
        console.log(`DB ERROR: ${err}`)
        return callback(err, null)
      })
  }

  static addReview(review) {
    RestaurantDB.addReview(review)
  }

}

export { ReviewHelper as default }
