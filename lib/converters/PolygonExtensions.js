const WeightedColor = require('./WeightedColor')
const Polygon = require('./Polygon')
const TriangleExtensions = require('./TriangleExtensions')
const ThreeExtensions = require('./ThreeExtensions')
const THREE = ThreeExtensions.THREE
const Vector2 = THREE.Vector2

const EPSILON = 0.00001

const Classification = {
  Coplanar: 0,
  Front: 1,
  Back: 2,
  Spanning: 3
}

// param polygon is a Polygon
// param plane is a THREE.Plane
// return Observable<{item: Polygon, isFront: boolean}>
module.exports.split = function * (polygon, plane) {
  function returnItem (newPolygon, isFront) {
    return {
      item: newPolygon,
      isFront: isFront
    }
  }

  // Classify each point as well as the entire polygon into one of the above
  // four classes.
  var polygonType = 0
  var types = []
  for (var vertexIndex = 0; vertexIndex < polygon.points.length; vertexIndex++) {
    var t = plane.normal.dot(polygon.points[vertexIndex].position) + plane.constant
    var type = (t < -EPSILON) ? Classification.Back : (t > EPSILON) ? Classification.Front : Classification.Coplanar
    polygonType |= type
    types.push(type)
  }

  // Put the polygon in the correct list, splitting it when necessary.
  switch (polygonType) {
    case Classification.Coplanar:
      yield returnItem(polygon, plane.normal.dot(polygon.normal) > 0)
      break
    case Classification.Front:
      yield returnItem(polygon, true)
      break
    case Classification.Back:
      yield returnItem(polygon, false)
      break
    case Classification.Spanning:
      const front = []
      const back = []
      for (var currentVertexIndex = 0; currentVertexIndex < polygon.points.length; currentVertexIndex++) {
        var nextVertexIndex = (currentVertexIndex + 1) % polygon.points.length
        var currentVertexType = types[currentVertexIndex]
        var nextVertexType = types[nextVertexIndex]
        var currentVertex = polygon.points[currentVertexIndex]
        var nextVertex = polygon.points[nextVertexIndex]
        if (currentVertexType !== Classification.Back) {
          front.push(currentVertex)
        }
        if (currentVertexType !== Classification.Front) {
          back.push(currentVertex)
        }
        if ((currentVertexType | nextVertexType) === Classification.Spanning) {
          var part = (-plane.constant - plane.normal.dot(currentVertex.position)) / plane.normal.dot(nextVertex.position.clone().sub(currentVertex.position))
          var intersectingVertex = currentVertex.lerp(nextVertex, part)
          front.push(intersectingVertex)
          back.push(intersectingVertex)
        }
      }
      if (front.length >= 3) {
        yield returnItem(new Polygon(polygon.material, front), true)
      }
      if (back.length >= 3) {
        yield returnItem(new Polygon(polygon.material, back), false)
      }
      break
  }
}

function toTextureTriangle (polygon, width, height) {
  if (polygon.points.length !== 3) {
    throw new Error('Convert only polygons with three points!')
  }
  width = width || 1
  height = height || 1
  return polygon.points.map(function (vertex) {
    return new Vector2(vertex.uv.x * (width - 1), vertex.uv.y * (height - 1))
  })
}

module.exports.getColor = function (polygon) {
  const result = new WeightedColor()
  const imageData = polygon.material.toImageData()
  const width = imageData.width
  const height = imageData.height
  const subPolygons = polygon.triangulate()
  subPolygons.forEach((subPolygon) => {
    const triangle = toTextureTriangle(subPolygon, width, height)
    const data = imageData.data
    for (var point of TriangleExtensions.rasterize(triangle)) {
      const x = point.x
      const y = point.y
      const index = (y * width + x) * 4
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      const color = (r << 16) + (g << 8) + (b << 0)
      result.add(color)
    }
  })
  return result
}
