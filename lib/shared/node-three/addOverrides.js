const fs = require('fs')

module.exports = function (THREE) {
  THREE.XHRLoader = function (manager) {
    this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager
  }
  Object.assign(THREE.XHRLoader.prototype, {
    load: function (url, onLoad, onProgress, onError) {
      if (this.path !== undefined) url = this.path + url
      const scope = this
      const callback = function (err, data) {
        if (err) return onError && onError(err)
        onLoad(data)
      }
      if (scope.responseType === 'blob') {
        fs.readFile(url, callback)
      } else {
        fs.readFile(url, 'utf8', callback)
      }
    },
    setPath: function (value) {
      this.path = value
      return this
    },
    setResponseType: function (value) {
      this.responseType = value
      return this
    },
    setWithCredentials: function (value) {
      this.withCredentials = value
      return this
    },
    setCrossOrigin: function () {}
  })
}
