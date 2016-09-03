const ThreeExtensions = require('./ThreeExtensions')
const THREE = ThreeExtensions.THREE
const Vector2 = THREE.Vector2

/**
* Fills a triangle whose bottom side is perfectly horizontal.
* Precondition is that v2 and v3 perform the flat side and that v1.y < v2.y, v3.y.
* @param triangle is a THREE.Vector2[3]
* @yields Vector2
*/
function * fillBottomFlatTriangle (triangle) {
  const v1 = triangle[0]
  const v2 = triangle[1]
  const v3 = triangle[2]
  const slope1 = (v2.x - v1.x) / (v2.y - v1.y)
  const slope2 = (v3.x - v1.x) / (v3.y - v1.y)
  var x1 = v1.x
  var x2 = v1.x
  for (var y = v1.y; y <= v2.y; y++) {
    const x1R = Math.round(x1)
    const x2R = Math.round(x2)
    const minX = Math.min(x1R, x2R)
    const maxX = Math.max(x1R, x2R)
    for (var x = minX; x <= maxX; x++) {
      yield new Vector2(x, y)
    }
    x1 += slope1
    x2 += slope2
  }
}

/**
* Fills a triangle whose top side is perfectly horizontal.
* Precondition is that v1 and v2 perform the flat side and that v3.y > v1.y, v2.y.
* @param triangle is a THREE.Vector2[3]
* @param includeFlatLine is a boolean, indicating that the base line should be also drawn
* @yields Vector2
*/
function * fillTopFlatTriangle (triangle, includeFlatLine) {
  const v1 = triangle[0]
  const v2 = triangle[1]
  const v3 = triangle[2]
  const slope1 = (v3.x - v1.x) / (v3.y - v1.y)
  const slope2 = (v3.x - v2.x) / (v3.y - v2.y)
  var x1 = v3.x
  var x2 = v3.x
  for (var y = v3.y; includeFlatLine ? (y >= v1.y) : (y > v1.y); y--) {
    const x1R = Math.round(x1)
    const x2R = Math.round(x2)
    const minX = Math.min(x1R, x2R)
    const maxX = Math.max(x1R, x2R)
    for (var x = minX; x <= maxX; x++) {
      yield new Vector2(x, y)
    }
    x1 -= slope1
    x2 -= slope2
  }
}

// rasterizes a triangle
// param: triangle is a Vector2[3] or Number[2][3]
// yields: Vector2 with all pixel coordinates in the given triangle
module.exports.rasterize = function * (userTriangle) {
  const triangle = userTriangle.map(function (uv) {
    if (uv instanceof Vector2) return uv
    if (Array.isArray(uv)) return new Vector2(uv[0], uv[1])
    throw new Error('No valid coordinate!')
  })
  .map(function (uv) {
    return new Vector2(Math.round(uv.x), Math.round(uv.y))
  })
  .sort(function (lhs, rhs) {
    return lhs.y - rhs.y
  })
  const v1 = triangle[0]
  const v2 = triangle[1]
  const v3 = triangle[2]
  /* here we know that v1.y <= v2.y <= v3.y */
  /* check for trivial case of bottom-flat triangle */
  if (v2.y === v3.y) {
    yield * fillBottomFlatTriangle([v1, v2, v3])
  /* check for trivial case of top-flat triangle */
  } else if (v1.y === v2.y) {
    yield * fillTopFlatTriangle([v1, v2, v3], true)
  } else {
    /* general case - split the triangle in a topflat and bottom-flat one */
    const vTmp = new Vector2(
        Math.round(v1.x + ((v2.y - v1.y) / (v3.y - v1.y)) * (v3.x - v1.x)),
        v2.y
    )
    yield * fillBottomFlatTriangle([v1, v2, vTmp])
    yield * fillTopFlatTriangle([v2, vTmp, v3], false)
  }
}
