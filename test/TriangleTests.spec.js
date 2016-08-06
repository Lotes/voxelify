const nodeThree = require('../lib/node-three/index')
const THREE = nodeThree.THREE
const Vector3 = THREE.Vector3
const Vertex = require('../lib/Vertex')
const Triangle = require('../lib/Triangle')
const path = require('path')
const should = require('should')

describe('Triangle', function() {
  const url = path.join(__dirname, 'data/cube/cube.png')
  var material

  before(function() {
    return nodeThree.loadTexture(url)
      .then(function(texture) {
        material = texture
      })
  })

  it('should not intersect voxel', function() {
    const triangle = new Triangle(
      new Vertex(0, 0, 0, 0, 0),
      new Vertex(1, 0, 0, 1, 0),
      new Vertex(0, 1, 0, 0, 1),
      material
    )
    const voxel = new Vector3(100, 100, 100)
    const color = triangle.getColorAtVoxel(voxel)
    should(color).not.be.ok()
  })
})
