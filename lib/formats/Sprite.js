'use strict'

const Tile = require('./Tile')

/**
 * A sprite is a bitmap of 32 bit color pixels.
 */
class Sprite {
  /**
   * Creates a sprite
   * @param {Number} id an integer for identifying
   */
  constructor (id) {
    if (typeof id !== 'number' || !Number.isInteger(id)) {
      throw new Error('`id` must be an integer!')
    }
    this.id = id
    this.clear()
  }
  /**
   * Returns true iff no pixel was set (internally: no tile exists)
   * @returns {void} true, iff sprite is empty (has no pixels)
   */
  get isEmpty () {
    return this.tiles.size === 0
  }

  /**
   * Deletes all pixels.
   * @returns {void}
   */
  clear () {
    this.tiles = new Map()
  }

  /**
   * Gets the pixel information at the given coordinate.
   * @param {Number} x an integer coordinate
   * @param {Number} y an integer coordinate
   * @returns {Number|Null} 32 bit color or null
   */
  getPixel (x, y) {
    const tileIndexX = Math.floor(x / Tile.SIZE)
    if (this.tiles.has(tileIndexX)) {
      const column = this.tiles.get(tileIndexX)
      const tileIndexZ = Math.floor(y / Tile.SIZE)
      if (column.has(tileIndexZ)) {
        const tile = column.get(tileIndexZ)
        return tile.getPixel(x % Tile.SIZE, y % Tile.SIZE)
      }
    }
    return null
  }

  /**
   * Sets or deletes the pixel information at the given coordinate.
   * @param {Number} x an integer coordinate
   * @param {Number} y an integer coordinate
   * @param {Number} color an 32 bit unsigned integer color
   * @returns {void}
   */
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
    tile.setPixel(x % Tile.SIZE, y % Tile.SIZE, color)
  }

  /**
   * Iterates over each pixel
   * @param {Function} callback arguments are (color, x, y)
   * @returns {void}
   */
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
