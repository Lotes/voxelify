const TILE_SIZE = 16

class Tile {
  constructor () {
    this.filledPixelsCount = 0
    this.data = new Uint32Array(TILE_SIZE * TILE_SIZE)
    for (var index = 0; index < this.data.length; index++) {
      this.data[index] = 0
    }
  }
  get isEmpty () {
    return this.filledPixelsCount === 0
  }
  getIndex (x, z) {
    if (x < 0 || x >= TILE_SIZE || z < 0 || z >= TILE_SIZE) {
      throw new Error('Coordinate is out of tile bounds.')
    }
    return x + TILE_SIZE * z
  }
  getPixelByIndex (index) {
    const color = this.data[index]
    return color === 0 ? null : color
  }
  getPixel (x, z) {
    const index = this.getIndex(x, z)
    return this.getPixelByIndex(index)
  }
  setPixel (x, z, color) {
    if (color === null) {
      color = 0
    }
    var index = this.getIndex(x, z)
    var oldColor = this.getPixelByIndex(index)
    if (color === 0 && oldColor !== null) {
      this.filledPixelsCount--
    } else if (color !== 0 && oldColor === null) {
      this.filledPixelsCount++
    }
    this.data[index] = color
  }
}

class Layer {
  constructor () {
    this.tiles = new Map()
  }
  isEmpty () {
    return this.tiles.size === 0
  }
  cleanUp () {
    for (var [x, column] of this.tiles.entries()) {
      for (var [z, tile] of column.entries()) {
        if (tile.isEmpty()) {
          column.delete(z)
        }
      }
      if (column.size === 0) {
        this.tiles.delete(x)
      }
    }
  }
  getPixel (x, z) {
    const tileIndexX = Math.floor(x / TILE_SIZE)
    if (this.tiles.has(tileIndexX)) {
      const column = this.tiles.get(tileIndexX)
      const tileIndexZ = Math.floor(z / TILE_SIZE)
      if (column.has(tileIndexZ)) {
        const tile = column.get(tileIndexZ)
        x %= TILE_SIZE
        z %= TILE_SIZE
        return tile.getPixel(x, z)
      }
    }
    return null
  }
  setPixel (x, z, color) {
    if (color === null) {
      color = 0
    }
    const tileIndexX = Math.floor(x / TILE_SIZE)
    if (!this.tiles.has(tileIndexX)) {
      if (color === 0) {
        return
      }
      this.tiles.set(tileIndexX, new Map())
    }
    const column = this.tiles.get(tileIndexX)

    const tileIndexZ = Math.floor(z / TILE_SIZE)
    if (!column.has(tileIndexZ)) {
      if (color === 0) {
        return
      }
      column.set(tileIndexZ, new Tile())
    }
    const tile = column.get(tileIndexZ)

    tile.setPixel(x, z, color)
  }
}

class VoxelModel {
  constructor () {
    this.layers = new Map() // y => Layer
  }
  cleanUp () {
    for (var [y, layer] of this.layers) {
      if (layer.isEmpty()) {
        this.layers.delete(y)
      }
    }
  }
  getVoxel (x, y, z) {
    if (!this.layers.has(y)) {
      return null
    }
    const layer = this.layers.get(y)
    return layer.getPixel(x, z)
  }
  setVoxel (x, y, z, color) {
    if (color === null) {
      color = 0
    }
    if (!this.layers.has(y)) {
      if (color === 0) {
        return
      }
      this.layers.set(y, new Layer())
    }
    const layer = this.layers.get(y)
    layer.setPixel(x, z, color)
  }
}

module.exports = VoxelModel
