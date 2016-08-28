const Rx = require('rx')
const WeightedColor = require('./WeightedColor')
const Face = require('./Face')
const TriangleExtensions = require('./TriangleExtensions')
const nodeThree = require('./node-three/index')
const THREE = nodeThree.THREE
const Vector3 = THREE.Vector3
const Vector2 = THREE.Vector2

const EPSILON = 0.00001

const Classification = {
  Coplanar: 0,
  Front: 1,
  Back: 2,
  Spanning: 3
}

//param face i a Face
//param plane is a THREE.Plane
//return Observable<{item: Face, isFront: boolean}>
module.exports.split = function(face, plane) {
  return Rx.Observable.create(observer => {
    function next(newFace, isFront) {
      observer.onNext({
        item: newFace,
        isFront: isFront
      })
    }

    // Classify each point as well as the entire polygon into one of the above
    // four classes.
    var polygonType = 0;
    var types = [];
    for (var vertexIndex = 0; vertexIndex < face.points.length; vertexIndex++) {
      var t = plane.normal.dot(face.points[vertexIndex].position) + plane.constant
      var type = (t < -EPSILON) ? Classification.Back : (t > EPSILON) ? Classification.Front : Classification.Coplanar
      polygonType |= type
      types.push(type)
    }

    // Put the polygon in the correct list, splitting it when necessary.
    switch (polygonType) {
      case Classification.Coplanar:
        next(face, plane.normal.dot(face.normal) > 0)
        break
      case Classification.Front:
        next(face, true)
        break
      case Classification.Back:
        next(face, false)
        break
      case Classification.Spanning:
        var front = [], back = [];
        for (var currentVertexIndex = 0; currentVertexIndex < face.points.length; currentVertexIndex++) {
          var nextVertexIndex = (currentVertexIndex + 1) % face.points.length
          var currentVertexType = types[currentVertexIndex]
          var nextVertexType = types[nextVertexIndex]
          var currentVertex = face.points[currentVertexIndex]
          var nextVertex = face.points[nextVertexIndex]
          if (currentVertexType !== Classification.Back)
            front.push(currentVertex)
          if (currentVertexType !== Classification.Front)
            back.push(currentVertex)
          if ((currentVertexType | nextVertexType) === Classification.Spanning) {
            var part = (-plane.constant - plane.normal.dot(currentVertex.position)) / plane.normal.dot(nextVertex.position.clone().sub(currentVertex.position))
            var intersectingVertex = currentVertex.lerp(nextVertex, part)
            front.push(intersectingVertex)
            back.push(intersectingVertex)
          }
        }
        if (front.length >= 3) {
          next(new Face(front[0], front[1], front[2], face.material), true)
          if(front.length === 4)
            next(new Face(front[2], front[3], front[0], face.material), true)
        }
        if (back.length >= 3) {
          next(new Face(back[0], back[1], back[2], face.material), false)
          if(back.length === 4)
            next(new Face(back[2], back[3], back[0], face.material), false)
        }
        break
    }
    observer.onCompleted()
  })
}

function toTextureTriangle(face, width, height) {
  width = width || 1
  height = height || 1
  return face.points.map(function(vertex) {
    return new Vector2(vertex.uv.x * (width-1), (1-vertex.uv.y) * (height - 1))
  })
}

module.exports.getColor = function(face) {
  var result = new WeightedColor()
  const imageData = face.material.toImageData()
  const width = imageData.width
  const height = imageData.height
  const triangle = toTextureTriangle(face, width, height)
  const data = imageData.data
  TriangleExtensions.rasterize(triangle).subscribe(point => {
    const x = point.x
    const y = point.y
    const index = (y * width + x) * 4
    const r = data[index + 0]
    const g = data[index + 1]
    const b = data[index + 2]
    const color = (r << 16) + (g << 8) + (b << 0)
    result.add(color)
  })
  return result
}
