/* globals describe, before, it */

'use strict'

const Voxelifier = require('../lib/slicer/Voxelifier')
const load = require('../lib/loaders/index')
const ThreeRenderExtensions = require('../lib/exporters/renderers/ThreeExtensions')
const path = require('path')
const fs = require('fs')
const GIFEncoder = require('gifencoder')
const Promise = require('bluebird')
const THREE = ThreeRenderExtensions.THREE
const Formats = require('../lib/formats/index')

describe('Voxelifier', function () {
  const url = path.join(__dirname, 'data/venusaur/Venusaur.obj') // 'data/cube/cube.obj'
  const RESULTS_DIRECTORY = path.join(__dirname, 'results')
  const size = 30

  let object

  before(function () {
    return load('obj', url)
      .then(function (obj) {
        object = obj
      })
  })

  it('should render all slices of given mesh', function () {
    this.timeout(60000)
    const fileName = path.join(RESULTS_DIRECTORY, 'voxel_map.zip')
    const voxelifier = new Voxelifier(object, new THREE.Quaternion(), size, true)
    const container = voxelifier.compute()
    return Formats.save(container).then(buffer => {
      fs.writeFileSync(fileName, buffer)
    })
  })

  it('should render voxelified mesh', function () {
    this.timeout(60000)
    const voxelifier = new Voxelifier(object, new THREE.Quaternion(), size, true)
    const container = voxelifier.compute()
    const mesh = Formats.toMesh(container)
    return ThreeRenderExtensions.captureByCamera(mesh, 600, 400)
      .then(function (scene) {
        let out = fs.createWriteStream(path.join(RESULTS_DIRECTORY, 'voxel_mesh.png'))
        return scene.renderToStream(out)
      })
  })

  it('should render an animation of a voxelified mesh', function () {
    this.timeout(60000)
    const WIDTH = 600
    const HEIGHT = 400
    const voxelifier = new Voxelifier(object, new THREE.Quaternion(), size, true)
    const container = voxelifier.compute()
    const mesh = Formats.toMesh(container)
    return ThreeRenderExtensions.captureByCamera(mesh, WIDTH, HEIGHT)
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
          scene.camera.setAngle(angle)
          return scene.renderToStream().then(function (context) {
            encoder.addFrame(context)
          })
        }).then(function () {
          encoder.finish()
        })
      })
  })
})
