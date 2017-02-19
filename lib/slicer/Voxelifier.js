'use strict'

const nodeThree = require('../shared/node-three/index')
const THREE = nodeThree.THREE
const Box3 = THREE.Box3
const Vector3 = THREE.Vector3
const MeshExtensions = require('./MeshExtensions')
const UnitSieve = require('./UnitSieve')
const WeightedColorGrid = require('./WeightedColorGrid')
const PolygonExtensions = require('./PolygonExtensions')
const exportGridContainer = require('./exportGridContainer')

/**
 * Takes a 3D object and further parameters and splits the model into voxels.
 */
class Voxelifier {
  /**
   * Creates a Voxelifier
   * @param {THREE.Object3D} object the 3D object you want to voxelify
   * @param {THREE.Quaternion} rotation the amount you want to rotate the object before voxelifying
   * @param {Number} size the minimum or maximum size in voxels (integer)
   * @param {Boolean} sizeIsMaximum decides whether size is minimum or maximum size
   */
  constructor (object, rotation, size, sizeIsMaximum) {
    // get object
    if (!(object instanceof THREE.Object3D)) {
      throw new Error('`object` must be a valid THREE.Object3D!')
    }
    this.object = object

    // get size
    if (!Number.isInteger(size)) {
      throw new Error('`size` must be a valid integer!')
    }
    this.size = size

    // get size mode
    if (typeof sizeIsMaximum !== 'boolean') {
      throw new Error('`sizeIsMaximum` must be a valid boolean!')
    }
    this.isSizeMaximum = sizeIsMaximum

    // get rotation
    if (!(rotation instanceof THREE.Quaternion)) {
      throw new Error('`rotation` must be a valid THREE.Quaternion!')
    }
    this.quaternion = rotation
  }

  /**
   * Takes the 3D object and converts it to voxels polygon for polygon
   * @param {Function} onProgressArg progress callback (current: Number, maximum: Number)
   * @returns {Container} the actual voxelify format
   */
  compute (onProgressArg) {
    // prepare model
    const onProgress = onProgressArg || (() => {})
    const rotatedObject = new THREE.Object3D()
    rotatedObject.add(this.object)
    rotatedObject.rotation.setFromQuaternion(this.quaternion)
    const subject = new THREE.Object3D()
    subject.add(rotatedObject)
    const bbox = new Box3().setFromObject(subject)
    const min = bbox.min
    const size = bbox.getSize()
    const select = this.isSizeMaximum
      ? Math.max
      : Math.min
    const actualSize = select(size.x, size.y, size.z)
    const allowedSize = this.size
    const scale = allowedSize / actualSize
    subject.position.set(-min.x * scale, -min.y * scale, -min.z * scale)
    subject.scale.set(scale, scale, scale)
    const sieveMax = Math.ceil(allowedSize)
    const boxSieve = new Box3(new Vector3(0, 0, 0), new Vector3(sieveMax, sieveMax, sieveMax))
    const gridMax = sieveMax + 1
    const boxGrid = new Box3(new Vector3(-1, -1, -1), new Vector3(gridMax, gridMax, gridMax))
    const colorGrid = new WeightedColorGrid(boxGrid)
    const unitSieve = new UnitSieve(boxSieve)
    const faces = MeshExtensions.getFaces(subject)
    const faceCount = faces.length

    // run every polygon of the mesh through the unit sieve
    let faceIndex = 0
    onProgress(0, faceCount)
    faces.forEach(polygon => {
      unitSieve.sieveWith(polygon, polygonItem => {
        const coords = polygonItem.box.min
        const color = PolygonExtensions.getColor(polygonItem.item)
        colorGrid.add(coords, color)
      }, PolygonExtensions.split)
      faceIndex++
      onProgress(faceIndex, faceCount)
    })
    colorGrid.floodDelete(boxGrid.min)

    // convert to container
    return exportGridContainer(colorGrid)
  }
}

module.exports = Voxelifier
