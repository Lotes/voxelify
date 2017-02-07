'use strict'

const JSZip = require('jszip')
const Promise = JSZip.external.Promise
const Format = require('./Format')
const Canvas = require('canvas')
const Image = Canvas.Image

const regexJsonExtension = /^(.*)\.json$/
const regexPngExtension = /^(.*)\.png$/

class Reader {
  constructor() {}
  read(buffer) {
    let zip = new JSZip()
    return zip.loadAsync(buffer)
      .then(() => {
        let format = new Format()
        let promises = Object.keys(zip.files).map((fileName) => {
          // work on Json files
          let resultJson = regexJsonExtension.exec(fileName)
          if(resultJson) {
            let key = resultJson[1]
            return zip.file(fileName)
              .async('string')
              .then(str => {
                let obj = JSON.parse(str)
                format.setMetaObject(key, obj)
              })
          }
          let resultPng = regexPngExtension.exec(fileName)
          if(resultPng) {
            let key = parseInt(resultPng[1], 10)
            return zip.file(fileName)
              .async('base64')
              .then(base64 => {
                let dataUrl = 'data:image/png;base64,'+base64
                let image = new Image()
                return new Promise((resolve, reject) => {
                  image.onload = () => {
                    resolve(image)
                  }
                  image.onerror = (err) => {
                    reject(err)
                  }
                  image.src = dataUrl
                })
              })
              .then((image) => {
                let canvas = new Canvas(image.width, image.height)
                let context = canvas.getContext('2d')
                context.drawImage(image, 0, 0)
                let imageData = context.getImageData(0, 0, image.width, image.height)
                let data = imageData.data
                let sprite = format.addSprite(key)
                let pixelCount = image.width * image.height
                for(let index = 0; index < 4*pixelCount; index += 4) {
                  let color = ((data[index] << 16) >>> 0)
                    + ((data[index + 1] << 8) >>> 0)
                    + ((data[index + 2] << 0) >>> 0)
                    + ((data[index + 3] << 24) >>> 0)
                  if(color !== 0) {
                    let x = (index/4) % image.width
                    let y = Math.floor((index/4) / image.width)
                    sprite.setPixel(x, y, color)
                  }
                }
              })
          }
          return new Promise((resolve) => resolve())
        })
        return Promise.all(promises).then(() => {
          return format
        })
      })
  }
}

module.exports = Reader

