/* globals describe, it */

const Format = require('../lib/formats/vox-zip/Format')
const Writer = require('../lib/formats/vox-zip/Writer')
const Reader = require('../lib/formats/vox-zip/Reader')

describe('Format', function() {
  it('should write and read model', function(done) {
    let format = new Format()
    let sprite = format.addSprite()
    sprite.setPixel(0,   0, 0xff000000)
    sprite.setPixel(10,  0, 0xff000000)
    sprite.setPixel( 0, 10, 0xff000000)
    sprite.setPixel(10, 10, 0xff000000)
    format.setMetaObject('meta', {
      hallo: 'welt'
    })
    let writer = new Writer()
    writer.write(format)
      .then(buffer => {
        let reader = new Reader()
        return reader.read(buffer)
      })
      .then(outFormat => {
        format.forEachSprite((sprite, key) => {
          let outSprite = outFormat.getSprite(key)
          sprite.forEachPixel((color, x, y) => {
            outSprite.getPixel(x, y).should.be.equal(color)
          })
        })
        format.forEachMetaObject((obj, key) => {
          let outObj = outFormat.getMetaObject(key)
          outObj.should.eql(obj)
        })
        done()
      })
      .catch(err => console.log(err))
  })
})