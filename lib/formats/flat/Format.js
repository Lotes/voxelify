'use strict'

const FormatBuilder = require('../base/FormatBuilder')

const ModelSchema = require('./model.schema.json')

let Format = new FormatBuilder()
  .meta(Format.ModelKey, ModelSchema)
  .validation(format => {
    let model = format.getMetaObject(Format.ModelKey)
    let spriteId = model.spriteId
    if (format.getSprite(spriteId) === null) {
      throw new Error('Missing sprite ' + spriteId + '!')
    }
  })
  .build()

Format.ModelKey = 'model'

module.exports = Format
