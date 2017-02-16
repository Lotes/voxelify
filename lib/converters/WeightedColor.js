'use strict'

/**
 * Weighted color is needed to mix multiple color values to one color value.
 */
class WeightedColor {
  /**
   * Creates a WeightedColor
   */
  constructor () {
    this.weight = 0
    this.$r = 0
    this.$g = 0
    this.$b = 0
  }

  /**
   * Clones this WeightedColor
   * @returns {WeightedColor} a copy of this
   */
  clone () {
    const result = new WeightedColor()
    result.weight = this.weight
    result.$r = this.$r
    result.$g = this.$g
    result.$b = this.$b
    return result
  }

  /**
   * Adds color information for mixing.
   * @param {Number|WeightedColor} color information to be added
   * @param {Number} weight of this color
   * @returns {void}
   */
  add (color, weight) {
    if (color instanceof WeightedColor) {
      this.weight += color.weight
      this.$r += color.$r
      this.$g += color.$g
      this.$b += color.$b
    } else {
      this.weight += weight || 1
      this.$r += (color >> 16) & 0xff
      this.$g += (color >> 8) & 0xff
      this.$b += (color >> 0) & 0xff
    }
  }

  /**
   * Red component
   * @returns {number} the average red component between 0 and 255
   */
  get r () {
    return Math.min(0xff, Math.max(0, Math.round(this.$r / this.weight)))
  }

  /**
   * Green component
   * @returns {number} the average green component between 0 and 255
   */
  get g () {
    return Math.min(0xff, Math.max(0, Math.round(this.$g / this.weight)))
  }

  /**
   * Blue component
   * @returns {number} the average blue component between 0 and 255
   */
  get b () {
    return Math.min(0xff, Math.max(0, Math.round(this.$b / this.weight)))
  }

  /**
   * The color value
   * @returns {number} a 32 bit color value
   */
  get value () {
    return ((0xff << 24) >>> 0) + ((this.r << 16) >>> 0) + ((this.g << 8) >>> 0) + ((this.b << 0) >>> 0)
  }
}

module.exports = WeightedColor
