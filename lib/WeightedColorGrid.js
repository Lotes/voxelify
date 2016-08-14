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

function getOrAdd(map, key, newDefault) {
  if(!map.has(key))
      map.set(key, newDefault())
  return map.get(key)
}

class WeightedColorGrid {
    constructor() {
      this._cellsByXYZ = new Map()
    }
    _checkParameters(x, y, z) {
      if(!isInteger(x)) throw new Error('X must be an integer!')
      if(!isInteger(y)) throw new Error('Y must be an integer!')
      if(!isInteger(z)) throw new Error('Z must be an integer!')
    }
    //param x, y, z are integers
    //param color is a hex value or a WeightedColor
    add(x, y, z, color) {
      this._checkParameters(x, y, z)
      const cellsByXYZ = this._cellsByXYZ
      const cellsByYZ = getOrAdd(cellsByXYZ, x, function() { return new Map() })
      const cellsByZ = getOrAdd(cellsByYZ, y, function() { return new Map() })
      const cell = getOrAdd(cellsByZ, z, function() { return new WeightedColor() })
      cell.add(color)
    }
    get(x, y, z) {
      this._checkParameters(x, y, z)
      if(this._cellsByXYZ.has(x) && this._cellsByXYZ.get(x).has(y) && this._cellsByXYZ.get(x).get(y).has(z))
        return this._cellsByXYZ.get(x).get(y).get(z).value
      return null
    }
    //param callback is Function(X, Y, Z, Color)
    forEach(callback) {
      this._cellsByXYZ.forEach(function(cellsByYZ, x) {
        cellsByYZ.forEach(function(cellsByZ, y) {
          cellsByZ.forEach(function(cell, z) {
            callback(x, y, z, cell.value)
          })
        })
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
