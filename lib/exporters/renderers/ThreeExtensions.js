'use strict'

const nodeThree = require('../../shared/node-three/index')
nodeThree.loadInternal('examples/js/renderers/Projector.js')
nodeThree.loadInternal('examples/js/renderers/CanvasRenderer.js')
const THREE = nodeThree.THREE
const Promise = require('bluebird')
const Canvas = require('canvas')
module.exports.THREE = THREE

// Takes a mesh and applies a matrix, such that the object fits into an unit cube
module.exports.normalizeSize = function (mesh) {
  return new Promise(resolve => {
    let box = new THREE.Box3().setFromObject(mesh)
    let size = box.size()
    let scale = 1 / Math.max(size.x, size.y, size.z)
    mesh.applyMatrix(new THREE.Matrix4().makeTranslation(-box.min.x - size.x / 2, -box.min.y - size.y / 2, -box.min.z - size.z / 2))
    mesh.applyMatrix(new THREE.Matrix4().makeScale(scale, scale, scale))
    resolve(mesh)
  })
}

// Put a mesh into a scene and return camera setters and render mechanism
module.exports.captureByCamera = function (mesh, width, height) {
  const WIDTH = 600
  const HEIGHT = 400
  const DISTANCE = Math.sqrt(0.5)

  width = width || WIDTH
  height = height || HEIGHT

  var scene = new THREE.Scene()
  var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  var light = new THREE.DirectionalLight(0xffffff)
  var target = new THREE.Vector3(0, 0, 0)

  function setPosition (x, y, z) {
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

  return nodeThree.awaitLoadingManager().then(function () {
    return {
      camera: {
        set: setPosition
      },
      renderToStream: function (stream) {
        renderer.render(scene, camera)
        return new Promise(function (resolve, reject) {
          canvas.toBuffer(function (err, data) {
            if (err) return reject(err)
            if (stream) stream.write(data)
            resolve(context)
          })
        })
      }
    }
  })
}
