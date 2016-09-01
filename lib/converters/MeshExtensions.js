const ThreeExtensions = require('./ThreeExtensions')
const THREE = ThreeExtensions.THREE
const Vertex = require('./Vertex')
const Face = require('./Face')

//visits each triangle of the mesh, pushing it into the visitorCallback
module.exports.getFaces = function(mesh) {
  var result = []
  mesh.updateMatrix()
  mesh.updateMatrixWorld()
  mesh.traverse(function(child) {
    if(!(child instanceof THREE.Mesh))
      return
    var g = child.geometry
    if(!(child.geometry instanceof THREE.Geometry))
      return
    var v = g.vertices.map(function(vector) {
      return vector.clone()
        .applyMatrix4(child.matrix)
        .applyMatrix4(child.matrixWorld)
    })
    if(v.length === 0 || g.faceVertexUvs.length === 0)
      return
    var uv = g.faceVertexUvs[0]
    if(uv.length === 0)
      return
    function newVertex(vertexIndex, faceIndex, faceUvIndex) {
      var vertex = v[vertexIndex]
      var tex = uv[faceIndex][faceUvIndex]
      return new Vertex(vertex, tex)
    }
    g.faces.forEach(function(face, faceIndex) {
      var a = newVertex(face.a, faceIndex, 0)
      var b = newVertex(face.b, faceIndex, 1)
      var c = newVertex(face.c, faceIndex, 2)
      var material = child.material
      result.push(new Face(a, b, c, material))
    })
  })
  return result
}
