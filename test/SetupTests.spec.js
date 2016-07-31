const THREE = require('three')
require('three-obj-loader')(THREE)
require('../lib/NodeLoader')(THREE)
const path = require('path')

describe('Test environment', function() {
  it('should run', function() {})
})

describe('THREE basics', function() {
  it('should load OBJ file', function(done) {
    this.timeout(1000)
    const loader = new THREE.OBJLoader();
    loader.load(
    	path.join(__dirname, 'data/venusaur/Venusaur.obj'),
    	function(object) {
    		object.should.be.ok()
        done()
    	},
      null,
      done
    )
  })
})
