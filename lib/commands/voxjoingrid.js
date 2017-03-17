#!/usr/bin/env node

'use strict'

const program = require('commander')
const utils = require('./../utils')
const Formats = require('../formats/index')
const Keys = require('../formats/Keys')
const Promise = require('bluebird')

const ProgressMonitor = utils.ProgressMonitor
const errorAndExit = utils.errorAndExit
const toAscending = utils.toAscending
const loadImage = utils.loadImage
const convertImageToPixelData = utils.convertImageToPixelData
const Container = require('../formats/Container')

const IndexPattern = '+index+'
const DefaultOrder = 'asc'
program
    .version('1.0.0')
    .usage('<filenamepattern> [options]')
    .description(`Joins single PNG files of same size to a voxelify grid format. You MUST use '${IndexPattern}' in the input filename pattern to indicate the running number.`)
    .option('-o, --output-file <filename>', 'Voxelify grid output file name; omit to print out to STDOUT', null)
    .option('-p, --progress', 'prints the progress to the STDERR', false)
    .option('-s, --sorting <asc|desc>', `order of the layers, defaults to ${DefaultOrder}`, toAscending, toAscending(DefaultOrder))
    .parse(process.argv)

// determine output file names
const outputFileName = program.outputFile

// input voxelify model as buffer
if (program.args.length === 0 || program.args[0].indexOf(IndexPattern) === -1) {
  errorAndExit(program, `Please provide a input filename pattern using a '${IndexPattern}' marker to indicate the running number.`);
}
const inputFilePattern = program.args[0]
const inputFileNamesPromise = utils.getFilesWithIndexPattern(inputFilePattern, IndexPattern)

// determine order
const doOrderAscending = program.sorting

// determine progress
const doProgress = program.progress

// read in all image files and transform them into the own format
const container = new Container()
const model = {
  format: 'grid-1.0.0',
  layers: []
}
container.setMetaObject(Keys.ModelKey, model)
const monitor = new ProgressMonitor(doProgress)
inputFileNamesPromise
  .then(inputFileNamesArray => {
    if (inputFileNamesArray.length === 0) {
      errorAndExit(program, 'No input files.')
    }
    const inputFileNames = doOrderAscending
      ? inputFileNamesArray
      : Array.reverse(inputFileNamesArray)
    return Promise.map(inputFileNames, inputFileName => loadImage(inputFileName))
  })
  .then(images => images.map(convertImageToPixelData))
  .then(pixels => {
    const first = pixels[0]
    if (!pixels.every(imageData => imageData.width === first.width && imageData.height === first.height)) {
      errorAndExit(program, 'All images must have the same dimensions!')
    }
    monitor.step(0, pixels.length)
    pixels.forEach((imageData, imageIndex) => {
      const sprite = container.addSprite()
      const width = imageData.width
      const data = imageData.data
      let minX
      let minY
      let first = true
      for (let index = 0; index < data.length; index += 4) {
        const color = utils.pixelToColor(data, index)
        if (index === 0) {
          continue;
        }
        const x = index % width
        const y = Math.floor(index / width)
        if (first) {
          minX = x
          minY = y
          first = false
        } else {
          minX = Math.min(x, minX)
          minY = Math.max(y, minY)
        }
        sprite.setPixel(x, y, color)
      }
      let layer
      if (first) {
        layer = null
      } else {
        layer = {
          targetX: minX,
          targetY: minY,
          spriteId: sprite.id
        }
      }
      model.layers.push(layer)
      monitor.step(imageIndex + 1, pixels.length)
    })
    return container
  })
  .then(container => Formats.save(container))
  .then(buffer => utils.outputBuffer(buffer, outputFileName))
  .catch(err => errorAndExit(program, err.message))
