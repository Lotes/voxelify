const nodeThree = require('./node-three/index')
const THREE = nodeThree.THREE
const Vector2 = THREE.Vector2

class TriangleRasterizer {
  //param: triangle is Vector2[3] or Number[2][3]
  //param: scale is Vector2, default is {x: 1, y: 1}
  constructor(triangle, scale) {
    scale = scale || new Vector2(1, 1)
    this.points = triangle.map(function(uv) {
      if(uv instanceof Vector2)
        return uv
      else if(Array.isArray(uv))
        return new Vector2(uv[0], uv[1])
      throw new Error('No valid coordinate!')
    })
    .map(function(uv) {
      return new Vector2(Math.round(uv.x * scale.x), Math.round(uv.y * scale.y))
    })
    .sort(function(lhs, rhs) {
      return lhs.y - rhs.y
    })
  }

  /**
  * Fills a triangle whose bottom side is perfectly horizontal.
  * Precondition is that v2 and v3 perform the flat side and that v1.y < v2.y, v3.y.
  * @param g Graphics object
  * @param v1 first vertice, has the smallest y-coordinate
  * @param v2 second vertice
  * @param v3 third vertice
  */
  fillBottomFlatTriangle(points, callback) {
    const v1 = points[0]
    const v2 = points[1]
    const v3 = points[2]
    const slope1 = (v2.x - v1.x) / (v2.y - v1.y);
    const slope2 = (v3.x - v1.x) / (v3.y - v1.y);
    var x1 = v1.x;
    var x2 = v1.x;
    for (var y = v1.y; y <= v2.y; y++) {
      const x1R = Math.round(x1)
      const x2R = Math.round(x2)
      const minX = Math.min(x1R, x2R)
      const maxX = Math.max(x1R, x2R)
      for (var x = minX; x <= maxX; x++)
        callback(x, y)
      x1 += slope1
      x2 += slope2
    }
  }

  /**
  * Fills a triangle whose top side is perfectly horizontal.
  * Precondition is t2hat v1 and v2 perform the flat side and that v3.y > v1.y, v2.y.
  * @param g Graphics object
  * @param v1 first vertice
  * @param v2 second vertice
  * @param v3 third vertice, has the largest y-coordinate
  */
  fillTopFlatTriangle(points, includeFlatLine, callback) {
    const v1 = points[0]
    const v2 = points[1]
    const v3 = points[2]
    const slope1 = (v3.x - v1.x) / (v3.y - v1.y)
    const slope2 = (v3.x - v2.x) / (v3.y - v2.y)
    var x1 = v3.x
    var x2 = v3.x
    for (var y = v3.y; includeFlatLine ? (y >= v1.y) : (y > v1.y); y--) {
      const x1R = Math.round(x1)
      const x2R = Math.round(x2)
      const minX = Math.min(x1R, x2R)
      const maxX = Math.max(x1R, x2R)
      for (var x = minX; x <= maxX; x++)
        callback(x, y)
      x1 -= slope1
      x2 -= slope2
    }
  }

  //param: Function callback(x, y) will be called for each visited pixel
  rasterize(callback) {
    const v1 = this.points[0]
    const v2 = this.points[1]
    const v3 = this.points[2]
    /* here we know that v1.y <= v2.y <= v3.y */
    /* check for trivial case of bottom-flat triangle */
    if (v2.y === v3.y)
      this.fillBottomFlatTriangle([v1, v2, v3], callback)
    /* check for trivial case of top-flat triangle */
    else if (v1.y === v2.y)
      this.fillTopFlatTriangle([v1, v2, v3], true, callback);
    else {
      /* general case - split the triangle in a topflat and bottom-flat one */
      const vTmp = new Vector2(
          Math.round(v1.x + ((v2.y - v1.y) / (v3.y - v1.y)) * (v3.x - v1.x)),
          v2.y
      )
      this.fillBottomFlatTriangle([v1, v2, vTmp], callback)
      this.fillTopFlatTriangle([v2, vTmp, v3], false, callback)
    }
  }
}

module.exports = TriangleRasterizer
