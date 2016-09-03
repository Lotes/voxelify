/* globals describe, beforeEach, it */

const ThreeExtensions = require('../lib/converters/ThreeExtensions')
const path = require('path')
const MeshExtensions = require('../lib/converters/MeshExtensions')

describe('MeshExtensions', function () {
  const url = path.join(__dirname, 'data/cube/cube.obj')
  var mesh

  beforeEach(function () {
    return ThreeExtensions.loadOBJ(url)
      .then(function (object) {
        mesh = object
      })
  })

  it('should visit all 12 triangles of the cube', function () {
    MeshExtensions.getFaces(mesh).length.should.be.equal(12)
  })
})
