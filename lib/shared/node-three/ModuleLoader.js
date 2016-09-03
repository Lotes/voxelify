const vm = require('vm')
const fs = require('fs')
const callsite = require('callsite')
const path = require('path')
const getInstalledPath = require('get-installed-path')
const threePath = getInstalledPath('three', true)

const context = {}
Object.assign(context, global)
context.console = { // disable console for new modules
  log: function () {},
  error: function () {},
  info: function () {},
  warn: function () {}
}

function loadModule (src) {
  const script = fs.readFileSync(src)
  vm.runInNewContext(script, context, src)
}

function loadInternalModule (src) {
  const fullPath = path.join(threePath, src)
  loadModule(fullPath)
}

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
