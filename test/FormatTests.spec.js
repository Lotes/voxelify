/* globals describe, it */

const Container = require('../lib/formats/Container')
const validate = require('jsonschema').validate
const flatSchema = require('../lib/formats/flat/1.0.0/model.schema.json')
const gridSchema = require('../lib/formats/grid/1.0.0/model.schema.json')
const assembledSchema = require('../lib/formats/assembled/1.0.0/model.schema.json')
const tagsSchema = require('../lib/formats/tags.schema.json')
const Keys = require('../lib/formats/Keys')
const spriteIdValidator = require('../lib/formats/spriteId.validator')

function addSprite (container) {
  let sprite = container.addSprite()
  sprite.setPixel(0, 0, 0xff000000)
  sprite.setPixel(10, 0, 0xff000000)
  sprite.setPixel(0, 10, 0xff000000)
  sprite.setPixel(10, 10, 0xff000000)
  return sprite
}

describe('Format', function () {
  describe('Container', function () {
    it('should save and load', function (done) {
      let container = new Container()
      addSprite(container)
      container.setMetaObject('meta', {
        hallo: 'welt'
      })
      container.save()
        .then(buffer => {
          let outContainer = new Container()
          return outContainer.load(buffer)
        })
        .then(outContainer => {
          container.forEachSprite((sprite, key) => {
            let outSprite = outContainer.getSprite(key)
            sprite.forEachPixel((color, x, y) => {
              outSprite.getPixel(x, y).should.be.equal(color)
            })
          })
          container.forEachMetaObject((obj, key) => {
            let outObj = outContainer.getMetaObject(key)
            outObj.should.eql(obj)
          })
          done()
        })
        .catch(err => console.log(err))
    })
  })

  describe('Validators', function () {
    describe('spriteId', function () {
      function verifier (container) {
        return function executeValidator () {
          spriteIdValidator(container)
        }
      }

      it('should accept valid sprite ids', function () {
        let container = new Container()
        let sprite = addSprite(container)
        container.setMetaObject(Keys.ModelKey, {
          spriteId: sprite.id,
          xxx: {
            spriteId: sprite.id
          }
        })
        verifier(container).should.not.throwError()
      })

      it('should detect missing sprites', function () {
        let container = new Container()
        container.setMetaObject(Keys.ModelKey, {
          spriteId: 123
        })
        verifier(container).should.throwError()
      })

      it('should detect unnecessary sprites', function () {
        let container = new Container()
        addSprite(container)
        verifier(container).should.throwError()
      })
    })
  })

  describe('Schemas', function () {
    function createVerifier (schema) {
      return function verifier (model) {
        return function execute () {
          if (!validate(model, schema).valid) {
            throw new Error('Schema mismatch!')
          }
        }
      }
    }

    describe('tags', function () {
      let verifier = createVerifier(tagsSchema)

      it('should accept tags', function () {
        verifier(['a', 'b', 'c']).should.not.throwError()
      })

      it('should reject non-unique tags', function () {
        verifier(['a', 'a']).should.throwError()
      })
    })

    describe('flat-1.0.0', function () {
      let verifier = createVerifier(flatSchema)

      it('should accept flat', function () {
        verifier({
          format: 'flat-1.0.0',
          spriteId: 123
        }).should.not.throwError()
      })
    })

    describe('grid-1.0.0', function () {
      let verifier = createVerifier(gridSchema)
      it('should accept grid', function () {
        verifier({
          format: 'grid-1.0.0',
          layers: [
            null,
            { spriteId: 123, targetX: 0, targetY: 0 },
            { spriteId: 456 }
          ]
        }).should.not.throwError()
      })
    })

    describe('assembled-1.0.0', function () {
      let verifier = createVerifier(assembledSchema)
      it('should accept assembled', function () {
        verifier({
          format: 'assembled-1.0.0',
          definitions: {
            side: {
              type: 'data',
              spriteId: 123,
              centerX: 0,
              centerY: 0,
              translation: { x: 1, y: 2, z: 3.3 },
              rotation: { type: 'quaternion', w: 1, x: 0, y: 0, z: 0 }
            }
          },
          children: [
            {
              type: 'group',
              children: []
            },
            {
              type: 'use',
              reference: 'side',
              rotation: { type: 'euler', order: 'xyz', x: 90, y: 90, z: 0 }
            }
          ]
        }).should.not.throwError()
      })
    })
  })
})
