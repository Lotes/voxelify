#!/usr/bin/env node

'use strict'

const program = require('commander')
const utils = require('./utils')
const Formats = require('../formats/index')

const regexAnimationFormats = utils.regexAnimationFormats
const animationFormats = utils.animationFormats
const toInteger = utils.toInteger
const readStreamToBuffer = utils.readStreamToBuffer
const readFileToBuffer = utils.readFileToBuffer
const errorAndExit = utils.errorAndExit
const isFile = utils.isFile

const DefaultFormat = animationFormats[0]
const DefaultWidth = 600
const DefaultHeight = 400
const DefaultDuration = 1 // in seconds
const DefaultFPS = 25
program
  .version('1.0.0')
  .usage('[filename] [options]')
  .description('Renders a voxelify model animating a camera around it.')
  .option('-F, --output-format <format>', `output format (${animationFormats.join(', ')}), defaults to '${DefaultFormat}'`, regexAnimationFormats, DefaultFormat)
  .option('-o, --output-file <filename>', '`voxelify` output file; omit to print to STDOUT', null)
  .option('-p, --progress', 'prints the progress to the STDERR', false)
  .option('-w, --width <size>', `width of the animation, defaults to ${DefaultWidth}`, toInteger, DefaultWidth)
  .option('-h, --height <size>', `height of the animation, defaults to ${DefaultHeight}`, toInteger, DefaultHeight)
  .option('-d, --duration <seconds>', `duration of the animation, defaults to ${DefaultDuration} seconds`, parseFloat, DefaultDuration)
  .option('-s, --fps <number>', `frames per second, defaults to ${DefaultFPS} seconds`, toInteger, DefaultFPS)
  .parse(process.argv)

let bufferPromise = null
if (program.args.length === 0) {
  bufferPromise = readStreamToBuffer(process.stdin)
} else {
  const fileName = program.args[0]
  if (!isFile(fileName)) {
    errorAndExit(program, 'Invalid input filename!')
  }
  bufferPromise = readFileToBuffer(fileName)
}

bufferPromise
  .then(buffer => Formats.load(buffer))
  /* .then(container => {
    // TODO
  })*/
  .catch(err => errorAndExit(program, err.message))
