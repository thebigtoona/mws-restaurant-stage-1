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
    // try a fetch for the review data
    fetch(this.REVIEWS_BY_RESTAURANT(restaurantId))
      .then( res => res.json())
      .then( reviews => {
        reviews.forEach(r => {
        // add the reviews to the cache
        RestaurantDB.addReview(r)
        })
        // return the results of the fetch
        return callback(null, reviews)
      })
      .catch(err => {
        // try the idb cache
        RestaurantDB.getReviewsByRestaurant(restaurantId)
          .then(reviews => {
            // return the reviews from idb
            return callback(null, reviews)
            // if there are no reviews in the cache
            if (!reviews || reviews <= 0) {
              return callback(`No Reviews in IDB`, null)
            }
          })
          .catch(err => {
            // send error
            return callback(err, null)
          })
      }) // end catch
  }

  static addReview(review) {
    RestaurantDB.addReview(review)
  }

  static addToPending(request) {
    RestaurantDB.addToPending(request)
  }

}

export { ReviewHelper as default }
