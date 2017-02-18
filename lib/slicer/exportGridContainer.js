'use strict'

const Container = require('../formats/Container')
const Keys = require('../formats/Keys')

/**
 * Saves the grid layer for laye into a PNG file
 * @param {WeightedColorGrid} colorGrid the color grid you want to export
 * @returns {Promise<void>} a promise returning when finished
 */
function toGridContainer (colorGrid) {
  const container = new Container()

  // build sprites
  const layers = new Map()
  const borders = {
    initialized: false,
    minY: null,
    maxY: null
  }
  colorGrid.forEach(function (x, y, z, color) {
    let sprite = null
    if (layers.has(y)) {
      const data = layers.get(y)
      data.minX = Math.min(data.minX, x)
      data.minZ = Math.min(data.minZ, z)
      sprite = data.sprite
    } else {
      sprite = container.addSprite()
      layers.set(y, {
        minX: x,
        minZ: z,
        sprite: sprite
      })
    }
    const value = color.weight > 0
      ? color.value
      : ((0x80 << 24) >>> 0)
    sprite.setPixel(x, z, value)

    if (borders.initialized) {
      borders.minY = Math.min(borders.minY, y)
      borders.maxY = Math.max(borders.maxY, y)
    } else {
      borders.initialized = true
      borders.minY = y
      borders.maxY = y
    }
  })

  // build meta model
  if (!borders.initialized) {
    throw new Error('Color grid did not seem to have color information!')
  }
  let model = {
    format: 'grid-1.0.0',
    layers: []
  }
  for (let y = borders.maxY; y >= borders.minY; y--) {
    if (layers.has(y)) {
      const data = layers.get(y)
      model.layers.push({
        spriteId: data.sprite.id,
        targetX: data.minX,
        targetY: data.minZ
      })
    } else {
      model.layers.push(null)
    }
  }
  container.setMetaObject(Keys.ModelKey, model)

  // return container
  return container
}

module.exports = toGridContainer
