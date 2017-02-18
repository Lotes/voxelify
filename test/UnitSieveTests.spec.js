/* globals describe, before, it */

'use strict'

const nodeThree = require('../lib/shared/node-three/index')
const THREE = nodeThree.THREE
const Box3 = THREE.Box3
const Vector3 = THREE.Vector3
const UnitSieve = require('../lib/slicer/UnitSieve')
const Polygon = require('../lib/slicer/Polygon')
const PolygonExtensions = require('../lib/slicer/PolygonExtensions')
const Vertex = require('../lib/slicer/Vertex')
const path = require('path')

describe('UnitSieve', function () {
  const url = path.join(__dirname, 'data/cube/cube.png')
  var material

  before(function () {
    return nodeThree.loadTexture(url)
      .then(function (texture) {
        material = texture
      })
  })

  it('should split face leaving one empty voxel', function () {
    /*
     | X

         |XX
      ------
        X|XX
       XX|XX
    */
    const sieve = new UnitSieve(new Box3(new Vector3(0, 0, 0), new Vector3(2, 2, 1)))
    const a = new Vertex([0, 0, 0], [0, 0])
    const b = new Vertex([2, 0, 0], [1, 0])
    const c = new Vertex([2, 2, 0], [1, 1])
    const polygon = new Polygon(material, [a, b, c])
    for (var item of sieve.sieveWith(polygon, PolygonExtensions.split)) {
      if (item.box.min.x === 0 && item.box.min.y === 1) {
        item.item.should.be.empty()
      }
    }
  })
})
