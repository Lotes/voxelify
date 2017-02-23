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
    let size = box.getSize()
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

  const width = widthArg || WIDTH
  const height = heightArg || HEIGHT
  const fov = 45
  const aspect = width / height
  const near = 1
  const far = 1000

  // see: http://gamedev.stackexchange.com/questions/60104/how-can-i-find-the-largest-sphere-that-fits-inside-a-frustum
  const bbox = new THREE.Box3().setFromObject(mesh)
  const size = bbox.getSize()
  const actualRadius = size.length() / 2
  const alpha = (fov / 2) / 180 * Math.PI
  const Ly = Math.tan(alpha) * far
  const Lx = Ly * aspect
  const distance1 = (far - near) / 2
  const distance2 = Math.min(Lx, Ly) * Math.tan((Math.PI - 2 * alpha) / 4)
  const mustRadius = Math.min(distance1, distance2)
  const container = new THREE.Object3D()
  container.add(mesh)
  const scale = mustRadius / actualRadius
  mesh.position.set(
    (-bbox.min.x - size.x / 2),
    (-bbox.min.y - size.y / 2),
    (-bbox.min.z - size.z / 2)
  )
  container.scale.set(scale, scale, scale)
  const DISTANCE = far - mustRadius

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  const light = new THREE.DirectionalLight(0xffffff)
  const target = new THREE.Vector3(0, 0, 0)

  // const geo = new THREE.SphereGeometry(mustRadius, 12, 12)
  // const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  // const sphere = new THREE.Mesh(geo, mat)
  // scene.add(sphere)

  /**
   * Sets the position of camera and light
   * @param {Number} angle yaw
   * @returns {void}
   */
  function setAngle (angle) {
    const rad = angle / 180 * Math.PI
    const cos = Math.cos(rad) * DISTANCE
    const sin = Math.sin(rad) * DISTANCE
    camera.position.set(sin, 0, cos)
    light.position.set(sin, 0, cos)
    camera.lookAt(target)
    light.target.position.set(target.x, target.y, target.z)
  }
  setAngle(0)

  camera.up = new THREE.Vector3(0, 1, 0)

  scene.add(camera)
  scene.add(light)
  scene.add(container)

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
        setAngle: setAngle
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
