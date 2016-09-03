/* globals describe, it, before */
const ThreeExtensions = require('../lib/converters/ThreeExtensions')
const path = require('path')
const Polygon = require('../lib/converters/Polygon')
const PolygonExtensions = require('../lib/converters/PolygonExtensions')
const Vertex = require('../lib/converters/Vertex')

describe('PolygonExtensions', function () {
  const url = path.join(__dirname, 'data/cube/cube.png')
  var material

  before(function () {
    return ThreeExtensions.loadTexture(url)
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
    color.value.should.be.equal(0x00ff00)
  })
})
