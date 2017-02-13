'use strict'

const fs = require('fs')

module.exports = function (THREE) {
  THREE.XHRLoader = function (manager) {
    this.manager = manager === undefined
      ? THREE.DefaultLoadingManager
      : manager
  }
  Object.assign(THREE.XHRLoader.prototype, {
    load: function (urlArg, onLoad, onProgress, onError) {
      let url = urlArg
      if (this.path !== undefined) {
        url = this.path + url
      }
      const callback = function (err, data) {
        if (err) return onError && onError(err)
        return onLoad && onLoad(data)
      }
      if (this.responseType === 'blob') {
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
