#!/usr/bin/env node

'use strict'

const program = require('commander')
const utils = require('./utils')
const Formats = require('../formats/index')
const Keys = require('../formats/Keys')
const fs = require('fs')
const Promise = require('bluebird')
const Canvas = require('canvas')

const ProgressMonitor = utils.ProgressMonitor
const errorAndExit = utils.errorAndExit
const toAscending = utils.toAscending

const IndexPattern = ':index:'
const DefaultOutputFilesPattern = `layer_${IndexPattern}.png`
const DefaultOrder = 'asc'
program
    .version('1.0.0')
    .usage('[filename] [options]')
    .description('Splits a grid format into single layer PNG files of same size.')
    .option('-o, --output-files <filenamepattern>', `PNG output file names; use ${IndexPattern} for placing an index. Defaults to '${DefaultOutputFilesPattern}'`, DefaultOutputFilesPattern)
    .option('-p, --progress', 'prints the progress to the STDERR', false)
    .option('-s, --sorting <asc|desc>', `order of the layers, defaults to ${DefaultOrder}`, toAscending, toAscending(DefaultOrder))
    .parse(process.argv)

// determine output file names
const outputFilePattern = program.outputFiles
const indexPattern = new RegExp(IndexPattern, 'g')
const getOutputFileName = indexStr => outputFilePattern.replace(indexPattern, indexStr)

// input voxelify model as buffer
const fileName = program.args.length === 0
  ? null
  : program.args[0]
const bufferPromise = utils.getVoxelifyInput(fileName)

// determine order
const doOrderAscending = program.sorting

// determine progress
const doProgress = program.progress

bufferPromise
  .then(buffer => Formats.load(buffer))
  .then(container => {
    const model = container.getMetaObject(Keys.ModelKey)
    if (!model.format.startsWith('grid-')) {
      errorAndExit(program, 'File must be in grid format!')
    }
    const count = model.layers.length
    const digitsCount = Math.ceil(Math.log10(count + 1))
    // get dimensions
    let maxX, maxZ, minX, minZ
    let first = true
    model.layers.forEach(layer => {
      if (layer === null) {
        return
      }
      const offsetX = layer.targetX
      const offsetZ = layer.targetY
      const sprite = container.getSprite(layer.spriteId)
      sprite.forEachPixel((color, x, z) => {
        const actualX = offsetX + x
        const actualZ = offsetZ + z
        if (first) {
          minX = actualX
          maxX = actualX
          minZ = actualZ
          maxZ = actualZ
          first = false
        } else {
          minX = Math.min(minX, actualX)
          maxX = Math.max(maxX, actualX)
          minZ = Math.min(minZ, actualZ)
          maxZ = Math.max(maxZ, actualZ)
        }
      })
    })
    const deltaX = maxX - minX + 1
    const deltaZ = maxZ - minZ + 1
    // get pixel data
    let progress = new ProgressMonitor(doProgress)
    let finished = 0
    const promises = model.layers.map((layer, index) => {
      if (layer === null) {
        return Promise.resolve()
      }

      // create bitmap and fill
      const canvas = new Canvas(deltaX, deltaZ)
      const context = canvas.getContext('2d')
      context.fillStyle = 'rgba(0,0,0,0)'
      context.fillRect(0, 0, deltaX, deltaZ)
      const imageData = context.getImageData(0, 0, deltaX, deltaZ)

      // copy pixels
      const offsetX = layer.targetX
      const offsetZ = layer.targetY
      const sprite = container.getSprite(layer.spriteId)
      sprite.forEachPixel((color, x, z) => {
        const actualX = offsetX + x
        const actualZ = offsetZ + z
        const pixelIndex = actualZ * deltaX + actualX
        const pixelIndexX4 = pixelIndex * 4
        imageData.data[pixelIndexX4] = (color >> 16) & 0xff
        imageData.data[pixelIndexX4 + 1] = (color >> 8) & 0xff
        imageData.data[pixelIndexX4 + 2] = color & 0xff
        imageData.data[pixelIndexX4 + 3] = (color >> 24) & 0xff
      })
      context.putImageData(imageData, 0, 0)

      // determine filename
      let actualIndex
      if (doOrderAscending) {
        actualIndex = index + 1
      } else {
        actualIndex = count - index
      }
      let indexStr = actualIndex.toString()
      while (indexStr.length < digitsCount) {
        indexStr = `0${indexStr}`
      }
      const pngName = getOutputFileName(indexStr)

      // save layer
      return new Promise((resolve, reject) => {
        canvas.toBuffer((err, buffer) => {
          if (err) reject(err)
          else {
            fs.writeFile(pngName, buffer, err2 => {
              if (err2) reject(err2)
              else {
                finished++
                progress.step(finished, count)
                resolve()
              }
            })
          }
        })
      })
    })
    return Promise.all(promises)
  })
