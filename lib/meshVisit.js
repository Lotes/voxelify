const nodeThree = require('./node-three/index')
const THREE = nodeThree.THREE

class Vertex {
  //x, y, z, u, v are Number
  constructor(x, y, z, u, v) {
    this.x = x
    this.y = y
    this.z = z
    this.u = u
    this.v = v
  }
}

class Triangle {
  //material is a THREE.Material
  //a, b, c are Vertex
  constructor(a, b, c, material) {
    this.a = a
    this.b = b
    this.c = c
    this.material = material
  }
}

//visits each triangle of the mesh, pushing it into the visitorCallback
module.exports = function(mesh, visitorCallback) {
  mesh.updateMatrix()
  mesh.traverse(function(child) {
    if(!(child instanceof THREE.Mesh))
      return
    var g = child.geometry
    if(!(child.geometry instanceof THREE.Geometry))
      return
    var v = g.vertices
    if(v.length === 0 || g.faceVertexUvs.length === 0)
      return
    var uv = g.faceVertexUvs[0]
    if(uv.length === 0)
      return
    function newVertex(index) {
      var vertex = v[index]
      var tex = uv[index]
      return new Vertex(vertex.x, vertex.y, vertex.z, tex.x, tex.y)
    }
    g.faces.forEach(function(face) {
      var a = newVertex(face.a)
      var b = newVertex(face.b)
      var c = newVertex(face.c)
      var material = child.material
      visitorCallback(new Triangle(a, b, c, material))
    })
  })
}
