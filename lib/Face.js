const nodeThree = require('./node-three/index')
const THREE = nodeThree.THREE
const Vector3 = THREE.Vector3

const Classification = {
  Coplanar: 0,
  Front: 1,
  Back: 2,
  Spanning: 3
}

const EPSILON = 0.00001

class Face {
  //material is a THREE.Material
  //a, b, c are Vertex
  constructor(a, b, c, material) {
    this.a = a
    this.b = b
    this.c = c
    this.material = material
    this.points = [a, b, c]
    this.normal = new THREE.Plane().setFromCoplanarPoints(a.position, b.position, c.position).normal
  }
  //param plane is THREE.Plane
  //returns { front: Face[], back: Face[] }
  split(plane) {
    var result = {
      front: [],
      back: []
    }

    // Classify each point as well as the entire polygon into one of the above
    // four classes.
    var polygonType = 0;
    var types = [];
    for (var vertexIndex = 0; vertexIndex < this.points.length; vertexIndex++) {
      var t = plane.normal.dot(this.points[vertexIndex].position) + plane.constant
      var type = (t < -EPSILON) ? Classification.Back : (t > EPSILON) ? Classification.Front : Classification.Coplanar
      polygonType |= type
      types.push(type)
    }

    // Put the polygon in the correct list, splitting it when necessary.
    switch (polygonType) {
      case Classification.Coplanar:
        if(plane.normal.dot(this.normal) > 0)
          result.front.push(this)
        else
          result.back.push(this)
        break
      case Classification.Front:
        result.front.push(this)
        break
      case Classification.Back:
        result.back.push(this)
        break
      case Classification.Spanning:
        var front = [], back = [];
        for (var currentVertexIndex = 0; currentVertexIndex < this.points.length; currentVertexIndex++) {
          var nextVertexIndex = (currentVertexIndex + 1) % this.points.length
          var currentVertexType = types[currentVertexIndex]
          var nextVertexType = types[nextVertexIndex]
          var currentVertex = this.points[currentVertexIndex]
          var nextVertex = this.points[nextVertexIndex]
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
          result.front.push(new Face(front[0], front[1], front[2], this.material))
          if(front.length === 4)
            result.front.push(new Face(front[2], front[3], front[0], this.material))
        }
        if (back.length >= 3) {
          result.back.push(new Face(back[0], back[1], back[2], this.material))
          if(back.length === 4)
            result.back.push(new Face(back[2], back[3], back[0], this.material))
        }
        break
    }

    return result
  }
}

module.exports = Face
