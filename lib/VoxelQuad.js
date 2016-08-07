const nodeThree = require('./node-three/index')
const THREE = nodeThree.THREE
const Vector3 = THREE.Vector3

//checks if given numer is an integer
function isInteger(number) {
  return Number(number) === number && number % 1 === 0;
}

class VoxelQuad {
  //param: voxel is THREE.Vector3 (its coordinates should be ints)
  //param: side is VoxelQuad.Side member
  constructor(voxel, side) {
    if(!(voxel instanceof Vector3))
      throw new Error('The given voxel must be of type THREE.Vector3!')
    [0, 1, 2].forEach(function(index) {
      if(!isInteger(voxel.getComponent(index)))
        throw new Error('The given voxel coordinates must be integers!')
    })
    this.position = voxel.clone().add(side.Shift)
    this.spans = side.Plane
    this.normal = side.Normal
    this.d = side.Normal.dot(this.position)
  }
  //param: triangle is a Triangle
  //returns: a list of vertices where the quad intersects the triangle
  getIntersections(triangle) {
    
    return []
  }
}

VoxelQuad.Axis = {
  NONE: new Vector3(0, 0, 0),
  X: new Vector3(1, 0, 0),
  Y: new Vector3(0, 1, 0),
  Z: new Vector3(0, 0, 1)
}

VoxelQuad.Side = {
  TOP: {
    Shift: VoxelQuad.Axis.Y,
    Plane: [VoxelQuad.Axis.X, VoxelQuad.Axis.Z]
  },
  BOTTOM: {
    Shift: VoxelQuad.Axis.NONE,
    Plane: [VoxelQuad.Axis.X, VoxelQuad.Axis.Z]
  },
  LEFT: {
    Shift: VoxelQuad.Axis.NONE,
    Plane: [VoxelQuad.Axis.Y, VoxelQuad.Axis.Z]
  },
  RIGHT: {
    Shift: VoxelQuad.Axis.X,
    Plane: [VoxelQuad.Axis.Y, VoxelQuad.Axis.Z]
  },
  FRONT: {
    Shift: VoxelQuad.Axis.NONE,
    Plane: [VoxelQuad.Axis.X, VoxelQuad.Axis.Y]
  },
  BACK: {
    Shift: VoxelQuad.Axis.Z,
    Plane: [VoxelQuad.Axis.X, VoxelQuad.Axis.Y]
  }
}

for(var sideName in VoxelQuad.Side) {
  var side = VoxelQuad.Side[sideName]
  side.Normal = new Vector3()
  side.Normal.crossVectors(side.Plane[0], side.Plane[1])
}

module.exports = VoxelQuad
