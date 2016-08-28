const nodeThree = require('./node-three/index')
const THREE = nodeThree.THREE
const MeshExtensions = require('./MeshExtensions')
const VoxelGrid = require('./VoxelGrid')
const WeightedColorGrid = require('./WeightedColorGrid')

class Voxelifier {
  //(!) param options.object is THREE.Object3D, describing the 3D mesh you want to voxelify
  //( ) param options.rotation is a THREE.Quaternion or THREE.Euler, describing the rotation of the object
  //(!) param options.size is an integer, describing the maximum size in voxels
  constructor(options) {
    options = options || {}

    //get object
    if(!(options.object instanceof THREE.Object3D))
      throw new Error('"options.object must be a valid THREE.Object3D!"')
    this.object = options.object

    //get size
    if(typeof options.size !== 'number')
        throw new Error('"options.size must be a valid THREE.Vector3 or a number!"')
    this.size = Math.ceil(options.size)

    //get rotation
    options.rotation = options.rotation || new THREE.Quaternion()
    if(!(options.rotation instanceof THREE.Quaternion) && !(options.rotation instanceof THREE.Euler))
        throw new Error('"options.rotation must be a valid THREE.Quaternion or THREE.Euler!"')
    if(options.rotation instanceof THREE.Quaternion)
      this.quaternion = options.rotation
    else
      this.quaternion = new THREE.Quaternion().setFromEuler(options.rotation)
  }
  compute() {
    const rotatedObject = new THREE.Object3D()
    rotatedObject.add(this.object)
    rotatedObject.rotation.setFromQuaternion(this.quaternion)
    const subject = new THREE.Object3D()
    subject.add(rotatedObject)
    const bbox = new THREE.Box3().setFromObject(subject)
    const min = bbox.min
    const size = bbox.size()
    const maxActualSize = Math.max(size.x, size.y, size.z)
    const maxAllowedSize = this.size
    const scale = maxAllowedSize / maxActualSize
    subject.position.set(-min.x*scale, -min.y*scale, -min.z*scale)
    subject.scale.set(scale, scale, scale)
    const colorGrid = new WeightedColorGrid()
    const voxelGrid = new VoxelGrid(new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(maxAllowedSize, maxAllowedSize, maxAllowedSize)))
    MeshExtensions.getFaces(subject).subscribe(() => voxelGrid.add(triangle))
    voxelGrid.forEach(function(box, items) {
      const coords = box.min
      items.forEach(function(item) {
        colorGrid.add(coords.x, coords.y, coords.z, item.color.value)
      })
    })
    return colorGrid
  }
}

module.exports = Voxelifier
