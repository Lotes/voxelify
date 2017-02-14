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
module.exports.captureByCamera = function (mesh, widthArg, heightArg) {
  const WIDTH = 600
  const HEIGHT = 400
  const DISTANCE = Math.sqrt(0.5)

  const width = widthArg || WIDTH
  const height = heightArg || HEIGHT

  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  let light = new THREE.DirectionalLight(0xffffff)
  let target = new THREE.Vector3(0, 0, 0)

  /**
   * Sets the position of camera and light
   * @param {Number} x coordinate
   * @param {Number} y coordinate
   * @param {Number} z coordinate
   * @returns {void}
   */
  function setPosition (x, y, z) {
    camera.position.set(x, y, z)
    light.position.set(x, y, z)
    camera.lookAt(target)
    light.target.position.set(target.x, target.y, target.z)
  }
  setPosition(DISTANCE, 0, DISTANCE)

  camera.up = new THREE.Vector3(0, 1, 0)

  mesh.position.set(target.x, target.y, target.z)

  scene.add(camera)
  scene.add(light)
  scene.add(mesh)

  let canvas = new Canvas()
  let context = canvas.getContext('2d')
  let renderer = new THREE.CanvasRenderer({
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
            if (err) {
              reject(err)
              return
            }
            if (stream) {
              stream.write(data, err2 => {
                if (err2) {
                  reject(err2)
                } else {
                  resolve(context)
                }
              })
            } else {
              resolve(context)
            }
          })
        })
      }
    }
  })
}
