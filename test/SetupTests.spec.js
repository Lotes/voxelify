const THREE = require('three')
require('../lib/Projector')(THREE)
require('../lib/CanvasRenderer')(THREE)
require('three-obj-loader')(THREE)
require('../lib/NodeLoader')(THREE)
require('../lib/globals')
const path = require('path')
const Canvas = require('canvas')
const fs = require('fs')

describe('Test environment', function() {
  it('should run', function() {})
})

describe('THREE basics', function() {
  const url = path.join(__dirname, 'data/venusaur/Venusaur.obj')
  const RESULTS_DIRECTORY = path.join(__dirname, 'results')

  function load(done) {
    const loader = new THREE.OBJLoader()
    loader.load(url, function(object) {
      done(null, object)
    }, null, done)
  }

  it('should load OBJ file', function(done) {
    this.timeout(1000)
    load(function(err, object) {
      if(err) return done(err)
      object.should.be.ok()
      done()
    })
  })

  it('should transform OBJ', function(done) {
    this.timeout(1000)
    const loader = new THREE.OBJLoader()
    load(function(err, object) {
      if(err) return done(err)
      var geometry = new THREE.Geometry()
      object.updateMatrix()
      object.traverse(child => {
        const childGeometry = child.geometry
        if(childGeometry instanceof THREE.BufferGeometry)
          geometry.merge(new THREE.Geometry().fromBufferGeometry(childGeometry), child.matrix)
        else if(childGeometry instanceof THREE.Geometry)
          geometry.merge(childGeometry, child.matrix)
      })
      var mesh = new THREE.Mesh(geometry, object.material)
      var box = new THREE.Box3().setFromObject(mesh)
      var size = box.size()
      var scale = 1 / Math.max(size.x, size.y, size.z)
      var matrix = new THREE.Matrix4().makeScale(scale, scale, scale)
      mesh.applyMatrix(matrix)

      const epsilon = 0.00001
      box = new THREE.Box3().setFromObject(mesh)
      size = box.size()
      size.x.should.not.be.above(1 + epsilon)
      size.y.should.not.be.above(1 + epsilon)
      size.z.should.not.be.above(1 + epsilon)
      done()
    })
  })

  it('should render scene', function(done) {
    this.timeout(10000)

    const WIDTH = 600
    const HEIGHT = 400

    var scene = new THREE.Scene()
    var camera = new THREE.PerspectiveCamera( 75, WIDTH / HEIGHT, 0.1, 1000 )
    camera.position.set(20, 20, 20)
    camera.up = new THREE.Vector3(0, 1, 0)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    scene.add(camera)
    var canvas = new Canvas()
    var renderer = new THREE.CanvasRenderer({
      canvas: canvas
    })
    renderer.setClearColor(0x0000ff, 1)
    renderer.setSize(WIDTH, HEIGHT, false)

    load(function(err, object) {
      if(err) return done(err)

      scene.add(object)
      renderer.render(scene, camera)

      var out = fs.createWriteStream(path.join(RESULTS_DIRECTORY, 'render.png'))
      canvas.toBuffer(function(err, data) {
        out.write(data);
        done()
      })
    })
  })
})
