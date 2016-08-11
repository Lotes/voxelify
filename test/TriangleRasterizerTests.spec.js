const nodeThree = require('../lib/node-three/index')
const Vertex = require('../lib/Vertex')
const Triangle = require('../lib/Triangle')
const TriangleRasterizer = require('../lib/TriangleRasterizer')
const path = require('path')
const should = require('should')

describe('TriangleRasterizer', function() {
  var material
  const createVertex = function(uv) {
    return new Vertex([0, 0, 0], uv)
  }
  const createTriangle = function(a, b, c) {
    return new Triangle(
      createVertex(a),
      createVertex(b),
      createVertex(c),
      material
    )
  }
  const url = path.join(__dirname, 'data/cube/cube.png')

  before(function() {
    return nodeThree.loadTexture(url)
      .then(function(texture) {
        material = texture
      })
  })

  it('should visit all expected pixels for top flat triangle', function() {
    /*
      XXXX
      XXX
      XX
      X
    */
    const triangle = createTriangle([0, 0], [3, 0], [0, 3])
    const rasterizer = new TriangleRasterizer(triangle)
    var count = 0
    rasterizer.rasterize(function(x, y) {
      x.should.be.within(0, 3)
      y.should.be.within(0, 3)
      count++
    })
    count.should.be.equal(10)
  })

  it('should visit all expected pixels for bottom flat triangle', function() {
    /*
      X
      XX
      XXX
      XXXX
    */
    const triangle = createTriangle([0, 0], [3, 0], [3, 3])
    const rasterizer = new TriangleRasterizer(triangle)
    var count = 0
    rasterizer.rasterize(function(x, y) {
      x.should.be.within(0, 3)
      y.should.be.within(0, 3)
      count++
    })
    count.should.be.equal(10)
  })

  it('should visit all expected pixels for left flat triangle', function() {
    /*
      X
      XX
      XXX
      XXXX
      XXX
      XX
      X
    */
    const triangle = createTriangle([0, 0], [3, 3], [0, 6])
    const rasterizer = new TriangleRasterizer(triangle)
    var count = 0
    rasterizer.rasterize(function(x, y) {
      x.should.be.within(0, 3)
      y.should.be.within(0, 6)
      count++
    })
    count.should.be.equal(16)
  })

  it('should visit all expected pixels for thin triangle', function() {
    /*
      X
      X
      XX
      XX
      XXX
      XXX
    */
    const triangle = createTriangle([0, 0], [0, 5], [2, 5])
    const rasterizer = new TriangleRasterizer(triangle)
    var count = 0
    rasterizer.rasterize(function(x, y) {
      x.should.be.within(0, 2)
      y.should.be.within(0, 5)
      count++
    })
    count.should.be.equal(12)
  })
})
