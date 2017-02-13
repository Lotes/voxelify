'use strict'

const THREE = require('three')
const Promise = require('bluebird')
require('./addGlobals')(THREE)
require('./addOverrides')(THREE)
const ModuleLoader = require('./ModuleLoader')
Object.assign(module.exports, ModuleLoader)
module.exports.THREE = THREE
ModuleLoader.loadLocal('LoadingManager.js')

module.exports.awaitLoadingManager = function (result) {
  return new Promise(function (resolve, reject) {
    let timeout
    let interval = setInterval(function () {
      if (THREE.DefaultLoadingManager.isLoading) {
        return
      }
      clearInterval(interval)
      clearTimeout(timeout)
      resolve(result)
    }, 10)
    timeout = setTimeout(function () {
      clearInterval(interval)
      reject(new Error('Waited too long for loading content!'))
    }, 10000)
  })
}
