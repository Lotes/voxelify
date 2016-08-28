const nodeThree = require('./node-three/index')
const THREE = nodeThree.THREE
const Plane = THREE.Plane

class Face {
  //material is a THREE.Material
  //a, b, c are Vertex
  constructor(a, b, c, material) {
    this.material = material
    this.a = a
    this.b = b
    this.c = c
    this.points = [a, b, c]
    this.normal = new Plane().setFromCoplanarPoints(a.position, b.position, c.position).normal
  }
}

module.exports = Face
