'use strict'

/**
 * A tile is a N x N bitmap fragment, where N defaults to 16.
 */
class Tile {
  /**
   * @constructor
   */
  constructor () {
    this.filledPixelsCount = 0
    this.data = new Array(Tile.SIZE * Tile.SIZE)
    for (let index = 0; index < this.data.length; index++) {
      this.data[index] = 0
    }
  }

  /**
   * Determine if this tile is empty
   * @returns {Boolean} returns true iff tile is empty
   */
  get isEmpty () {
    return this.filledPixelsCount === 0
  }

  /**
   * Check whether a given number lies in between the tile bounds
   * @static
   * @param {Number} num the number to check
   * @returns {void}
   * @throws {Error} if bounds were violated
   */
  static checkBounds (num) {
    if (num < 0 || num >= Tile.SIZE) {
      throw new Error('Coordinate is out of tile bounds.')
    }
  }

  /**
   * Determines the pixel color value by index.
   * @param {Number} index of a pixel
   * @returns {Number} a 32-bit unsigned integer, the color
   */
  getPixelByIndex (index) {
    return this.data[index]
  }

  /**
   * Get a pixel of this tile.
   * @param {Number} x integer coordinate
   * @param {Number} y integer coordinate
   * @returns {Number} the color of the pixel
   */
  getPixel (x, y) {
    const index = Tile.getIndex(x, y)
    return this.getPixelByIndex(index)
  }

  /**
   * Checks a given color if valid
   * @param {Number|Null} color a color (32 bit)
   * @returns {void}
   * @throws {Error} if given color is invalid
   */
  static checkColor (color) {
    if (!Number.isInteger(color) && color !== null) {
      throw new Error('Only integers and null are allowed!')
    }
  }

  /**
   * Set a pixel of this tile. Internally counts the set pixels.
   * @param {Number} x integer coordinate
   * @param {Number} y integer coordinate
   * @param {Number|Null} color 32 bit color
   * @returns {void}
   * @throws {Error} if color not valid
   */
  setPixel (x, y, color) {
    Tile.checkColor(color)
    let index = Tile.getIndex(x, y)
    let oldColor = this.getPixelByIndex(index)
    if (color === null && oldColor !== null) {
      this.filledPixelsCount--
    } else if (color !== null && oldColor === null) {
      this.filledPixelsCount++
    }
    this.data[index] = color
  }

  /**
   * Iterates over each tile pixel
   * @param {Function} callback arguments are (color, x, y)
   * @returns {void}
   */
  forEachPixel (callback) {
    this.data.forEach((color, index) => {
      if (color !== null) {
        callback(color, index % Tile.SIZE, Math.floor(index / Tile.SIZE))
      }
    })
  }
}

// size of all tiles in width and height
Tile.SIZE = 16
Tile.getIndex = (x, y) => {
  Tile.checkBounds(x)
  Tile.checkBounds(y)
  return x + Tile.SIZE * y
}
module.exports = Tile
