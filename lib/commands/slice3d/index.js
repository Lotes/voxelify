'use strict'

const program = require('commander')
const fs = require('fs')
const THREE = require('../../shared/node-three/index')

const inputModelLoaders = {
  obj: 'blubb'
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

program
  .version('1.0.0')
  .description('Slices a given 3D model into a colored voxel model of a given size.')
  .option('-i, --input-file <filename>', 'Required: a 3D model input file path', null)
  .option('-f, --format <format>', 'input format, defaults to `auto`', regexFormats, 'auto')
  .option('-o, --output-file <filename>', '`voxelify` output file; omit to print to STDOUT', null)
  .option('-m, --min-size <size>', 'minimal size for the output in voxels (required or maximum)', toInteger, null)
  .option('-M, --max-size <size>', 'maximal size for the output in voxels (required or minimum)', toInteger, null)
  .option('-t, --thickness <size>', 'thickness of the output model (defaults to infinity)', toInteger, null)
  .option('-r, --rotation-order <xyz|xzy|yzx|yxz|zxy|zyx>', 'order of Euler rotation (default: xyz)', /^(xyz|xzy|yzx|yxz|zxy|zyx)$/i, 'xyz')
  .option('-x, --x-axis-rotation', 'x axis rotation in degree (default: 0)', parseFloat, 0)
  .option('-y, --y-axis-rotation', 'y axis rotation in degree (default: 0)', parseFloat, 0)
  .option('-z, --z-axis-rotation', 'z axis rotation in degree (default: 0)', parseFloat, 0)
  .option('-p, --progress', 'prints the progress to the STDERR', false)
  .parse(process.argv)

// REQUIRED input option
let inputFileName = program.inputFile
if (inputFileName === null || !isFile(inputFileName)) {
  console.error('Invalid input filename!')
  process.exit(1)
}

// REQUIRED size option
let doMaxSize = false
let size = 0
let sizeStruct = {
  min: program.minSize,
  max: program.maxSize
}
if (sizeStruct.min === null && sizeStruct.max === null) {
  console.error('Minimal or maximal size must be given!')
  process.exit(1)
} else if (sizeStruct.min !== null && sizeStruct.max !== null) {
  console.error('Only one size (not both, min and max) must be given!')
  process.exit(1)
}
doMaxSize = sizeStruct.max !== null
size = doMaxSize
  ? sizeStruct.max
  : sizeStruct.min

// OPTIONAL format option
let inputFormat = program.format.toLowerCase()
if (inputFormat === autoFormat) {
  let match = regexExtension.exec(inputFileName)
  if (match === null) {
    console.error('Unknown format!')
    process.exit(1)
  }
  inputFormat = match[1].toLowerCase()
}
if (!(inputFormat in inputModelLoaders)) {
  console.error('Unknown format!')
  process.exit(1)
}
let loader = inputModelLoaders[inputFormat]

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
