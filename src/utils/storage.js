import config from '../config'

export default {
  setItem (key, val) {
    let storge = this.getStorage()
    storge[key] = val
    window.localStorage.setItem(config.namespace, JSON.stringify(storge))
  },
  getItem (key) {
    return this.getStorage()[key]
  },
  getStorage () {
    return JSON.parse(window.localStorage.getItem(config.namespace) || '{}')
  },
  clearItem (key) {
    let storge = this.getStorage()
    delete storge[key]
    window.localStorage.setItem(config.namespace, JSON.stringify(storge))
  },
  clearAll () {
    window.localStorage.clear()
  }
}