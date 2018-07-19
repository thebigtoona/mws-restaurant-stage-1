import idb from 'idb';

class RestaurantDB {

  static openDatabase() {
    return idb.open('mws-restaurant-reviews', 1, upgradeDB => {
      switch (upgradeDB.oldVersion) {
        case 0: upgradeDB.createObjectStore('restaurant-data', {keyPath: 'id'})
      }
    })
  }

  static addItem(item) {
    this.openDatabase().then(db => {
      const tx = db.transaction('restaurant-data', 'readwrite')
      const store = tx.objectStore('restaurant-data')
      store.put(item)
      return tx.complete
    })
  }

  static getItems() {
    return this.openDatabase().then(db => {
      return db.transaction('restaurant-data')
        .objectStore('restaurant-data')
          .getAll()
    })
  }
}


export { RestaurantDB as default }
