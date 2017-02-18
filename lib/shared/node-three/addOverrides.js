'use strict'

const fs = require('fs')
const Canvas = require('canvas')

module.exports = function (THREE) {
  /**
   * Extracts the image information for further processing
   * @returns {ImageData} to work on the pixel data
   */
  THREE.Material.prototype.toImageData = function () {
    if (!this.$$imageData) {
      if (!this.map || !this.map.image) {
        throw new Error('Unsupported material for image data retrieval!')
      }
      const image = this.map.image
      const canvas = new Canvas(image.width, image.height)
      const context = canvas.getContext('2d')
      context.drawImage(image, 0, 0)
      this.$$imageData = context.getImageData(0, 0, image.width, image.height)
    }
    return this.$$imageData
  }

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
      const callback = (err, data) => {
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
