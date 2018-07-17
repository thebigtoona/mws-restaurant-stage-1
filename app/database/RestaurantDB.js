import idb from 'idb';
class RestaurantDB {
  static openDatabase() {
    idb.open('test', 1, upgradeDB => {
      console.log('db is open')
    })
  }
}
export { RestaurantDB as default }
