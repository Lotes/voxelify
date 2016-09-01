const nodeThree = require('../shared/node-three/index')
nodeThree.loadLocal('OBJMTLLoader.js')
nodeThree.loadInternal('examples/js/loaders/MTLLoader.js')
const Promise = require('bluebird')
const Canvas = require('canvas')

//actual THREE library
module.exports.THREE = nodeThree.THREE

//some trick to get all pixel information
THREE.Material.prototype.toImageData = function() {
  if(!this.___imageData) {
    if(!this.map || !this.map.image) {
      throw new Error('Unsupported material for image data retrieval!')
    }
    const image = this.map.image
    const canvas = new Canvas(image.width, image.height)
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    this.___imageData = context.getImageData(0, 0, image.width, image.height)
  }
  return this.___imageData
}

//Loads an OBJ file by file name
module.exports.loadOBJ = function(url) {
  return new Promise(function(resolve, reject) {
    const loader = new THREE.OBJMTLLoader()
    loader.loadByOBJ(url, resolve, null, reject)
  }).then(nodeThree.awaitLoadingManager)
}

//load a texture into a material
module.exports.loadTexture = function(url) {
  return new Promise(function(resolve, reject) {
    const loader = new THREE.TextureLoader()
    loader.load(url, resolve, null, reject)
  }).then(function(texture) {
    return new THREE.MeshLambertMaterial({
      map: texture
    })
  })
}
