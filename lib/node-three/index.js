const THREE = require('three')
require('./Projector')(THREE)
require('./CanvasRenderer')(THREE)
require('./MTLLoader')(THREE)
require('./OBJMTLLoader')(THREE)
require('./NodeLoader')(THREE)
require('./globals')
const Promise = require('bluebird')

module.exports.THREE = THREE

//Loads an OBJ file by file name
module.exports.loadOBJ = function(url) {
  return new Promise(function(resolve, reject) {
    const loader = new THREE.OBJMTLLoader()
    loader.loadByOBJ(url, resolve, null, reject)
  })
}

//DO NOT USE! Given a ThreeJS object, takes all geometries and merges them down into one mesh
module.exports.mergeMesh = function(object) {
  return new Promise(function(resolve, reject) {
    var geometry = new THREE.Geometry()
    object.updateMatrix()
    object.traverse(child => {
      const childGeometry = child.geometry
      if(childGeometry instanceof THREE.BufferGeometry)
        geometry.merge(new THREE.Geometry().fromBufferGeometry(childGeometry), child.matrix)
      else if(childGeometry instanceof THREE.Geometry)
        geometry.merge(childGeometry, child.matrix)
    })
    var mesh = new THREE.Mesh(geometry, object.material)
    resolve(mesh)
  })
}

//Takes a mesh and applies a matrix, such that the object fits into an unit cube
module.exports.normalizeSize = function(mesh) {
  return new Promise(function(resolve, reject) {
    var box = new THREE.Box3().setFromObject(mesh)
    var size = box.size()
    var scale = 1 / Math.max(size.x, size.y, size.z)
    mesh.applyMatrix(new THREE.Matrix4().makeTranslation(-box.min.x - size.x / 2, -box.min.y  - size.y / 2, -box.min.z - size.z / 2))
    mesh.applyMatrix(new THREE.Matrix4().makeScale(scale, scale, scale))
    resolve(mesh)
  })
}
