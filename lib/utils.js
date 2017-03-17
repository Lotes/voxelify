'use strict'

const fs = require('fs')
const chalk = require('chalk')
const Promise = require('bluebird')
const path = require('path')
const Canvas = require('canvas')
const Image = Canvas.Image

const inputModelLoaders = {
  obj: require('./loaders/ObjMatLoader')
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
const readDir = Promise.promisify(fs.readdir)
const stat = Promise.promisify(fs.stat)
const isWindows = (/^win/).test(process.platform)

/**
 * Converts a string to a boolean.
 * @param {String} str the input: asc or desc
 * @returns {Boolean} true means ascending, false descending
 */
function toAscending (str) {
  return str.toLowerCase() === 'asc'
}

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

/**
 * To show the progress for the user
 */
class ProgressMonitor {
  /**
   * Constructor, use step function to notify progress on the STDERR
   * @param {Boolean} enabled set to false for silent mode
   */
  constructor (enabled) {
    let printProgress = () => {}

    if (enabled === true) {
      printProgress = (curr, mx) => console.error(`${Math.floor(100 * curr / mx)} % (${curr}/${mx})`)
    }

    this.step = printProgress
  }
}

/**
 * Reads the content of a given file or the STDIN.
 * @param {String} fileName can be null, if you want to read from STDIN
 * @returns {Promise<Buffer>} a buffer with the file content
 */
function getVoxelifyInput (fileName) {
  // input voxelify model as buffer
  let bufferPromise = null
  if (fileName) {
    if (isFile(fileName)) {
      bufferPromise = readFileToBuffer(fileName)
    } else {
      bufferPromise = Promise.reject(new Error('Invalid input filename!'))
    }
  } else {
    bufferPromise = readStreamToBuffer(process.stdin)
  }
  return bufferPromise
}

/**
 * Escape a string for the usage in a RegExp.
 * @param {String} str the string to escape
 * @returns {String} the escaped copy of the input
 */
function escapeRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

/**
 * Get all filenames with a index pattern included.
 * @param {String} filePattern containing the index pattern
 * @param {String} indexPattern indicating the running number
 * @returns {Array<String>} all matching files in the order of the running numbers.
 */
function getFilesWithIndexPattern (filePattern, indexPattern) {
  /**
   * Determines all paths matching the regexs: regex1/regex2/regex3
   * @param {String} rootDir the directory to start from
   * @param {Array<RegExp>} regexParts all parts of the path as regex
   * @returns {Promise.<Array<String>>} all matching files in an ascending order
   */
  function getFiles (rootDir, regexParts) {
    const regex = regexParts[0]
    const remaining = regexParts.slice(1)
    const isLastPart = remaining.length === 0
    const step = isLastPart
      ? filePath => Promise.resolve([filePath])
      : filePath => getFiles(filePath, remaining)
    return readDir(`${rootDir}/`)
      .then(files => {
        const fileNames = files.filter(file => regex.test(file))
        return Promise.filter(fileNames, fileName => {
          const fullFileName = path.join(rootDir, fileName)
          return stat(fullFileName)
            .then(stat => stat.isFile() === isLastPart)
        })
      })
      .then(files => {
        const promises = files.map(file => {
            const groups = regex.exec(file)
            let index = groups.length > 1
              ? parseInt(groups[1], 10)
              : 0
            return {
              index: index,
              path: path.join(rootDir, file)
            }
          })
          .sort((lhs, rhs) => lhs.index - rhs.index)
          .map(obj => obj.path)
          .map(step)
        return Promise.all(promises)
      })
      .then(fileGroups => Reflect.apply(Array.prototype.concat, [], fileGroups))
  }
  const regexOptions = isWindows
    ? 'i'
    : null
  let filePathParts = filePattern.split(path.sep)
  let rootDir
  if (path.isAbsolute(filePattern)) {
    rootDir = filePathParts[0]
    filePathParts = filePathParts.slice(1)
  } else {
    rootDir = '.'
  }
  const filePathPartRegexs = filePathParts.map(part => {
    const indexIndex = part.indexOf(indexPattern)
    if (indexIndex > -1) {
      // prefix${index}postfix -> /^prefix(\d+)postfix$/
      const prefix = escapeRegExp(part.substr(0, indexIndex))
      const postfix = escapeRegExp(part.substr(indexIndex + indexPattern.length))
      return new RegExp(`^${prefix}(\\d+)${postfix}$`, regexOptions)
    }
    const escaped = escapeRegExp(part)
    return new RegExp(escaped, regexOptions)
  })
  return getFiles(rootDir, filePathPartRegexs)
}

/**
 * Loads an image asynchronously.
 * @param {String} fileName the location relative to the working directory
 * @returns {Promise<Image>} the actual image data
 */
function loadImage (fileName) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = err => reject(err)
    image.src = fileName
  })
}

/**
 * Converts an image to image pixel data.
 * @param {Image} image a loaded image
 * @returns {ImageData} the pixel information together with width and height
 */
function convertImageToPixelData (image) {
  const width = image.width
  const height = image.height
  const canvas = new Canvas(width, height)
  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)
  return context.getImageData(0, 0, width, height)
}

/**
 * Converts a pixel from imageData.data at a given index to a 32-bit color value.
 * @param {Uint8ClampedArray} data the source array
 * @param {Integer} index the index (dividable by 4)
 * @returns {Integer} the color
 */
function pixelToColor (data, index) {
  return ((data[index] << 16) >>> 0) +
    ((data[index + 1] << 8) >>> 0) +
    ((data[index + 2] << 0) >>> 0) +
    ((data[index + 3] << 24) >>> 0)
}

/**
 * Outputs a buffer to a file or to STDOUT.
 * @param {Buffer} buffer the data to output
 * @param {String} fileName output filename or null for STDOUT
 * @returns {Promise<void>} resolve on success, rejects on error
 */
function outputBuffer (buffer, fileName) {
  const doOutputToStdOut = fileName === null
  return new Promise((resolve, reject) => {
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
      fs.writeFile(fileName, buffer, callback)
    }
  })
}

module.exports = {
  outputBuffer: outputBuffer,
  pixelToColor: pixelToColor,
  loadImage: loadImage,
  convertImageToPixelData: convertImageToPixelData,
  isWindows: isWindows,
  getFilesWithIndexPattern: getFilesWithIndexPattern,
  modelFormats: modelFormats,
  ProgressMonitor: ProgressMonitor,
  errorAndExit: errorAndExit,
  isFile: isFile,
  toInteger: toInteger,
  getLoaderFromFormat: getLoaderFromFormat,
  regexModelFormats: regexModelFormats,
  regexAnimationFormats: regexAnimationFormats,
  animationFormats: animationFormats,
  autoFormat: autoFormat,
  readStreamToBuffer: readStreamToBuffer,
  readFileToBuffer: readFileToBuffer,
  toAscending: toAscending,
  getVoxelifyInput: getVoxelifyInput,
  escapeRegExp: escapeRegExp
}
