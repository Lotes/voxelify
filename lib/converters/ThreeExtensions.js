'use strict'

const nodeThree = require('../shared/node-three/index')
nodeThree.loadInternal('examples/js/loaders/OBJLoader.js')
nodeThree.loadInternal('examples/js/loaders/MTLLoader.js')
const Promise = require('bluebird')
const Canvas = require('canvas')
const THREE = nodeThree.THREE

// actual THREE library
module.exports.THREE = THREE

// some trick to get all pixel information
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

// Loads an OBJ file by file name
module.exports.loadOBJ = function (url) {
  return new Promise(function (resolve, reject) {
    const onError = reject
    const onLoad = resolve
    const onProgress = null
    const lastIndex = Math.max(url.lastIndexOf('/'), url.lastIndexOf('\\')) + 1
    const baseUrl = url.substr(0, lastIndex)
    const loader = new THREE.XHRLoader()
    loader.load(url, function (text) {
      const lines = text.split('\n').map(line => line.trim())
      const mtlRegex = /^mtllib (.*)$/
      const mtlLibs = lines.filter(function (line) {
        return mtlRegex.test(line)
      })
      if (mtlLibs.length !== 1) {
        onError(new Error('Exactly one material library expected!'))
        return
      }
      const mtlUrl = mtlRegex.exec(mtlLibs[0])[1]
      const mtlLoader = new THREE.MTLLoader()
      mtlLoader.setPath(baseUrl)
      mtlLoader.setCrossOrigin()
      mtlLoader.load(mtlUrl, function (materials) {
        materials.preload()
        nodeThree.awaitLoadingManager(materials)
          .then(() => {
            let objLoader = new THREE.OBJLoader()
            objLoader.setMaterials(materials)
            objLoader.load(url, onLoad, onProgress, onError)
          }, onError)
      }, onProgress, onError)
    }, onProgress, onError)
  }).then(nodeThree.awaitLoadingManager)
}

// load a texture into a material
module.exports.loadTexture = function (url) {
  return new Promise(function (resolve, reject) {
    const loader = new THREE.TextureLoader()
    loader.load(url, resolve, null, reject)
  }).then(function (texture) {
    return new THREE.MeshLambertMaterial({
      map: texture
    })
  })
}
