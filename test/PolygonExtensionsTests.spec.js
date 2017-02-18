/* globals describe, it, before */

'use strict'

const nodeThree = require('../lib/shared/node-three/index')
const path = require('path')
const Polygon = require('../lib/slicer/Polygon')
const PolygonExtensions = require('../lib/slicer/PolygonExtensions')
const Vertex = require('../lib/slicer/Vertex')

describe('PolygonExtensions', function () {
  const url = path.join(__dirname, 'data/cube/cube.png')
  let material

  before(function () {
    return nodeThree.loadTexture(url)
      .then(function (texture) {
        material = texture
      })
  })

  it('should return green color', function () {
    const a = new Vertex([0, 0, 0], [0, 0])
    const b = new Vertex([0, 0, 1], [0, 1])
    const c = new Vertex([1, 0, 1], [1, 1])
    const polygon = new Polygon(material, [a, b, c])
    const color = PolygonExtensions.getColor(polygon)
    color.value.should.be.equal(0xff00ff00)
  })
})
