'use strict'

const FormatBuilder = require('../base/FormatBuilder')

const Keys = require('../Keys')
const ModelSchema = require('./model.schema.json')
const spriteIdValidator = require('../spriteId.validator')

let Format = new FormatBuilder()
  .meta(Keys.ModelKey, ModelSchema)
  .validation(spriteIdValidator)
  .build()

module.exports = Format
