/* globals describe, before, it */

'use strict'

const Voxelifier = require('../lib/converters/Voxelifier')
const ThreeLoaderExtensions = require('../lib/converters/ThreeExtensions')
const ThreeRenderExtensions = require('../lib/exporters/renderers/ThreeExtensions')
const path = require('path')
const fs = require('fs')
const GIFEncoder = require('gifencoder')
const Promise = require('bluebird')

describe('Voxelifier', function () {
  const url = path.join(__dirname, 'data/dk2/DolDonkeykongR1.obj') // 'data/venusaur/Venusaur.obj'
  const RESULTS_DIRECTORY = path.join(__dirname, 'results')
  const size = 40

  var object

  before(function () {
    return ThreeLoaderExtensions.loadOBJ(url)
      .then(function (obj) {
        object = obj
      })
  })

  it('should render all slices of given mesh', function () {
    this.timeout(40000)
    const fileName = path.join(RESULTS_DIRECTORY, 'voxel_map.png')
    const voxelifier = new Voxelifier({
      object: object,
      size: size
    })
    const colorGrid = voxelifier.compute()
    return colorGrid.save(fileName)
  })

  it('should render voxelified mesh', function () {
    this.timeout(40000)
    const voxelifier = new Voxelifier({
      object: object,
      size: size
    })
    const colorGrid = voxelifier.compute()
    const mesh = colorGrid.toMesh()
    return ThreeRenderExtensions.normalizeSize(mesh)
      .then(function (normalizedMesh) {
        return ThreeRenderExtensions.captureByCamera(normalizedMesh, 600, 400)
      })
      .then(function (scene) {
        var out = fs.createWriteStream(path.join(RESULTS_DIRECTORY, 'voxel_mesh.png'))
        return scene.renderToStream(out)
      })
  })

  it('should render an animation of a voxelified mesh', function () {
    this.timeout(40000)
    const WIDTH = 600
    const HEIGHT = 400
    const voxelifier = new Voxelifier({
      object: object,
      size: size
    })
    const colorGrid = voxelifier.compute()
    const mesh = colorGrid.toMesh()
    return ThreeRenderExtensions.normalizeSize(mesh)
      .then(function (mesh) {
        return ThreeRenderExtensions.captureByCamera(mesh, WIDTH, HEIGHT)
      })
      .then(function (scene) {
        var angles = []
        for (var angle = 0; angle < 360; angle += 20) {
          angles.push(angle)
        }

        var encoder = new GIFEncoder(WIDTH, HEIGHT)
        encoder.createReadStream().pipe(fs.createWriteStream(path.join(RESULTS_DIRECTORY, 'voxel_animated.gif')))

        encoder.start()
        encoder.setRepeat(0)   // 0 for repeat, -1 for no-repeat
        encoder.setDelay(50)  // frame delay in ms
        encoder.setQuality(10) // image quality. 10 is default.
        return Promise.each(angles, function (angle) {
          var rad = angle / 180 * Math.PI
          var cos = Math.cos(rad)
          var sin = Math.sin(rad)
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
