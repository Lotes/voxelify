const ThreeExtensions = require('./ThreeExtensions')
const THREE = ThreeExtensions.THREE
const Vertex = require('./Vertex')
const Polygon = require('./Polygon')

// visits each triangle of the mesh, pushing it into the result list
module.exports.getFaces = function (mesh) {
  var result = []
  mesh.updateMatrix()
  mesh.updateMatrixWorld()
  mesh.traverse(function (child) {
    if (!(child instanceof THREE.Mesh)) {
      return
    }
    if (!(child.material instanceof THREE.Material) || !child.material.map) {
      return
    }
    var g = child.geometry
    if (g === null) {
      return
    }
    if (!(g instanceof THREE.Geometry)) {
      g = new THREE.Geometry().fromBufferGeometry(g)
    }
    var v = g.vertices.map(function (vector) {
      return vector.clone()
        .applyMatrix4(child.matrix)
        .applyMatrix4(child.matrixWorld)
    })
    if (v.length === 0 || g.faceVertexUvs.length === 0) {
      return
    }
    var uv = g.faceVertexUvs[0]
    if (uv.length === 0) {
      return
    }
    function newVertex (vertexIndex, faceIndex, faceUvIndex, texture) {
      var vertex = v[vertexIndex]
      var tex = uv[faceIndex][faceUvIndex].clone()
      texture.transformUv(tex)
      return new Vertex(vertex, tex)
    }
    g.faces.forEach(function (face, faceIndex) {
      var material = child.material
      var texture = material.map
      var a = newVertex(face.a, faceIndex, 0, texture)
      var b = newVertex(face.b, faceIndex, 1, texture)
      var c = newVertex(face.c, faceIndex, 2, texture)
      result.push(new Polygon(material, [a, b, c]))
    })
  })
  return result
}
