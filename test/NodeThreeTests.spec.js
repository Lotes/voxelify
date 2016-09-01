const ThreeLoaderExtensions = require('../lib/converters/ThreeExtensions')
const ThreeRenderExtensions = require('../lib/exporters/renderers/ThreeExtensions')
const THREE = ThreeRenderExtensions.THREE
const path = require('path')
const Promise = require('bluebird')
const fs = require('fs')
var GIFEncoder = require('gifencoder');

describe('THREE basics', function() {
  const url = path.join(__dirname, 'data/venusaur/Venusaur.obj')
  const RESULTS_DIRECTORY = path.join(__dirname, 'results')

  it('should load OBJ file', function() {
    this.timeout(1000)
    return ThreeLoaderExtensions.loadOBJ(url)
      .then(function(object) {
        object.should.be.ok()
      })
  })

  it('should transform OBJ', function() {
    this.timeout(1000)
    return ThreeLoaderExtensions.loadOBJ(url)
      .then(ThreeRenderExtensions.normalizeSize)
      .then(function(mesh) {
        const epsilon = 0.00001
        var box = new THREE.Box3().setFromObject(mesh)
        var size = box.size()
        size.x.should.not.be.above(1 + epsilon)
        size.y.should.not.be.above(1 + epsilon)
        size.z.should.not.be.above(1 + epsilon)
      })
  })

  it('should render scene', function() {
    this.timeout(10000)
    return ThreeLoaderExtensions.loadOBJ(url)
      .then(ThreeRenderExtensions.normalizeSize)
      .then(function(mesh) {
        return ThreeRenderExtensions.captureByCamera(mesh, 600, 400)
      })
      .then(function(scene) {
        var out = fs.createWriteStream(path.join(RESULTS_DIRECTORY, 'render.png'))
        return scene.renderToStream(out)
      })
  })

  it('should render an animation', function() {
    this.timeout(20000)
    const WIDTH = 600
    const HEIGHT = 400
    return ThreeLoaderExtensions.loadOBJ(url)
      .then(ThreeRenderExtensions.normalizeSize)
      .then(function(mesh) {
        return ThreeRenderExtensions.captureByCamera(mesh, WIDTH, HEIGHT)
      })
      .then(function(scene) {
        var angles = []
        for(var angle = 0; angle < 360; angle+=20)
          angles.push(angle)

        var encoder = new GIFEncoder(WIDTH, HEIGHT);
        encoder.createReadStream().pipe(fs.createWriteStream(path.join(RESULTS_DIRECTORY, 'animated.gif')))

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
