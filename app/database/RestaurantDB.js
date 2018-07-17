import idb from 'idb';
class RestaurantDB {
  static openDatabase() {
    idb.open('mws-restaurant-reviews', 1, upgradeDB => {
      switch (upgradeDB.oldVersion) {
        case 0: upgradeDB.createObjectStore('restaurant-data', {keyPath: 'id'})
      }
    })
  }
}
export { RestaurantDB as default }
