const nodeThree = require('./node-three/index')
const THREE = nodeThree.THREE
const Vector3 = THREE.Vector3
const Vector2 = THREE.Vector2

class Vertex {
  //position is THREE.Vector3 or Number[3], uv is THREE.Vector2 or Number[2]
  constructor(position, uv) {
    if(Array.isArray(position))
      position = new Vector3(position[0], position[1], position[2])
    if(Array.isArray(uv))
      uv = new Vector2(uv[0], uv[1])
    this.position = position
    this.uv = uv
  }

  clone() {
    return new Vertex(
      this.position.clone(),
      this.uv.clone()
    )
  }

  //other is a Vertex, t is a Number between 0 and 1
  lerp(other, t) {
    return new Vertex(
      this.position.clone().lerp(other.position, t),
      this.uv.clone().lerp(other.uv, t)
    )
  }
}

module.exports = Vertex
