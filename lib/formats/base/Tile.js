"use strict";

class Tile {
  constructor () {
    this.filledPixelsCount = 0;
    this.data = new Array(Tile.SIZE * Tile.SIZE);
    for (let index = 0; index < this.data.length; index++) {
      this.data[ index ] = 0;
    }
  }

  /**
   * @method isEmpty
   * @description returns true iff tile is empty
   */
  get isEmpty () {
    return this.filledPixelsCount === 0;
  }

  /**
   * @method checkBounds
   * @static
   * @description check whether a given number lies inbetween the tile bounds
   * @argument num the number to check
   */
  static checkBounds (num) {
    if (num < 0 || num >= Tile.SIZE) {
      throw new Error('Coordinate is out of tile bounds.');
    }
  }

  getPixelByIndex (index) {
    return this.data[ index ];
  }

  /**
   * Get a pixel of this tile.
   */
  getPixel (x, y) {
    const index = Tile.getIndex(x, y);
    return this.getPixelByIndex(index);
  }

  static checkColor (color) {
    if (!Number.isInteger(color) && color !== null) {
      throw new Error('Only integers and null are allowed!');
    }
  }

  /**
   * Set a pixel of this tile. Internally counts the set pixels.
   */
  setPixel (x, y, color) {
    Tile.checkColor(color);
    let index = Tile.getIndex(x, y);
    let oldColor = this.getPixelByIndex(index);
    if (color === null && oldColor !== null) {
      this.filledPixelsCount--;
    }
    else if (color !== null && oldColor === null) {
      this.filledPixelsCount++;
    }
    this.data[ index ] = color;
  }

  /** iterates over each tile pixel (color, x, y) */
  forEachPixel (callback) {
    this.data.forEach((color, index) => {
      if(color !== null) {
        callback(color, index % Tile.SIZE, Math.floor(index/Tile.SIZE))
      }
    })
  }
}
//size of all tiles in width and height
Tile.SIZE = 16;
Tile.getIndex = (x, y) => {
  Tile.checkBounds(x);
  Tile.checkBounds(y);
  return x + Tile.SIZE * y
}
module.exports = Tile