const Canvas = require('canvas')

module.exports = function(THREE) {
  global.THREE = THREE
  global.document = {
      createElement: function(tag) {
        if(tag !== 'canvas')
          throw new Error('Unsupported tag!')
        return new Canvas()
      },
      createElementNS: function(namespace, tag) {
        if(tag !== 'img')
          throw new Error('Unsupported tag!')
        return new Canvas.Image()
      }
  }
  global.URL = {
    createObjectURL: function(blob) { return blob },
    revokeObjectURL: function(url) {}
  }
}
