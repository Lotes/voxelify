'use strict'

const Keys = require('./Keys')
const getJsonPath = require('jsonpath-plus')

/**
 * Checks whether all spriteIds exist in the container and not more
 * @param {Container} format containing sprites and meta objects
 * @returns {void} nothing
 * @throws {Error} if container contains invalid spriteIds
 */
function validator (format) {
  let model = format.getMetaObject(Keys.ModelKey)
  let spriteIds = getJsonPath({
    json: model,
    path: '$..spriteId'
  })
  spriteIds.forEach(spriteId => {
    if (format.getSprite(spriteId) === null) {
      throw new Error(`Missing sprite ${spriteId}!`)
    }
  })
  format.forEachSprite(sprite => {
    if (spriteIds.indexOf(sprite.id) === -1) {
      throw new Error(`Unnecessary sprite ${sprite.id}!`)
    }
  })
}

module.exports = validator
