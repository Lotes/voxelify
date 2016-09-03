/* globals describe, it, before */
const ThreeExtensions = require('../lib/converters/ThreeExtensions')
const path = require('path')
const Face = require('../lib/converters/Face')
const FaceExtensions = require('../lib/converters/FaceExtensions')
const Vertex = require('../lib/converters/Vertex')

describe('FaceExtensions', function () {
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
    const face = new Face(a, b, c, material)
    const color = FaceExtensions.getColor(face)
    color.value.should.be.equal(0x00ff00)
  })
})
