import idb from 'idb';

class RestaurantDB {

  static openDatabase() {
    return idb.open('mws-restaurant-reviews', 2, upgradeDB => {
      switch (upgradeDB.oldVersion) {
        case 0:
          upgradeDB.createObjectStore('restaurant-data', {keyPath: 'id'})
            .createIndex('byFavorite', 'is_favorite')
        case 1:
          upgradeDB.createObjectStore('reviews', {keyPath: 'id'})
            .createIndex('byRestaurant', 'restaurant_id')
        case 2:
          upgradeDB.createObjectStore('pendingReviews', {keyPath: 'id'})
      }
    });
  }

  static getRestaurants() {
    return this.openDatabase().then(db => {
      return db.transaction('restaurant-data')
        .objectStore('restaurant-data')
          .getAll()
    })
  }

  static getFavorites() {
    return this.openDatabase().then(db => {
      return db.transaction('restaurant-data')
        .objectStore('restaurant-data')
        .index('byFavorite')
          .getAll('true')
    })
  }

  static addRestaurant(item) {
    this.openDatabase().then(db => {
      const tx = db.transaction('restaurant-data', 'readwrite')
      const store = tx.objectStore('restaurant-data')
      store.put(item)
      return tx.complete
    })
  }


  static updateRestaurantData(value) {
    this.openDatabase()
      .then(db => {
        const tx = db.transaction('restaurant-data', 'readwrite')
        const store = tx.objectStore('restaurant-data')
        store.put(value)
        return tx.complete;
      })
  }

  static getReviewsByRestaurant(key) {
    return this.openDatabase()
      .then(db => {
        const tx = db.transaction('reviews', 'readwrite')
        const store = tx.objectStore('reviews')
        const byRestaurant = store.index('byRestaurant')
        return byRestaurant.getAll(key)
      })
  }

  static addReview(review) {
    this.openDatabase()
      .then(db => {
        const tx = db.transaction('reviews', 'readwrite')
        const store = tx.objectStore('reviews')
        store.put(review)
        return tx.complete
      })
  }

  // get pending items
  static getPending() {
    return this.openDatabase()
      .then(db => {
        return db.transaction('pendingReviews')
          .objectStore('pendingReviews')
          .getAll()
      })
  }

  // add to pending db
  static addToPending(request) {
    return this.openDatabase()
      .then(db => {
        const tx = db.transaction('pendingReviews', 'readwrite')
          .objectStore('pendingReviews')
          .put(request)

          return tx.complete
      })
  }

}


export { RestaurantDB as default }
