'use strict'

const Tile = require('./Tile')
class Sprite {
  constructor (id) {
    if (typeof id !== 'number' || Math.floor(id) !== id) {
      throw new Error('`id` must be an integer!')
    }
    this._id = id
    this.clear()
  }
  /** read-only id */
  get id () {
    return this._id
  }
  /**
   * Returns true iff no pixel was set (internally: no tile exists)
   */
  get isEmpty () {
    return this.tiles.size === 0
  }

  /** Deletes all pixels. */
  clear () {
    this.tiles = new Map()
  }

  /** Gets the pixel information at the given coordinate. */
  getPixel (x, y) {
    const tileIndexX = Math.floor(x / Tile.SIZE)
    if (this.tiles.has(tileIndexX)) {
      const column = this.tiles.get(tileIndexX)
      const tileIndexZ = Math.floor(y / Tile.SIZE)
      if (column.has(tileIndexZ)) {
        const tile = column.get(tileIndexZ)
        x %= Tile.SIZE
        y %= Tile.SIZE
        return tile.getPixel(x, y)
      }
    }
    return null
  }

  /** Sets or deletes the pixel information at the given coordinate. */
  setPixel (x, y, color) {
    Tile.checkColor(color)
    const tileIndexX = Math.floor(x / Tile.SIZE)
    if (!this.tiles.has(tileIndexX)) {
      if (color === null) {
        return
      }
      this.tiles.set(tileIndexX, new Map())
    }
    const column = this.tiles.get(tileIndexX)
    const tileIndexY = Math.floor(y / Tile.SIZE)
    if (!column.has(tileIndexY)) {
      if (color === null) {
        return
      }
      column.set(tileIndexY, new Tile())
    }
    const tile = column.get(tileIndexY)
    tile.setPixel(x, y, color)
  }

  /** iterates over each pixel (color, x, y) */
  forEachPixel (callback) {
    this.tiles.forEach((column, x) => {
      let offsetX = x * Tile.SIZE
      column.forEach((tile, y) => {
        let offsetY = y * Tile.SIZE
        tile.forEachPixel((color, tx, ty) => {
          callback(color, offsetX + tx, offsetY + ty)
        })
      })
    })
  }
}

module.exports = Sprite
