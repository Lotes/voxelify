'use strict'

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

  Canvas.Image.prototype.addEventListener = function (name, callback) {
    this[`on${name}`] = arg => Reflect.apply(callback, this, [arg])
  }
}
