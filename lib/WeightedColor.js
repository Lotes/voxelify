class WeightedColor {
  constructor() {
    this.weight = 0
    this.r = 0
    this.g = 0
    this.b = 0
  }
  add(color, weight) {
    if(color instanceof WeightedColor) {
      this.weight += color.weight
      this.r += color.r
      this.g += color.g
      this.b += color.b
    } else {
      weight = weight || 1
      this.weight += weight
      this.r += (color >> 16) & 0xff
      this.g += (color >>  8) & 0xff
      this.b += (color >>  0) & 0xff
    }
  }
  get value() {
    const r = Math.min(0xff, Math.max(0, Math.round(this.r / this.weight)))
    const g = Math.min(0xff, Math.max(0, Math.round(this.g / this.weight)))
    const b = Math.min(0xff, Math.max(0, Math.round(this.b / this.weight)))
    return (r << 16) + (g << 8) + (b << 0)
  }
}

module.exports = WeightedColor
