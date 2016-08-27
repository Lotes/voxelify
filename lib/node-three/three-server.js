const THREE = require('three')
const Canvas = require('canvas')
const vm = require('vm')
const fs = require('fs')
const callsite = require('callsite')
const path = require('path')
const getInstalledPath = require('get-installed-path')
const threePath = getInstalledPath('three', true)

// global setup
global.THREE = THREE
global.document = {
    createElement: function(tag) {
      if(tag !== 'canvas')
        throw new Error('Unsupported tag!')
      return new Canvas()
    },
    createElementNS: function(namespace, tag) {
      if(tag !== 'img')
        throw new Error('Unsupported tag!')
      return new Canvas.Image()
    }
}

global.URL = {
  createObjectURL: function(blob) { return blob },
  revokeObjectURL: function(url) {}
}

const context = {}
Object.assign(context, global)
context.console = { //disable console for new modules
  log: function() {},
  error: function() {},
  info: function() {},
  warn: function() {}
}

//module loading
function loadModule(src) {
  const script = fs.readFileSync(src)
  vm.runInNewContext(script, context, src)
}

function loadInternalModule(src) {
  const fullPath = path.join(threePath, src)
  loadModule(fullPath)
}

function loadLocalModule(src) {
  const stack = callsite()
  const callerPath = stack[1].getFileName()
  const callerDirectory = path.dirname(callerPath)
  const fullPath = path.join(callerDirectory, src)
  loadModule(fullPath)
}

module.exports = {
  THREE: THREE,
  loadLocalModule: loadLocalModule,
  loadInternalModule: loadInternalModule
}

//overrides
THREE.XHRLoader = function ( manager ) {
  this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
};
Object.assign( THREE.XHRLoader.prototype, {
  load: function ( url, onLoad, onProgress, onError ) {
    if ( this.path !== undefined ) url = this.path + url;
    var scope = this;
    var callback = function(err, data) {
      if(err) return onError && onError(err)
      onLoad(data)
    }
    if(scope.responseType === 'blob')
      fs.readFile(url, callback)
    else
      fs.readFile(url, 'utf8', callback)
  },
  setPath: function ( value ) {
    this.path = value;
    return this;
  },
  setResponseType: function ( value ) {
    this.responseType = value;
    return this;
  },
  setWithCredentials: function ( value ) {
    this.withCredentials = value;
    return this;
  },
  setCrossOrigin: function() {}
} );
