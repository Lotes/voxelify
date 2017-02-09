'use strict'

const JSZip = require('jszip')
const Canvas = require('canvas')
const Sprite = require('./Sprite')
const Promise = JSZip.external.Promise
const Image = Canvas.Image

const regexJsonExtension = /^(.*)\.json$/
const regexPngExtension = /^(.*)\.png$/

class Container {
  constructor () {
    this.spriteIdCounter = 0
    this.sprites = new Map()
    this.metaObjects = new Map()
  }

  addSprite (optionalId) {
    let id
    if (typeof optionalId === 'number') {
      id = optionalId
      this.spriteIdCounter = Math.max(id + 1, this.spriteIdCounter)
    } else {
      id = this.spriteIdCounter++
    }
    let sprite = new Sprite(id)
    this.sprites.set(id, sprite)
    return sprite
  }

  getSprite (id) {
    return this.sprites.has(id) ? this.sprites.get(id) : null
  }

  removeSprite (id) {
    this.sprites.delete(id)
  }

  forEachSprite (callback) {
    this.sprites.forEach(callback)
  }

  getMetaObject (key) {
    return this.metaObjects.has(key) ? this.metaObjects.get(key) : null
  }

  setMetaObject (key, value) {
    this.metaObjects.set(key, value)
  }

  removeMetaObject (key) {
    this.metaObjects.delete(key)
  }

  forEachMetaObject (callback) {
    this.metaObjects.forEach(callback)
  }

  clear () {
    this.metaObjects.clear()
    this.sprites.clear()
  }

  // returns a Promise<Buffer>
  save () {
    let container = this
    let zip = new JSZip()

    // save meta objects
    container.forEachMetaObject((metaObject, key) => {
      let fileName = key + '.json'
      let fileContent = JSON.stringify(metaObject)
      zip.file(fileName, fileContent)
    })

    // save sprites
    container.forEachSprite((sprite, key) => {
      let fileName = key + '.png'

      // get bounds
      let minX = 0
      let minY = 0
      let maxX = 1
      let maxY = 1
      let first = true
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

      // draw pixels on canvas
      let canvas = new Canvas(width, height)
      let context = canvas.getContext('2d')
      let imageData = context.createImageData(width, height)
      let data = imageData.data
      sprite.forEachPixel((color, x, y) => {
        let index = 4 * ((x - minX) + (y - minY) * width)
        data[index] = (color >> 16) & 0xff
        data[index + 1] = (color >> 8) & 0xff
        data[index + 2] = (color >> 0) & 0xff
        data[index + 3] = (color >> 24) & 0xff
      })
      context.putImageData(imageData, 0, 0)
      let base64Content = canvas.toDataURL().split(',')[1]
      zip.file(fileName, base64Content, {base64: true})
    })

    return zip.generateAsync({type: 'nodebuffer'})
  }

  // returns Promise<this>
  load (buffer) {
    let container = this
    container.clear()
    let zip = new JSZip()
    return zip.loadAsync(buffer)
      .then(() => {
        let promises = Object.keys(zip.files).map((fileName) => {
          // work on Json files
          let resultJson = regexJsonExtension.exec(fileName)
          if (resultJson) {
            let key = resultJson[ 1 ]
            return zip.file(fileName)
              .async('string')
              .then(str => {
                let obj = JSON.parse(str)
                container.setMetaObject(key, obj)
              })
          }
          let resultPng = regexPngExtension.exec(fileName)
          if (resultPng) {
            let key = parseInt(resultPng[ 1 ], 10)
            return zip.file(fileName)
              .async('base64')
              .then(base64 => {
                let dataUrl = 'data:image/png;base64,' + base64
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
                let sprite = container.addSprite(key)
                let pixelCount = image.width * image.height
                for (let index = 0; index < 4 * pixelCount; index += 4) {
                  let color = ((data[index] << 16) >>> 0) +
                    ((data[ index + 1 ] << 8) >>> 0) +
                    ((data[ index + 2 ] << 0) >>> 0) +
                    ((data[ index + 3 ] << 24) >>> 0)
                  if (color !== 0) {
                    let x = (index / 4) % image.width
                    let y = Math.floor((index / 4) / image.width)
                    sprite.setPixel(x, y, color)
                  }
                }
              })
          }
          return new Promise((resolve) => resolve())
        })
        return Promise.all(promises).then(() => {
          return container
        })
      })
  }
}

Container.EXTENSION = '.vxz'

module.exports = Container
