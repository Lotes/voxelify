const Canvas = require('canvas')

global.document = {
    createElement: function(tag) {
      if(tag !== 'canvas')
        throw new Error('Unsupported tag!')
      return new Canvas()
    }
}
