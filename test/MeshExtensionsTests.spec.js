const nodeThree = require('../lib/node-three/index')
const THREE = nodeThree.THREE
const path = require('path')
const Promise = require('bluebird')
const fs = require('fs')
const MeshExtensions = require('../lib/MeshExtensions')

describe('MeshExtensions', function() {
  const url = path.join(__dirname, 'data/cube/cube.obj')
  var mesh

  beforeEach(function() {
    return nodeThree.loadOBJ(url)
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
