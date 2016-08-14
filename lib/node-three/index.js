const THREE = require('three')
require('./Projector')(THREE)
require('./CanvasRenderer')(THREE)
require('./MTLLoader')(THREE)
require('./OBJMTLLoader')(THREE)
require('./NodeLoader')(THREE)
require('./globals')
const Promise = require('bluebird')
const Canvas = require('canvas')
const fs = require('fs')

//actual THREE library
module.exports.THREE = THREE

//some trick to get all pixel information
THREE.Material.prototype.toImageData = function() {
  if(!this.___imageData) {
    if(!this.map || !this.map.image)
      throw new Error('Unsupported material for image data retrieval!')
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

//waits until everything was loaded
function awaitLoadingManager() {
  return new Promise(function(resolve, reject) {
    var timeout
    var interval = setInterval(function() {
      if(THREE.DefaultLoadingManager.isLoading)
        return
      clearInterval(interval)
      clearTimeout(timeout)
      resolve()
    }, 10)
    timeout = setTimeout(function() {
      clearInterval(interval)
      reject(new Error('Waited too long for loading content!'))
    }, 10000)
  })
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

//Put a mesh into a scene and return camera setters and render mechanism
module.exports.captureByCamera = function(mesh, width, height) {
  const WIDTH = 600
  const HEIGHT = 400
  const DISTANCE  = Math.sqrt(1/2)

  width = width || WIDTH
  height = height || HEIGHT

  var scene = new THREE.Scene()
  var camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 )
  var light = new THREE.DirectionalLight( 0xffffff );
  var target = new THREE.Vector3(0, 0, 0)

  function setPosition(x, y, z) {
    camera.position.set(x, y, z)
    light.position.set(x, y, z)
    camera.lookAt(target)
    light.target.position.set(target.x, target.y, target.z)
  }
  setPosition(DISTANCE, 0, DISTANCE)

  camera.up = new THREE.Vector3(0, 1, 0)

  mesh.position = target

  scene.add(camera)
  scene.add(light)
  scene.add(mesh)

  var canvas = new Canvas()
  var context = canvas.getContext('2d')
  var renderer = new THREE.CanvasRenderer({
    canvas: canvas
  })
  renderer.setClearColor(0xffffff, 1)
  renderer.setSize(width, height, false)

  return awaitLoadingManager().then(function() {
    return {
      camera: {
        set: setPosition
      },
      renderToStream: function(stream) {
        renderer.render(scene, camera)
        return new Promise(function(resolve, reject) {
          canvas.toBuffer(function(err, data) {
            if(err) return reject(err)
            if(stream) stream.write(data);
            resolve(context)
          })
        })
      }
    }
  })
}
