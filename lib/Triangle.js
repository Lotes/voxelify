const nodeThree = require('./node-three/index')
const THREE = nodeThree.THREE
const Vector3 = THREE.Vector3
const VoxelQuad = require('./VoxelQuad')

class Triangle {
  //material is a THREE.Material
  //a, b, c are Vertex
  constructor(a, b, c, material) {
    this.a = a
    this.b = b
    this.c = c
    this.material = material
  }
  /**
   * param: voxel is THREE.Vector3 (its coordinates should be ints)
   * returns: list of vertices found in the voxel
   */
  getVoxelVertices(voxel) {
    //6 quads against 1 triangle
    var vertices = []
    for(var sideName in VoxelQuad.Side) {
      const side = VoxelQuad.Side[sideName]
      const quad = new VoxelQuad(voxel, side)
      vertices = vertices.concat(quad.getIntersections(this))
    }
    return vertices
  }
}

module.exports = Triangle
