'use strict'

const ThreeExtensions = require('./ThreeExtensions')
const THREE = ThreeExtensions.THREE
const Vector3 = THREE.Vector3
const Vector2 = THREE.Vector2

/**
 * A vertex consists of 3 numbers (x, y, z) for the 3D position and 2 numbers (u, v) for the texture position
 */
class Vertex {
  /**
   * Creates a vertex
   * @param {THREE.Vector3|Array<Number>} positionArg 3D space coordinates
   * @param {THREE.Vector2|Array<Number>} uvArg texture coordinates
   */
  constructor (positionArg, uvArg) {
    let position = positionArg
    if (Array.isArray(position)) {
      position = new Vector3(position[0], position[1], position[2])
    }
    let uv = uvArg
    if (Array.isArray(uv)) {
      uv = new Vector2(uv[0], uv[1])
    }
    this.position = position
    this.uv = uv
  }

  /**
   * Clones itself
   * @returns {Vertex} a copy of this vertex
   */
  clone () {
    return new Vertex(
      this.position.clone(),
      this.uv.clone()
    )
  }

  /**
   * Linearly interpolates this vertex in relation to `other` where `t` is a fraction
   * @param {Vertex} other the destination vertex for interpolating
   * @param {Number} t a fraction between 0 and 1
   * @returns {Vertex} returns the new vertex
   */
  lerp (other, t) {
    return new Vertex(
      this.position.clone().lerp(other.position, t),
      this.uv.clone().lerp(other.uv, t)
    )
  }
}

module.exports = Vertex
