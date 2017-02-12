'use strict'

const Keys = require('./Keys')
const getJsonPath = require('jsonpath-plus')

// checks whether all spriteIds exist in the container and not more
function validator (format) {
  let model = format.getMetaObject(Keys.ModelKey)
  let spriteIds = getJsonPath({
    json: model,
    path: '$..spriteId'
  })
  spriteIds.forEach(spriteId => {
    if (format.getSprite(spriteId) === null) {
      throw new Error('Missing sprite ' + spriteId + '!')
    }
  })
  format.forEachSprite(sprite => {
    if (spriteIds.indexOf(sprite.id) === -1) {
      throw new Error('Unnecessary sprite ' + sprite.id + '!')
    }
  })
}

module.exports = validator
