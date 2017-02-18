'use strict'

const Promise = require('bluebird')
const nodeThree = require('../shared/node-three/index')
nodeThree.loadInternal('examples/js/loaders/OBJLoader.js')
nodeThree.loadInternal('examples/js/loaders/MTLLoader.js')
const THREE = nodeThree.THREE

/**
 * Loads an OBJ file to a THREE.Object3D
 * @param {String} url the filename
 * @returns {Promise.<THREE.Object3D>} containing a THREE.Mesh
 */
function loadFile (url) {
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

module.exports = loadFile
