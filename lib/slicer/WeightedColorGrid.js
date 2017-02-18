'use strict'

const nodeThree = require('../shared/node-three/index')
const THREE = nodeThree.THREE
const Vector3 = THREE.Vector3
const WeightedColor = require('./WeightedColor')

const FLOOD_DIRECTIONS = [
  new Vector3(+1, 0, 0),
  new Vector3(0, +1, 0),
  new Vector3(0, 0, +1),
  new Vector3(-1, 0, 0),
  new Vector3(0, -1, 0),
  new Vector3(0, 0, -1)
]

/**
 * A 3D grid of weighted colors. Will be used to mix the right color from texture triangles.
 */
class WeightedColorGrid {
  /**
   * Create a WeightedColorGrid for given size with given color
   * @param {THREE.Box3} boundingBox the bounding box encompassing the whole 3D model
   * @param {WeightedColor} initialColorArg the color for filling the whole grid initially
   */
  constructor (boundingBox, initialColorArg) {
    let initialColor = initialColorArg || new WeightedColor()
    this.bbox = boundingBox.clone()
    this.bbox.min.floor()
    this.bbox.max.ceil()
    this.size = this.bbox.getSize()
    const cellCount = this.size.x * this.size.y * this.size.z
    this.$cells = new Array(cellCount)
    for (let index = 0; index < this.$cells.length; index++) {
      this.$cells[index] = initialColor.clone()
    }
    this.bbox.max.sub(new Vector3(1, 1, 1))
  }

  /**
   * Computes an index to navigate throw internal cells/voxels
   * @param {THREE.Vector3} point must have integer coordinates to address a voxel
   * @returns {Number} index into the internal data structure
   */
  $getIndex (point) {
    if (!Number.isInteger(point.x) || !Number.isInteger(point.y) || !Number.isInteger(point.z)) throw new Error('Coordinates must be integers!')
    if (!this.bbox.containsPoint(point)) throw new Error('Coordinates are out of bounds!')
    const coords = point.clone().sub(this.bbox.min)
    const layerSize = this.size.x * this.size.z
    const layerRowSize = this.size.x
    return coords.x + coords.y * layerSize + coords.z * layerRowSize
  }

  /**
   * Given an index addressing an internal cell/voxel, computes the 3D integer coordinates for the index.
   * @param {Number} index integer cell/voxel address
   * @returns {THREE.Vector3} the coordinate for the given index
   */
  $getCoordinates (index) {
    const layerSize = this.size.x * this.size.z
    const layerRowSize = this.size.x
    return new Vector3(
      (index % layerSize) % layerRowSize,
      Math.floor(index / layerSize),
      Math.floor((index % layerSize) / layerRowSize)
    ).add(this.bbox.min)
  }

  /**
   * Adds a color to the voxel under the given point
   * @param {THREE.Vector3} point integer 3D coordinates
   * @param {Number|WeightedColor} color hex value or weighted color to add
   * @returns {void}
   */
  add (point, color) {
    const index = this.$getIndex(point)
    let cell = this.$cells[index]
    if (cell === null) {
      cell = new WeightedColor()
      this.$cells[index] = cell
    }
    cell.add(color)
  }

  /**
   * Returns the weighted color for a given point
   * @param {THREE.Vector3} point integer 3D coordinated into this grid
   * @returns {WeightedColor} the color under that point
   */
  get (point) {
    const index = this.$getIndex(point)
    return this.$cells[index]
  }

  /**
   * Delete all colors by flooding the grid with null values
   * @param {THREE.Vector3} coord integer 3D coordinates
   * @returns {void}
   */
  floodDelete (coord) {
    const queue = [coord]
    while (queue.length > 0) {
      let point = queue.pop()
      let index = this.$getIndex(point)
      let cell = this.$cells[index]
      if (cell === null || cell.weight > 0) {
        continue
      }
      this.$cells[index] = null
      FLOOD_DIRECTIONS.forEach(dir => {
        const newPoint = dir.clone().add(point)
        if (this.bbox.containsPoint(newPoint)) {
          queue.push(newPoint)
        }
      })
    }
  }

  /**
   * Iterates over each cell/voxel in the grid
   * @param {Function} callback arguments are (x: Number, y: Number, z: Number, color: WeightedColor)
   * @returns {void}
   */
  forEach (callback) {
    this.$cells.forEach((color, index) => {
      if (color !== null) {
        var point = this.$getCoordinates(index)
        callback(point.x, point.y, point.z, color)
      }
    })
  }
}

module.exports = WeightedColorGrid
