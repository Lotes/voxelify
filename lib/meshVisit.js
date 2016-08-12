const nodeThree = require('./node-three/index')
const THREE = nodeThree.THREE
const Vertex = require('./Vertex')
const Face = require('./Face')

//visits each triangle of the mesh, pushing it into the visitorCallback
module.exports = function(mesh, visitorCallback) {
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
    function newVertex(index) {
      var vertex = v[index]
      var tex = uv[index]
      return new Vertex(vertex, tex, [0, 1, 0])
    }
    g.faces.forEach(function(face) {
      var a = newVertex(face.a)
      var b = newVertex(face.b)
      var c = newVertex(face.c)
      var material = child.material
      visitorCallback(new Face(a, b, c, material))
    })
  })
}
