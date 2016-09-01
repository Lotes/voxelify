const ThreeExtensions = require('../lib/converters/ThreeExtensions')
const THREE = ThreeExtensions.THREE
const path = require('path')
const Promise = require('bluebird')
const fs = require('fs')
const MeshExtensions = require('../lib/converters/MeshExtensions')

describe('MeshExtensions', function() {
  const url = path.join(__dirname, 'data/cube/cube.obj')
  var mesh

  beforeEach(function() {
    return ThreeExtensions.loadOBJ(url)
      .then(function(object) {
        mesh = object
      })
  })

  it('should visit all 12 triangles of the cube', function() {
    var count = 0
    MeshExtensions.getFaces(mesh).subscribe(() => count++)
    count.should.be.equal(12)
  })
})
