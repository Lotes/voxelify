/* globals describe, it */

const Container = require('../lib/formats/base/Container')
const validate = require('jsonschema').validate
const flatSchema = require('../lib/formats/flat/model.schema.json')
const gridSchema = require('../lib/formats/grid/model.schema.json')
const assembledSchema = require('../lib/formats/assembled/model.schema.json')
const tagsSchema = require('../lib/formats/base/tags.schema.json')

describe('Format', function() {
  describe('Container', function() {
    it('should save and load', function(done) {
      let container = new Container()
      let sprite = container.addSprite()
      sprite.setPixel(0,   0, 0xff000000)
      sprite.setPixel(10,  0, 0xff000000)
      sprite.setPixel( 0, 10, 0xff000000)
      sprite.setPixel(10, 10, 0xff000000)
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

  describe('Schemas', function() {
    it('should accept tags', function() {
      validate(["a", "b", "c"], tagsSchema).valid.should.be.true()
    })

    it('should accept flat', function() {
      validate({
        format: "flat-v1.0.0",
        spriteId: 123
      }, flatSchema).valid.should.be.true()
    })

    it('should accept grid', function() {
      validate({
        format: "grid-v1.0.0",
        layers: [
          null,
          { spriteId: 123, targetX: 0, targetY: 0 },
          { spriteId: 456 },
        ]
      }, gridSchema).valid.should.be.true()
    })

    it('should accept assembled', function() {
      validate({
        format: "assembled-v1.0.0",
        definitions: {
          side: {
            type: "data",
            spriteId: 123,
            centerX: 0,
            centerY: 0,
            translation: { x: 1, y: 2, z: 3.3 },
            rotation: { type: "quaternion", w: 1, x: 0, y: 0, z: 0 }
          }
        },
        children: [
          {
            type: "group",
            children: []
          },
          {
            type: "use",
            reference: "side",
            rotation: { type: "euler", order: "xyz", x: 90, y: 90, z: 0 }
          }
        ]
      }, assembledSchema).valid.should.be.true()
    })
  })
})