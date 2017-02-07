'use strict';

const JSZip = require('jszip')
const Format = require('./Format')
const Canvas = require('canvas')

class Writer {
  constructor() {}

  write(format) {
    if(!(format instanceof Format)) {
      throw new Error('Format expected')
    }

    let zip = new JSZip()

    // save meta objects
    format.forEachMetaObject((metaObject, key) => {
      let fileName = key + '.json'
      let fileContent = JSON.stringify(metaObject)
      zip.file(fileName, fileContent)
    })

    //save sprites
    format.forEachSprite((sprite, key) => {
      let fileName = key + '.png'

      //get bounds
      let minX = 0, minY = 0, maxX = 1, maxY = 1, first = true
      sprite.forEachPixel((color, x, y) => {
        if (first) {
          minX = maxX = x
          minY = maxY = y
          first = false
        } else {
          minX = Math.min(minX, x)
          maxX = Math.max(maxX, x)
          minY = Math.min(minY, y)
          maxY = Math.max(maxY, y)
        }
      })
      let width = maxX - minX + 1
      let height = maxY - minY + 1

      //draw pixels on canvas
      let canvas = new Canvas(width, height)
      let context = canvas.getContext('2d')
      let imageData = context.createImageData(width, height)
      let data = imageData.data
      sprite.forEachPixel((color, x, y) => {
        let index = 4 * (x + y * width)
        data[index    ] = (color >> 16) & 0xff
        data[index + 1] = (color >>  8) & 0xff
        data[index + 2] = (color >>  0) & 0xff
        data[index + 3] = (color >> 24) & 0xff
      })
      context.putImageData(imageData, 0, 0)
      let base64Content = canvas.toDataURL().split(',')[1]
      zip.file(fileName, base64Content, {base64: true})
    })

    return zip.generateAsync({type:'nodebuffer'})
  }
}

module.exports = Writer