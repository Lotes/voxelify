#!/usr/bin/env node

'use strict'

const program = require('commander')
const utils = require('./utils')
const Formats = require('../formats/index')
const ThreeExtensions = require('../exporters/renderers/ThreeExtensions')
const GIFEncoder = require('gifencoder')
const fs = require('fs')
const Promise = require('bluebird')

const ProgressMonitor = utils.ProgressMonitor
// const regexAnimationFormats = utils.regexAnimationFormats
// const animationFormats = utils.animationFormats
const toInteger = utils.toInteger
const errorAndExit = utils.errorAndExit

// const DefaultFormat = animationFormats[0]
const DefaultWidth = 600
const DefaultHeight = 400
const DefaultDuration = 1 // in seconds
const DefaultFPS = 12
program
  .version('1.0.0')
  .usage('[filename] [options]')
  .description('Renders a voxelify model animating a camera around it.')
  // .option('-F, --output-format <format>', `output format (${animationFormats.join(', ')}), defaults to '${DefaultFormat}'`, regexAnimationFormats, DefaultFormat)
  .option('-o, --output-file <filename>', '`voxelify` output file; omit to print to STDOUT', null)
  .option('-p, --progress', 'prints the progress to the STDERR', false)
  .option('-w, --width <size>', `width of the animation, defaults to ${DefaultWidth}`, toInteger, DefaultWidth)
  .option('-h, --height <size>', `height of the animation, defaults to ${DefaultHeight}`, toInteger, DefaultHeight)
  .option('-d, --duration <seconds>', `duration of the animation, defaults to ${DefaultDuration} seconds`, parseFloat, DefaultDuration)
  .option('-s, --fps <number>', `frames per second, defaults to ${DefaultFPS} seconds`, toInteger, DefaultFPS)
  .parse(process.argv)

// input voxelify model as buffer
const fileName = program.args.length === 0
  ? null
  : program.args[0]
const bufferPromise = utils.getVoxelifyInput(fileName)

// other options
const width = program.width
const height = program.height
const doProgress = program.progress
const duration = program.duration
const fps = program.fps
const outputStream = program.outputFile === null
  ? process.stdin
  : fs.createWriteStream(program.outputFile)

bufferPromise
  .then(buffer => Formats.load(buffer))
  .then(container => {
    const object3D = Formats.toMesh(container)
    return ThreeExtensions.normalizeSize(object3D)
  })
  .then(normalizedMesh => ThreeExtensions.captureByCamera(normalizedMesh, width, height))
  .then(scene => {
    const delay = Math.floor(1000 / fps)
    const step = Math.floor(360 / (duration * fps))

    let angles = []
    for (let angle = 0; angle < 360; angle += step) {
      angles.push(angle)
    }

    let progress = new ProgressMonitor(doProgress)
    progress.step(0, angles.length)

    let encoder = new GIFEncoder(width, height)
    encoder.createReadStream().pipe(outputStream)
    encoder.start()
    encoder.setRepeat(0)   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(delay)  // frame delay in ms
    encoder.setQuality(10) // image quality. 10 is default.
    return Promise.each(angles, function (angle, curr, max) {
      scene.camera.setAngle(angle)
      return scene.renderToStream().then(function (context) {
        encoder.addFrame(context)
        progress.step(curr + 1, max)
      })
    }).then(function () {
      encoder.finish()
    })
  })
  .catch(err => errorAndExit(program, err.message))
