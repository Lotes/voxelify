const nodeThree = require('../lib/node-three/index')
const THREE = nodeThree.THREE
const path = require('path')
const Canvas = require('canvas')
const fs = require('fs')

describe('Test environment', function() {
  it('should run', function() {})
})

describe('THREE basics', function() {
  const url = path.join(__dirname, 'data/venusaur/Venusaur.obj')
  const RESULTS_DIRECTORY = path.join(__dirname, 'results')

  it('should load OBJ file', function() {
    this.timeout(1000)
    return nodeThree.loadOBJ(url)
      .then(function(object) {
        object.should.be.ok()
      })
  })

  it('should transform OBJ', function() {
    this.timeout(1000)
    return nodeThree.loadOBJ(url)
      .then(nodeThree.normalizeSize)
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

    const WIDTH = 600
    const HEIGHT = 400
    const DISTANCE  = 1

    var scene = new THREE.Scene()
    var camera = new THREE.PerspectiveCamera( 75, WIDTH / HEIGHT, 0.1, 1000 )
    var light = new THREE.DirectionalLight( 0xffffff );
    camera.position.set(DISTANCE, 0, DISTANCE)
    camera.up = new THREE.Vector3(0, 1, 0)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    light.position = camera.position
    light.target.position.set(0, 0, 0)
    scene.add(camera)
    scene.add(light)
    var canvas = new Canvas()
    var renderer = new THREE.CanvasRenderer({
      canvas: canvas
    })
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(WIDTH, HEIGHT, false)

    return nodeThree.loadOBJ(url)
      .then(nodeThree.normalizeSize)
      .delay(1000)
      .then(function(object) {
        scene.add(object)
        renderer.render(scene, camera)
        var out = fs.createWriteStream(path.join(RESULTS_DIRECTORY, 'render.png'))
        return new Promise(function(resolve, reject) {
          canvas.toBuffer(function(err, data) {
            if(err) return reject(err)
            out.write(data);
            resolve()
          })
        })
      })
  })
})
