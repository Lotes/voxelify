const nodeThree = require('./node-three/index')
const THREE = nodeThree.THREE
const Vector3 = THREE.Vector3

//checks if given numer is an integer
function isInteger(number) {
  return Number(number) === number && number % 1 === 0;
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
  /**
   * param: voxel is THREE.Vector3 (its coordinates should be ints)
   * returns:
   *   - null if the given voxel does not intersect this Triangle
   *   - color as integer otherwise
   */
  getColorAtVoxel(voxel) {
    if(!(voxel instanceof Vector3))
      throw new Error('The given voxel must be of type THREE.Vector3!')
    [0, 1, 2].forEach(function(index) {
      if(!isInteger(voxel.getComponent(index)))
        throw new Error('The given voxel coordinates must be integers!')
    })
    //TODO http://fileadmin.cs.lth.se/cs/Personal/Tomas_Akenine-Moller/code/tribox2.txt
    return null
  }
}

module.exports = Triangle
