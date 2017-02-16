'use strict'

const vm = require('vm')
const fs = require('fs')
const callsite = require('callsite')
const path = require('path')
const threePath = path.join(require.resolve('three'), '..', '..')

const context = {}
Object.assign(context, global)
context.console = { // disable console for new modules
  log: function () {},
  time: function () {},
  timeEnd: function () {},
  error: function () {},
  info: function () {},
  warn: function () {}
}

/**
 * Loads a Javascript module
 * @param {String} src the path to the Javascript module
 * @returns {void}
 */
function loadModule (src) {
  const script = fs.readFileSync(src)
  vm.runInNewContext(script, context, src)
}

/**
 * Loads a internal THREE.js module from `node_modules` folder
 * @param {String} src the module path relative to the `node_modules/three` folder
 * @returns {void}
 */
function loadInternalModule (src) {
  const fullPath = path.join(threePath, src)
  loadModule(fullPath)
}

/**
 * Loads a local module relative to the calling file.
 * @param {String} src the module path relative to the calling file
 * @returns {void}
 */
function loadLocalModule (src) {
  const stack = callsite()
  const callerPath = stack[1].getFileName()
  const callerDirectory = path.dirname(callerPath)
  const fullPath = path.join(callerDirectory, src)
  loadModule(fullPath)
}

module.exports = {
  loadLocal: loadLocalModule,
  loadInternal: loadInternalModule
}
