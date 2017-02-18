/* globals describe, before, it */

'use strict'

const Voxelifier = require('../lib/slicer/Voxelifier')
const loadObj = require('../lib/loaders/ObjMatLoader')
const ThreeRenderExtensions = require('../lib/exporters/renderers/ThreeExtensions')
const path = require('path')
const fs = require('fs')
const GIFEncoder = require('gifencoder')
const Promise = require('bluebird')
const THREE = ThreeRenderExtensions.THREE
const exportMesh = require('../lib/exporters/exportMesh')
const exportGridContainer = require('../lib/slicer/exportGridContainer')
const Formats = require('../lib/formats/index')

describe('Voxelifier', function () {
  const url = path.join(__dirname, 'data/venusaur/Venusaur.obj')
  const RESULTS_DIRECTORY = path.join(__dirname, 'results')
  const size = 40

  let object

  before(function () {
    return loadObj(url)
      .then(function (obj) {
        object = obj
      })
  })

  it('should render all slices of given mesh', function () {
    this.timeout(40000)
    const fileName = path.join(RESULTS_DIRECTORY, 'voxel_map.zip')
    const voxelifier = new Voxelifier(object, new THREE.Quaternion(), size, true)
    const colorGrid = voxelifier.compute()
    const container = exportGridContainer(colorGrid)
    return Formats.save(container).then(buffer => {
      fs.writeFileSync(fileName, buffer)
    })
  })

  it('should render voxelified mesh', function () {
    this.timeout(40000)
    const voxelifier = new Voxelifier(object, new THREE.Quaternion(), size, true)
    const colorGrid = voxelifier.compute()
    const mesh = exportMesh(colorGrid)
    return ThreeRenderExtensions.normalizeSize(mesh)
      .then(function (normalizedMesh) {
        return ThreeRenderExtensions.captureByCamera(normalizedMesh, 600, 400)
      })
      .then(function (scene) {
        let out = fs.createWriteStream(path.join(RESULTS_DIRECTORY, 'voxel_mesh.png'))
        return scene.renderToStream(out)
      })
  })

  it('should render an animation of a voxelified mesh', function () {
    this.timeout(40000)
    const WIDTH = 600
    const HEIGHT = 400
    const voxelifier = new Voxelifier(object, new THREE.Quaternion(), size, true)
    const colorGrid = voxelifier.compute()
    const mesh = exportMesh(colorGrid)
    return ThreeRenderExtensions.normalizeSize(mesh)
      .then(function (mesh) {
        return ThreeRenderExtensions.captureByCamera(mesh, WIDTH, HEIGHT)
      })
      .then(function (scene) {
        let angles = []
        for (let angle = 0; angle < 360; angle += 20) {
          angles.push(angle)
        }

        let encoder = new GIFEncoder(WIDTH, HEIGHT)
        encoder.createReadStream().pipe(fs.createWriteStream(path.join(RESULTS_DIRECTORY, 'voxel_animated.gif')))

        encoder.start()
        encoder.setRepeat(0)   // 0 for repeat, -1 for no-repeat
        encoder.setDelay(50)  // frame delay in ms
        encoder.setQuality(10) // image quality. 10 is default.
        return Promise.each(angles, function (angle) {
          let rad = angle / 180 * Math.PI
          let cos = Math.cos(rad)
          let sin = Math.sin(rad)
          scene.camera.set(cos, 0, sin)
          return scene.renderToStream().then(function (context) {
            encoder.addFrame(context)
          })
        }).then(function () {
          encoder.finish()
        })
      })
  })
})
