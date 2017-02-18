/* globals describe, beforeEach, it */

'use strict'

const load = require('../lib/loaders/index')
const path = require('path')
const MeshExtensions = require('../lib/slicer/MeshExtensions')

describe('MeshExtensions', function () {
  const url = path.join(__dirname, 'data/cube/cube.obj')
  let mesh

  beforeEach(function () {
    return load('obj', url)
      .then(function (object) {
        mesh = object
      })
  })

  it('should visit all 12 triangles of the cube', function () {
    MeshExtensions.getFaces(mesh).length.should.be.equal(12)
  })
})
