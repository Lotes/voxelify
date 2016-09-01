class WeightedColor {
  constructor() {
    this.weight = 0
    this._r = 0
    this._g = 0
    this._b = 0
  }
  clone() {
    const result = new WeightedColor()
    result.weight = this.weight
    result._r = this._r
    result._g = this._g
    result._b = this._b
    return result
  }
  add(color, weight) {
    if(color instanceof WeightedColor) {
      this.weight += color.weight
      this._r += color._r
      this._g += color._g
      this._b += color._b
    } else {
      weight = weight || 1
      this.weight += weight
      this._r += (color >> 16) & 0xff
      this._g += (color >>  8) & 0xff
      this._b += (color >>  0) & 0xff
    }
  }
  get r() {
    return Math.min(0xff, Math.max(0, Math.round(this._r / this.weight)))
  }
  get g() {
    return Math.min(0xff, Math.max(0, Math.round(this._g / this.weight)))
  }
  get b() {
    return Math.min(0xff, Math.max(0, Math.round(this._b / this.weight)))
  }
  get value() {
    return (this.r << 16) + (this.g << 8) + (this.b << 0)
  }
}

module.exports = WeightedColor
