const nodeThree = require('./node-three/index')
const THREE = nodeThree.THREE
const Vector3 = THREE.Vector3
const WeightedColor = require('./WeightedColor')
const Canvas = require('canvas')
const fs = require('fs')
const Promise = require('bluebird')
const MeshBasicMaterial = THREE.MeshBasicMaterial
const BoxGeometry = THREE.BoxGeometry
const Mesh = THREE.Mesh
const Object3D = THREE.Object3D

function isInteger(n) {
    return Number(n) === n && n % 1 === 0
}

class WeightedColorGrid {
  //param boundingBox is a THREE.Box3
  constructor(boundingBox, initialColor) {
    initialColor = initialColor || new WeightedColor()
    this._bbox = boundingBox.clone()
    this._bbox.min.floor()
    this._bbox.max.ceil()
    this._size = this._bbox.size()
    const cellCount = this._size.x * this._size.y * this._size.z
    this._cells = new Array(cellCount)
    for(var index=0; index<this._cells.length; index++)
      this._cells[index] = initialColor.clone()
    this._bbox.max.sub(new Vector3(1, 1, 1))
  }
  //param point is THREE.Vector3
  _getIndex(point) {
    if(!isInteger(point.x) || !isInteger(point.y) || !isInteger(point.z)) throw new Error('Coordinates must be integers!')
    if(!this._bbox.containsPoint(point)) throw new Error('Coordinates are out of bounds!')
    const coords = point.clone().sub(this._bbox.min)
    const layerSize = this._size.x * this._size.z
    const layerRowSize = this._size.x
    return coords.x + coords.y * layerSize + coords.z * layerRowSize
  }
  _getCoordinates(index) {
    const layerSize = this._size.x * this._size.z
    const layerRowSize = this._size.x
    return new Vector3(
      (index % layerSize) % layerRowSize,
      index / layerSize,
      (index % layerSize) / layerRowSize
    ).add(this._bbox.min)
  }
  //param point is THREE.Vector3
  //param color is a hex value or a WeightedColor
  add(point, color) {
    const index = this._getIndex(point)
    const cell = this._cells[index]
    cell.add(color)
  }
  //param point is THREE.Vector3
  get(point) {
    const index = this._getIndex(point)
    return this._cells[index]
  }
  //param callback is Function(X, Y, Z, Color)
  forEach(callback) {
    this._cells.forEach((color, index) => {
      if(color.weight !== 0) {
        var point = this._getCoordinates(index)
        callback(point.x, point.y, point.z, color.value)
      }
    })
  }
  //save each layer of the grid as PNG file
  save(fileName) {
    //get metrics
    const min = new Vector3(+Infinity, +Infinity, +Infinity)
    const max = new Vector3(-Infinity, -Infinity, -Infinity)
    this.forEach(function(x, y, z) {
      const vector = new Vector3(x, y, z)
      min.min(vector)
      max.max(vector)
    })
    const size = new THREE.Vector3().subVectors(max, min).add(new THREE.Vector3(1, 1, 1))
    const maxSize = Math.max(size.x, size.y, size.z)
    const height = maxSize * maxSize
    const width = maxSize

    //set pixels
    const canvas = new Canvas(width, height)
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, width, height)
    const imageData = context.getImageData(0, 0, width, height)
    const data = imageData.data
    this.forEach(function(x, y, z, color) {
      x -= min.x
      y -= min.y
      z -= min.z
      const index = x + maxSize * (z + maxSize * y)
      const indexX4 = index * 4
      data[indexX4 + 0] = (color >> 16) & 0xff
      data[indexX4 + 1] = (color >>  8) & 0xff
      data[indexX4 + 2] = (color >>  0) & 0xff
      data[indexX4 + 3] =                  0xff
    })
    context.putImageData(imageData, 0, 0)

    //export
    return new Promise(function(resolve, reject) {
      const out = fs.createWriteStream(fileName)
      const stream = canvas.pngStream().pipe(out)
      stream.on('error', reject)
      stream.on('finish', resolve)
    })
  }
  //convert the grid to a 3D mesh
  toMesh() {
    const object = new Object3D()
    const colorToMaterialMap = new Map()
    this.forEach(function(x, y, z, color) {
      if(!colorToMaterialMap.has(color))
        colorToMaterialMap.set(color, new MeshBasicMaterial({ color: color }))
      const material = colorToMaterialMap.get(color)
      var geometry = new BoxGeometry(1, 1, 1)
      var voxel = new Mesh(geometry, material)
      voxel.position.set(x, y, z)
      object.add(voxel)
    })
    return object
  }
}

module.exports = WeightedColorGrid
