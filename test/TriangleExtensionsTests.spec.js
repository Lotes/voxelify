const TriangleExtensions = require('../lib/converters/TriangleExtensions')
const should = require('should')

describe('TriangleExtensions', function() {
  const shouldHaveNPixels = function(triangle, n) {
    var count = 0
    for(var point of TriangleExtensions.rasterize(triangle))
      count++
    count.should.be.equal(n)
  }

  it('should visit all expected pixels for top flat triangle', function() {
    /*
      XXXX
      XXX
      XX
      X
    */
    shouldHaveNPixels([[0, 0], [3, 0], [0, 3]], 10)
  })

  it('should visit all expected pixels for bottom flat triangle', function() {
    /*
      X
      XX
      XXX
      XXXX
    */
    shouldHaveNPixels([[0, 0], [3, 0], [3, 3]], 10)
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
    shouldHaveNPixels([[0, 0], [3, 3], [0, 6]], 16)
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
    shouldHaveNPixels([[0, 0], [0, 5], [2, 5]], 12)
  })
})
