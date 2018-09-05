import idb from 'idb';

class RestaurantDB {

  static openDatabase() {
    return idb.open('mws-restaurant-reviews', 2, upgradeDB => {
      switch (upgradeDB.oldVersion) {
        case 0:
          upgradeDB.createObjectStore('restaurant-data', {keyPath: 'id'});
        case 1:
          upgradeDB.createObjectStore('favorites', {keyPath: 'id'});
        case 2:
          upgradeDB.createObjectStore('reviews', {keyPath: 'id'})
            .createIndex('byRestaurant', 'restaurant_id')
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
      return db.transaction('favorites')
        .objectStore('favorites')
          .getAll()
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

  static addFavorite(item) {
    this.openDatabase()
      .then(db => {
        const tx = db.transaction('favorites', 'readwrite')
        const store = tx.objectStore('favorites')
        store.put(item)
        return tx.complete;
      })
  }

  static removeFavorite(key) {
    this.openDatabase()
      .then(db => {
        const tx = db.transaction('favorites', 'readwrite')
        const store = tx.objectStore('favorites')
        store.delete(key)
        return tx.complete;
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
}


export { RestaurantDB as default }
