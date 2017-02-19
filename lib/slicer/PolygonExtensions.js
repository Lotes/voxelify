'use strict'

const WeightedColor = require('./WeightedColor')
const Polygon = require('./Polygon')
const TriangleExtensions = require('./TriangleExtensions')
const nodeThree = require('../shared/node-three/index')
const THREE = nodeThree.THREE
const Vector2 = THREE.Vector2

const EPSILON = 0.00001

const Classification = {
  Coplanar: 0,
  Front: 1,
  Back: 2,
  Spanning: 3
}

/**
 * Splits a convex polygon along the given plane.
 * @param {Polygon} polygon the polygon you want to split
 * @param {THREE.Plane} plane the plane along which the polygon gets splitted
 * @param {Function} returnItem callback (item: Polygon, isFront: Boolean)
 * @returns {void}
 */
function split (polygon, plane, returnItem) {
  // Classify each point as well as the entire polygon into one of the above
  // four classes.
  let polygonType = 0
  let types = []
  for (let vertexIndex = 0; vertexIndex < polygon.points.length; vertexIndex++) {
    let t = plane.normal.dot(polygon.points[vertexIndex].position) + plane.constant
    let type = (t < -EPSILON)
      ? Classification.Back
      : (t > EPSILON)
        ? Classification.Front
        : Classification.Coplanar
    polygonType |= type
    types.push(type)
  }

  // Put the polygon in the correct list, splitting it when necessary.
  switch (polygonType) {
    case Classification.Coplanar:
      returnItem(polygon, plane.normal.dot(polygon.normal) > 0)
      break
    case Classification.Front:
      returnItem(polygon, true)
      break
    case Classification.Back:
      returnItem(polygon, false)
      break
    default: { // Classification.Spanning
      const front = []
      const back = []
      for (let currentVertexIndex = 0; currentVertexIndex < polygon.points.length; currentVertexIndex++) {
        let nextVertexIndex = (currentVertexIndex + 1) % polygon.points.length
        let currentVertexType = types[currentVertexIndex]
        let nextVertexType = types[nextVertexIndex]
        let currentVertex = polygon.points[currentVertexIndex]
        let nextVertex = polygon.points[nextVertexIndex]
        if (currentVertexType !== Classification.Back) {
          front.push(currentVertex)
        }
        if (currentVertexType !== Classification.Front) {
          back.push(currentVertex)
        }
        if ((currentVertexType | nextVertexType) === Classification.Spanning) {
          let part = (-plane.constant - plane.normal.dot(currentVertex.position)) / plane.normal.dot(nextVertex.position.clone().sub(currentVertex.position))
          let intersectingVertex = currentVertex.lerp(nextVertex, part)
          front.push(intersectingVertex)
          back.push(intersectingVertex)
        }
      }
      if (front.length >= 3) {
        returnItem(new Polygon(polygon.material, front), true)
      }
      if (back.length >= 3) {
        returnItem(new Polygon(polygon.material, back), false)
      }
      break
    }
  }
}

/**
 * Converts a 3-vertex-polygon into a THREE.Vector2 array with texture related coordinates
 * @param {Polygon} polygon must have only three vertices!
 * @param {Number} width integer width of texture
 * @param {Number} height integer height of texture
 * @returns {Array<THREE.Vector2>} the texture triangle
 */
function toTextureTriangle (polygon, width, height) {
  if (polygon.points.length !== 3) {
    throw new Error('Convert only polygons with three points!')
  }
  let w = width || 1
  let h = height || 1
  return polygon.points.map(function (vertex) {
    return new Vector2(
      vertex.uv.x * (w - 1),
      vertex.uv.y * (h - 1)
    )
  })
}

module.exports.getColor = function (polygon) {
  const result = new WeightedColor()
  const imageData = polygon.material.toImageData()
  const width = imageData.width
  const height = imageData.height
  const subPolygons = polygon.triangulate()
  subPolygons.forEach(subPolygon => {
    const triangle = toTextureTriangle(subPolygon, width, height)
    const data = imageData.data
    TriangleExtensions.rasterize(triangle, point => {
      const x = point[0]
      const y = point[1]
      const index = (y * width + x) * 4
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      const color = (r << 16) + (g << 8) + (b << 0)
      result.add(color)
    })
  })
  return result
}

module.exports.split = split
