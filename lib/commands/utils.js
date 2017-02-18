'use strict'

const fs = require('fs')
const ThreeExtensions = require('../converters/ThreeExtensions')
const chalk = require('chalk')
const Promise = require('bluebird')

const inputModelLoaders = {
  obj: ThreeExtensions.loadOBJ
}
const outputAnimationSavers = {
  gif: null
}
const autoFormat = 'auto'
const modelFormats = Object.keys(inputModelLoaders)
const regexModelFormats = new RegExp(`^(${autoFormat}|${modelFormats.join('|')})$`, 'i')
const regexExtension = /\.([a-z\d_]+)$/i
const animationFormats = Object.keys(outputAnimationSavers)
const regexAnimationFormats = new RegExp(`^(${animationFormats.join('|')})$`, 'i')

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
 * @param {Program} program the CLI parser
 * @param {String} message the error message
 * @returns {void}
 */
function errorAndExit (program, message) {
  console.error(chalk.red(`${message}\n`))
  program.outputHelp()
  process.exit(1)
}

/**
 * Determines a mesh loader from a format extension and the filename
 * @param {String} formatArg the input format
 * @param {String} fileName the model filename
 * @returns {Function} a loader function that takes a filename and returns a mesh
 * @throws {Error} if format is unknown
 */
function getLoaderFromFormat (formatArg, fileName) {
  let format = formatArg.toLowerCase()
  if (format === autoFormat) {
    let match = regexExtension.exec(fileName)
    if (match === null) {
      throw new Error('Unknown format!')
    }
    format = match[1].toLowerCase()
  }
  if (!(format in inputModelLoaders)) {
    throw new Error(`Unknown format '${format}'!`)
  }
  return inputModelLoaders[format]
}

/**
 * Reads a readable stream to a buffer.
 * @param {Stream} stream a readable stream
 * @returns {Promise<Buffer>} a buffer containing the stream content
 */
function readStreamToBuffer (stream) {
  return new Promise((resolve, reject) => {
    let chunks = []
    stream.on('data', data => chunks.push(data))
    stream.on('error', err => reject(err))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

/**
 * Reads a files content to a buffer.
 * @param {String} fileName of the file for which you want its contents
 * @returns {Promise<Buffer>} the buffer with the file content
 */
function readFileToBuffer (fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

module.exports = {
  errorAndExit: errorAndExit,
  isFile: isFile,
  toInteger: toInteger,
  getLoaderFromFormat: getLoaderFromFormat,
  regexModelFormats: regexModelFormats,
  regexAnimationFormats: regexAnimationFormats,
  animationFormats: animationFormats,
  autoFormat: autoFormat,
  readStreamToBuffer: readStreamToBuffer,
  readFileToBuffer: readFileToBuffer
}
