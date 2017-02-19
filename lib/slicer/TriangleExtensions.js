'use strict'

const nodeThree = require('../shared/node-three/index')
const THREE = nodeThree.THREE
const Vector2 = THREE.Vector2

/**
* Fills a triangle whose bottom side is perfectly horizontal.
* Precondition is that v2 and v3 perform the flat side and that v1.y < v2.y, v3.y.
* @param {Array<THREE.Vector2>} triangle texture triangle with integer coordinates
* @param {Function} callback will be called for every pixel in triangle with its coordinates as Array<Number>
* @returns {void}
*/
function fillBottomFlatTriangle (triangle, callback) {
  const v1 = triangle[0]
  const v2 = triangle[1]
  const v3 = triangle[2]
  const slope1 = (v2.x - v1.x) / (v2.y - v1.y)
  const slope2 = (v3.x - v1.x) / (v3.y - v1.y)
  let x1 = v1.x
  let x2 = v1.x
  for (let y = v1.y; y <= v2.y; y++) {
    const x1R = Math.round(x1)
    const x2R = Math.round(x2)
    const minX = Math.min(x1R, x2R)
    const maxX = Math.max(x1R, x2R)
    for (let x = minX; x <= maxX; x++) {
      callback([x, y])
    }
    x1 += slope1
    x2 += slope2
  }
}

/**
* Fills a triangle whose top side is perfectly horizontal.
* Precondition is that v1 and v2 perform the flat side and that v3.y > v1.y, v2.y.
* @param {Array<THREE.Vector2>} triangle three points with integer coordinates
* @param {Boolean} includeFlatLine is a boolean, indicating that the base line should be also drawn
* @param {Function} callback will be called for every pixel in triangle with its coordinates as Array<Number>
* @returns {void}
*/
function fillTopFlatTriangle (triangle, includeFlatLine, callback) {
  const v1 = triangle[0]
  const v2 = triangle[1]
  const v3 = triangle[2]
  const slope1 = (v3.x - v1.x) / (v3.y - v1.y)
  const slope2 = (v3.x - v2.x) / (v3.y - v2.y)
  let x1 = v3.x
  let x2 = v3.x
  let test = y => y >= v1.y
  if (!includeFlatLine) {
    test = y => y > v1.y
  }
  for (let y = v3.y; test(y); y--) {
    const x1R = Math.round(x1)
    const x2R = Math.round(x2)
    const minX = Math.min(x1R, x2R)
    const maxX = Math.max(x1R, x2R)
    for (var x = minX; x <= maxX; x++) {
      callback([x, y])
    }
    x1 -= slope1
    x2 -= slope2
  }
}

/**
 * Returns all pixel coordinates inside the given triangle
 * @param {Array<THREE.Vector2|Array<Number>>} userTriangle the triangle
 * @param {Function} callback will be called for every pixel coordinate found in the triangle as Array<Number>
 * @returns {void}
 */
module.exports.rasterize = function (userTriangle, callback) {
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
    fillBottomFlatTriangle([v1, v2, v3], callback)
  /* check for trivial case of top-flat triangle */
  } else if (v1.y === v2.y) {
    fillTopFlatTriangle([v1, v2, v3], true, callback)
  } else {
    /* general case - split the triangle in a topflat and bottom-flat one */
    const vTmp = new Vector2(
        Math.round(v1.x + ((v2.y - v1.y) / (v3.y - v1.y)) * (v3.x - v1.x)),
        v2.y
    )
    fillBottomFlatTriangle([v1, v2, vTmp], callback)
    fillTopFlatTriangle([v2, vTmp, v3], false, callback)
  }
}
