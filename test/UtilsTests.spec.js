/* globals describe, it */

'use strict'

const utils = require('../lib/utils')
const path = require('path')

describe('Utils', function () {
  it('should load all three files by path pattern', function (done) {
    const pattern = path.join(__dirname, 'data', 'pathPattern', 'a+index+.txt')
    utils.getFilesWithIndexPattern(pattern, '+index+')
      .then(files => {
        files.length.should.be.equal(3)
        done()
      })
      .catch(done)
  })
})
