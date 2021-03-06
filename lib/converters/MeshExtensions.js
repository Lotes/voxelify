'use strict'

const ThreeExtensions = require('./ThreeExtensions')
const THREE = ThreeExtensions.THREE
const Vertex = require('./Vertex')
const Polygon = require('./Polygon')

// visits each triangle of the mesh, pushing it into the result list
module.exports.getFaces = function (mesh) {
  let result = []
  mesh.updateMatrix()
  mesh.updateMatrixWorld()
  mesh.traverse(function (child) {
    if (!(child instanceof THREE.Mesh)) {
      return
    }
    if (!(child.material instanceof THREE.Material) || !child.material.map) {
      return
    }
    let g = child.geometry
    if (g === null) {
      return
    }
    if (!(g instanceof THREE.Geometry)) {
      g = new THREE.Geometry().fromBufferGeometry(g)
    }
    let v = g.vertices.map(function (vector) {
      return vector.clone()
        .applyMatrix4(child.matrix)
        .applyMatrix4(child.matrixWorld)
    })
    if (v.length === 0 || g.faceVertexUvs.length === 0) {
      return
    }
    let uv = g.faceVertexUvs[0]
    if (uv.length === 0) {
      return
    }
    /**
     * Creates a new vertex
     * @param {Number} vertexIndex an integer addressing a vertex in an array
     * @param {Number} faceIndex an integer addressing a face in an array
     * @param {Number} faceUvIndex an integer addressing uv coordinates in an array
     * @param {THREE.Texture} texture the texture for transforming uv coordinates
     * @returns {Vertex} the new Vertex
     */
    function newVertex (vertexIndex, faceIndex, faceUvIndex, texture) {
      let vertex = v[vertexIndex]
      let tex = uv[faceIndex][faceUvIndex].clone()
      texture.transformUv(tex)
      return new Vertex(vertex, tex)
    }
    g.faces.forEach(function (face, faceIndex) {
      let material = child.material
      let texture = material.map
      let a = newVertex(face.a, faceIndex, 0, texture)
      let b = newVertex(face.b, faceIndex, 1, texture)
      let c = newVertex(face.c, faceIndex, 2, texture)
      result.push(new Polygon(material, [a, b, c]))
    })
  })
  return result
}
