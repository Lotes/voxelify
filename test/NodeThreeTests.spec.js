/* globals describe, it */

'use strict'

const load = require('../lib/loaders/index')
const ThreeRenderExtensions = require('../lib/exporters/renderers/ThreeExtensions')
const THREE = ThreeRenderExtensions.THREE
const path = require('path')
const fs = require('fs')

describe('THREE basics', function () {
  const url = path.join(__dirname, 'data/venusaur/Venusaur.obj')
  const RESULTS_DIRECTORY = path.join(__dirname, 'results')

  it('should load OBJ file', function () {
    this.timeout(1000)
    return load('obj', url)
      .then(function (object) {
        object.should.be.ok()
      })
  })

  it('should transform OBJ', function () {
    this.timeout(1000)
    return load('obj', url)
      .then(ThreeRenderExtensions.normalizeSize)
      .then(function (mesh) {
        const epsilon = 0.00001
        var box = new THREE.Box3().setFromObject(mesh)
        var size = box.getSize()
        size.x.should.not.be.above(1 + epsilon)
        size.y.should.not.be.above(1 + epsilon)
        size.z.should.not.be.above(1 + epsilon)
      })
  })

  it('should render scene', function () {
    this.timeout(10000)
    return load('obj', url)
      .then(ThreeRenderExtensions.normalizeSize)
      .then(function (mesh) {
        return ThreeRenderExtensions.captureByCamera(mesh, 600, 400)
      })
      .then(function (scene) {
        var out = fs.createWriteStream(path.join(RESULTS_DIRECTORY, 'render.png'))
        return scene.renderToStream(out)
      })
  })
})
