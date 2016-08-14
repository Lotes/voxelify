const Voxelifier = require('../lib/Voxelifier')
const nodeThree = require('../lib/node-three/index')
const THREE = nodeThree.THREE
const path = require('path')
const fs = require('fs')
const GIFEncoder = require('gifencoder')
const Promise = require('bluebird')

describe('Voxelifier', function() {
  const url = path.join(__dirname, 'data/venusaur/Venusaur.obj')
  const RESULTS_DIRECTORY = path.join(__dirname, 'results')

  var object

  before(function() {
    return nodeThree.loadOBJ(url)
      .then(function(obj) {
        object = obj
      })
  })

  it('should render all slices of given mesh', function() {
    const fileName = path.join(RESULTS_DIRECTORY, 'voxel_map.png')
    const voxelifier = new Voxelifier({
      object: object,
      size: 20
    })
    const colorGrid = voxelifier.compute()
    return colorGrid.save(fileName)
  })

  it('should render voxelified mesh', function() {
    const voxelifier = new Voxelifier({
      object: object,
      size: 20
    })
    const colorGrid = voxelifier.compute()
    const mesh = colorGrid.toMesh()
    return nodeThree.normalizeSize(mesh)
      .then(function(normalizedMesh) {
        return nodeThree.captureByCamera(normalizedMesh, 600, 400)
      })
      .then(function(scene) {
        var out = fs.createWriteStream(path.join(RESULTS_DIRECTORY, 'voxel_mesh.png'))
        return scene.renderToStream(out)
      })
  })

  it('should render an animation of a voxelified mesh', function() {
    this.timeout(20000)
    const WIDTH = 600
    const HEIGHT = 400
    const voxelifier = new Voxelifier({
      object: object,
      size: 20
    })
    const colorGrid = voxelifier.compute()
    const mesh = colorGrid.toMesh()
    return nodeThree.normalizeSize(mesh)
      .then(function(mesh) {
        return nodeThree.captureByCamera(mesh, WIDTH, HEIGHT)
      })
      .then(function(scene) {
        var angles = []
        for(var angle = 0; angle < 360; angle+=20)
          angles.push(angle)

        var encoder = new GIFEncoder(WIDTH, HEIGHT);
        encoder.createReadStream().pipe(fs.createWriteStream(path.join(RESULTS_DIRECTORY, 'voxel_animated.gif')))

        encoder.start();
        encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
        encoder.setDelay(50);  // frame delay in ms
        encoder.setQuality(10); // image quality. 10 is default.
        return Promise.each(angles, function(angle) {
          var rad = angle/180*Math.PI
          var cos = Math.cos(rad)
          var sin = Math.sin(rad)
          scene.camera.set(cos, 0, sin)
          return scene.renderToStream().then(function(context) {
            encoder.addFrame(context)
          })
        }).then(function() {
          encoder.finish()
        })
      })
  })
})
