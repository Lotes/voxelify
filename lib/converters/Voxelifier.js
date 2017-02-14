'use strict'

const ThreeExtensions = require('./ThreeExtensions')
const THREE = ThreeExtensions.THREE
const Box3 = THREE.Box3
const Vector3 = THREE.Vector3
const MeshExtensions = require('./MeshExtensions')
const UnitSieve = require('./UnitSieve')
const WeightedColorGrid = require('./WeightedColorGrid')
const PolygonExtensions = require('./PolygonExtensions')

/**
 * Takes a 3D object and further parameters and splits the model into voxels.
 */
class Voxelifier {
  /**
   * Creates a Voxelifier
   * @param {{object: THREE.Object3D, rotation: THREE.QuaternionOrEuler, size: Number}} optionsArg 3D object to split, rotation before splitting, integer max size for splitting
   */
  constructor (optionsArg) {
    let options = optionsArg || {}

    // get object
    if (!(options.object instanceof THREE.Object3D)) {
      throw new Error('"options.object must be a valid THREE.Object3D!"')
    }
    this.object = options.object

    // get size
    if (typeof options.size !== 'number') {
      throw new Error('"options.size must be a valid THREE.Vector3 or a number!"')
    }
    this.size = Math.ceil(options.size)

    // get rotation
    options.rotation = options.rotation || new THREE.Quaternion()
    if (!(options.rotation instanceof THREE.Quaternion) && !(options.rotation instanceof THREE.Euler)) {
      throw new Error('"options.rotation must be a valid THREE.Quaternion or THREE.Euler!"')
    }
    if (options.rotation instanceof THREE.Quaternion) {
      this.quaternion = options.rotation
    } else {
      this.quaternion = new THREE.Quaternion().setFromEuler(options.rotation)
    }
  }

  /**
   * Takes the 3D object and converts it to voxels polygon for polygon
   * @returns {WeightedColorGrid} a voxel grid
   */
  compute () {
    const rotatedObject = new THREE.Object3D()
    rotatedObject.add(this.object)
    rotatedObject.rotation.setFromQuaternion(this.quaternion)
    const subject = new THREE.Object3D()
    subject.add(rotatedObject)
    const bbox = new Box3().setFromObject(subject)
    const min = bbox.min
    const size = bbox.size()
    const maxActualSize = Math.max(size.x, size.y, size.z)
    const maxAllowedSize = this.size
    const scale = maxAllowedSize / maxActualSize
    subject.position.set(-min.x * scale, -min.y * scale, -min.z * scale)
    subject.scale.set(scale, scale, scale)
    const sieveMax = Math.ceil(maxAllowedSize)
    const boxSieve = new Box3(new Vector3(0, 0, 0), new Vector3(sieveMax, sieveMax, sieveMax))
    const gridMax = sieveMax + 1
    const boxGrid = new Box3(new Vector3(-1, -1, -1), new Vector3(gridMax, gridMax, gridMax))
    const colorGrid = new WeightedColorGrid(boxGrid)
    const unitSieve = new UnitSieve(boxSieve)
    MeshExtensions.getFaces(subject)
      .forEach(polygon => {
        for (var polygonItem of unitSieve.sieveWith(polygon, PolygonExtensions.split)) {
          const coords = polygonItem.box.min
          const color = PolygonExtensions.getColor(polygonItem.item)
          colorGrid.add(coords, color)
        }
      })
    colorGrid.floodDelete(boxGrid.min)
    return colorGrid
  }
}

module.exports = Voxelifier
