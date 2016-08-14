const nodeThree = require('../lib/node-three/index')
const THREE = nodeThree.THREE
const Box3 = THREE.Box3
const MeshBasicMaterial = THREE.MeshBasicMaterial
const Vector3 = THREE.Vector3
const VoxelGrid = require('../lib/VoxelGrid')
const Face = require('../lib/Face')
const Vertex = require('../lib/Vertex')
const path = require('path')

describe('VoxelGrid', function() {
  const url = path.join(__dirname, 'data/cube/cube.png')
  var material

  before(function() {
    return nodeThree.loadTexture(url)
      .then(function(texture) {
        material = texture
      })
  })

  it('should split face leafing an empty voxel', function() {
    /*
         | X
         |XX
      ------
        X|XX
       XX|XX
    */
    const grid = new VoxelGrid(new Box3(new Vector3(0, 0, 0), new Vector3(2, 2, 1)))
    const a = new Vertex([0, 0, 0], [0, 0])
    const b = new Vertex([2, 0, 0], [1, 0])
    const c = new Vertex([2, 2, 0], [1, 1])
    const face = new Face(a, b, c, material)

    grid.add(face)

    grid.forEach(function(box, items) {
      if(box.min.x === 0 && box.min.y === 1)
        items.should.be.empty()
    })
  })
})
