'use strict'

const validate = require('jsonschema').validate
const Container = require('./Container')
const tagsSchema = require('./tags.schema.json')

class FormatBuilder {
  constructor () {
    this._metaMap = new Map()
    this._validators = []
    this.meta(FormatBuilder.TagsKey, tagsSchema)
  }
  meta (key, jsonSchema) {
    this._metaMap.set(key, jsonSchema)
    return this
  }
  validation (validate) {
    if (typeof validate !== 'function') {
      throw new Error('Validators must be functions of type Action<object>!')
    }
    this._validators.push(validate)
    return this
  }
  build () {
    let builder = this

    function checkFormat (container) {
      builder._metaMap.forEach((schema, key) => {
        if (!validate(container.getMetaObject(key), schema).valid) {
          throw new Error('Meta object `' + key + '` is not valid!')
        }
      })
      builder._validators.forEach(validate => validate())
    }

    class Format extends Container {
      save () {
        checkFormat(this)
        return super.save()
      }
      load (buffer) {
        return super.load(buffer)
          .then(container => {
            checkFormat(container)
            return container
          })
      }
    }

    return Format
  }
}

FormatBuilder.TagsKey = 'tags'

module.exports = FormatBuilder
