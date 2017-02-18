'use strict'

const Canvas = require('canvas')
const fs = require('fs')

/**
 * Polyfill for browsers XMLHttpRequest
 */
class XMLHttpRequest {
  /**
   * Constructor
   */
  constructor () {
    this.listeners = {}
    this.url = null
    this.status = 200
  }

  /**
   * Opens a async file request
   * @param {String} method only GET supported
   * @param {String} url filename
   * @param {Boolean} async only true supported
   * @returns {void}
   */
  open (method, url, async) {
    if (method !== 'GET') {
      throw new Error('Only GET method is supported!')
    }
    if (async !== true) {
      throw new Error('Only async request is supported!')
    }
    this.url = url
  }

  /**
   * Adds event listeres like load, error, progress
   * @param {String} name of the event
   * @param {Function} callback passing a event object
   * @returns {void}
   */
  addEventListener (name, callback) {
    if (!(name in this.listeners)) {
      this.listeners[name] = []
    }
    this.listeners[name].push(callback)
  }

  /**
   * Triggers an event passing an event object.
   * @param {String} name of the event
   * @param {*} event data
   * @returns {void}
   */
  triggerEventListeners (name, event) {
    if (name in this.listeners) {
      this.listeners[name].forEach(listener => Reflect.apply(listener, this, [event]))
    }
  }

  /**
   * Reads the url file from disk asynchronously.
   * @returns {void}
   */
  send () {
    const callback = (err, data) => {
      if (err) this.triggerEventListeners('error', err)
      else {
        this.triggerEventListeners('load', {
          target: {
            response: data
          }
        })
      }
    }
    fs.readFile(this.url, 'utf8', callback)
  }
}

module.exports = function (THREE) {
  global.THREE = THREE
  global.Canvas = Canvas
  global.Image = Canvas.Image
  global.XMLHttpRequest = XMLHttpRequest
  global.document = {
    createElement: function (tag) {
      if (tag !== 'canvas') {
        throw new Error('Unsupported tag!')
      }
      return new Canvas()
    },
    createElementNS: function (namespace, tag) {
      if (tag !== 'img') {
        throw new Error('Unsupported tag!')
      }
      return new Canvas.Image()
    }
  }
  global.URL = {
    createObjectURL: function (blob) {
      return blob
    },
    revokeObjectURL: function (/* url */) {}
  }
}
