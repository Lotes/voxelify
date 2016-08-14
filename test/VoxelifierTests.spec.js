const Voxelifier = require('../lib/Voxelifier')
const nodeThree = require('../lib/node-three/index')
const THREE = nodeThree.THREE
const path = require('path')

describe('Voxelifier', function() {
  const url = path.join(__dirname, 'data/venusaur/Venusaur.obj')
  const RESULTS_DIRECTORY = path.join(__dirname, 'results')

  it('should render all slices of given mesh', function() {
    const fileName = path.join(RESULTS_DIRECTORY, 'voxels.png')
    return nodeThree.loadOBJ(url)
      .then(function(object) {
        const voxelifier = new Voxelifier({
          object: object,
          size: 20
        })
        const colorGrid = voxelifier.compute()
        return colorGrid.save(fileName)
      })
  })
})
