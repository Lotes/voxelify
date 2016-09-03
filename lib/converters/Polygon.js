const ThreeExtensions = require('./ThreeExtensions')
const Vertex = require('./Vertex')
const THREE = ThreeExtensions.THREE
const Plane = THREE.Plane

// a CONVEX (!) polygon
class Polygon {
  // material is a THREE.Material
  // points are [Vertex], there must be at least three non-colinear points
  constructor (material, points) {
    this.material = material
    if (points.length < 3) {
      throw new Error('You need at least three vertices to form a polygon!')
    }
    if (points.some(pt => !(pt instanceof Vertex))) {
      throw new Error('All points must be of type "Vertex"!')
    }
    this.points = points
    this.normal = new Plane().setFromCoplanarPoints(points[0].position, points[1].position, points[2].position).normal
  }
  triangulate () {
    const result = []
    const first = this.points[0]
    var a = this.points[1]
    var b = this.points[2]
    var index = 3
    while (true) {
      result.push(new Polygon(this.material, [first, a, b]))
      if (index >= this.points.length) {
        break
      }
      a = b
      b = this.points[index]
      index++
    }
    return result
  }
}

module.exports = Polygon
