const nodeThree = require('./node-three/index')
const THREE = nodeThree.THREE
const Vector3 = THREE.Vector3
const Vector2 = THREE.Vector2

class Vertex {
  //x, y, z, u, v are Number
  constructor(x, y, z, u, v) {
    this.position = new Vector3(x, y, z)
    this.uv = new Vector2(u, v)
  }
}

module.exports = Vertex
