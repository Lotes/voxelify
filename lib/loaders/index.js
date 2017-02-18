'use strict'

const Promise = require('bluebird')
const path = require('path')

const InputFormats = {
  obj: require('./ObjMatLoader')
}

/**
 * Loads a 3D model assuming a format
 * @param {String} format the supposed format
 * @param {String} fileName the models filename
 * @returns {Promise.<THREE.Object3D>} the 3D object
 */
function load (format, fileName) {
  return new Promise((resolve, reject) => {
    if (format in InputFormats) {
      resolve(InputFormats[format])
    } else {
      reject(new Error('Unknown format!'))
    }
  }).then(loader => loader(path.resolve(fileName)))
}

module.exports = load
