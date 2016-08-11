const nodeThree = require('../lib/node-three/index')
const THREE = nodeThree.THREE
const path = require('path')
const Promise = require('bluebird')
const fs = require('fs')
const meshVisit = require('../lib/meshVisit')

describe('Mesh visitor', function() {
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
    meshVisit(mesh, function(triangle) {
      count++
    })
    count.should.be.equal(12)
  })

  /*it('should get bounding box of all cube triangles', function() {
    const bbox = new THREE.Box3().setFromObject(mesh)
    mesh.position.set(-bbox.min.x, -bbox.min.y, -bbox.min.z)
    const obj = new THREE.Object3D()
    obj.add(mesh)
    obj.scale.set(1, 2, 3)
    meshVisit(obj, function(triangle) {
      const box = new THREE.Box3()
        .setFromPoints(triangle.points.map(function(vertex) {
          return vertex.position
        }))
    })
  })*/
})
