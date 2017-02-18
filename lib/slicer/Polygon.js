'use strict'

const nodeThree = require('../shared/node-three/index')
const Vertex = require('./Vertex')
const THREE = nodeThree.THREE
const Plane = THREE.Plane

/**
 * A convex(!) polygon that can be triangulated
 */
class Polygon {
  /**
   * Creates a polygon
   * @param {THREE.Material} material a texture actually
   * @param {Array<Vertex>} points >=3 non-colinear vertices form a polygon
   */
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

  /**
   * Splits the polygon into triangles
   * @returns {Array<Polygon>} a list of 3-Vertex-Polygons
   */
  triangulate () {
    const result = []
    const first = this.points[0]
    let a = this.points[1]
    let b = this.points[2]
    let index = 3
    for (;;) {
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
