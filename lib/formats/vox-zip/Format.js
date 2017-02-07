"use strict";
const Sprite = require('./Sprite');
class Format {
  constructor () {
    this.spriteIdCounter = 0;
    this.sprites = new Map();
    this.metaObjects = new Map();
  }

  addSprite (optionalId) {
    let id
    if(typeof(optionalId)==='number') {
      id = optionalId
      this.spriteIdCounter = Math.max(id+1, this.spriteIdCounter)
    } else {
      id = this.spriteIdCounter++
    }
    let sprite = new Sprite(id)
    this.sprites.set(id, sprite)
    return sprite
  }

  getSprite (id) {
    return this.sprites.get(id)
  }

  removeSprite(id) {
    this.sprites.delete(id)
  }

  forEachSprite(callback) {
    this.sprites.forEach(callback)
  }

  getMetaObject (key) {
    return this.metaObjects.has(key) ? this.metaObjects.get(key) : null;
  }

  setMetaObject (key, value) {
    this.metaObjects.set(key, value);
  }

  removeMetaObject(key) {
    this.metaObjects.delete(key)
  }

  forEachMetaObject(callback) {
    this.metaObjects.forEach(callback)
  }
}

Format.EXTENSION = '.vxz'

module.exports = Format;