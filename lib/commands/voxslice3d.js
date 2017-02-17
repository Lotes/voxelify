#!/usr/bin/env node

'use strict'

const program = require('commander')
const fs = require('fs')
const THREE = require('../shared/node-three/index').THREE
const ThreeExtensions = require('../converters/ThreeExtensions')
const Voxelifier = require('../converters/Voxelifier')
const exportGridContainer = require('../exporters/exportGridContainer')
const Formats = require('../formats/index')
const Promise = require('bluebird')

const inputModelLoaders = {
  obj: ThreeExtensions.loadOBJ
}
const autoFormat = 'auto'
const regexFormats = new RegExp(`^(${autoFormat}|${Object.keys(inputModelLoaders).join('|')})$`, 'i')
const regexExtension = /\.([a-z\d_]+)$/i

/**
 * Converts a string into an integer (base 10)
 * @param {String} str the text containing the number
 * @returns {Number} the number
 */
function toInteger (str) {
  return parseInt(str, 10)
}

/**
 * Determines if the given path is a existing file.
 * @param {String} fileName the path of the file
 * @returns {boolean} true, iff the path is an existing file
 */
function isFile (fileName) {
  try {
    return fs.statSync(fileName).isFile()
  } catch (e) {
    return false
  }
}

/**
 * prints error to STDERR and exits with code 1
 * @param {String} message the error message
 * @returns {void}
 */
function errorAndExit (message) {
  console.error(`${message}\n`)
  program.outputHelp()
  process.exit(1)
}

program
  .version('1.0.0')
  .usage('filename size -m|M [options]')
  .description('Slices a given 3D model into a colored voxel model of a given size.')
  .option('-f, --format <format>', 'input format, defaults to `auto`', regexFormats, 'auto')
  .option('-o, --output-file <filename>', '`voxelify` output file; omit to print to STDOUT', null)
  .option('-m, --min-size', 'size mode is `minimum`', false)
  .option('-M, --max-size', 'size mode is `maximum`', false)
  .option('-t, --thickness <size>', 'thickness of the output model (defaults to infinity)', toInteger, null)
  .option('-r, --rotation-order <xyz|xzy|...>', 'order of Euler rotation (default: xyz)', /^(xyz|xzy|yzx|yxz|zxy|zyx)$/i, 'xyz')
  .option('-x, --x-axis-rotation', 'x axis rotation in degree (default: 0)', parseFloat, 0)
  .option('-y, --y-axis-rotation', 'y axis rotation in degree (default: 0)', parseFloat, 0)
  .option('-z, --z-axis-rotation', 'z axis rotation in degree (default: 0)', parseFloat, 0)
  .option('-p, --progress', 'prints the progress to the STDERR', false)
  .parse(process.argv)

// REQUIRED input option
if (program.args.length !== 2) {
  errorAndExit('Filename, size and size mode flag missing')
}
let inputFileName = program.args[0]
if (inputFileName === null || !isFile(inputFileName)) {
  errorAndExit('Invalid input filename!\n')
}

// REQUIRED size option
let doMaxSize = false
let size = toInteger(program.args[1])
if (!program.minSize && !program.maxSize) {
  errorAndExit('Minimum or maximum flag must be given!')
} else if (program.minSize && program.maxSize) {
  errorAndExit('Only one size (not both, min and max) must be given!')
}
doMaxSize = program.maxSize === true

// OPTIONAL format option
let inputFormat = program.format.toLowerCase()
if (inputFormat === autoFormat) {
  let match = regexExtension.exec(inputFileName)
  if (match === null) {
    errorAndExit('Unknown format!')
  }
  inputFormat = match[1].toLowerCase()
}
if (!(inputFormat in inputModelLoaders)) {
  errorAndExit('Unknown format!')
}
let loadModel = inputModelLoaders[inputFormat]

// OPTIONAL output filename option
let outputFileName = program.outputFile
let doOutputToStdOut = outputFileName === null

// OPTIONAL thickness option
let thickness = program.thickness
if (thickness === null || thickness <= 0) {
  thickness = Number.POSITIVE_INFINITY
}

// OPTIONAL progress option
let doProgress = program.progress

// OPTIONAL rotation order option
let rotation = new THREE.Euler(
  program.xAxisRotation,
  program.yAxisRotation,
  program.zAxisRotation,
  program.rotationOrder.toLowerCase()
)
let quaternion = new THREE.Quaternion().setFromEuler(rotation)

// execute actual voxelify algorithm
loadModel(inputFileName)
  .then(object => {
    const voxelifier = new Voxelifier(object, quaternion, size, doMaxSize)
    let progress = null
    if (doProgress) {
      progress = (index, maximum) => {
        const percentage = Math.floor(100 * index / maximum)
        console.error(`${percentage} % (${index}/${maximum})`)
      }
    }
    const colorGrid = voxelifier.compute(progress)
    const container = exportGridContainer(colorGrid)
    return Formats.save(container)
  })
  .then(buffer => new Promise((resolve, reject) => {
    const callback = err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    }
    if (doOutputToStdOut) {
      process.stdout.write(buffer, callback)
    } else {
      fs.writeFile(outputFileName, buffer, callback)
    }
  }))
  .catch(err => {
    console.error(err.message)
    process.exit(1)
  })
