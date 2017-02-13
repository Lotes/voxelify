/* global THREE */

'use strict'

THREE.LoadingManager = function (onLoad, onProgress, onError) {
  let isLoading = false
  let itemsLoaded = 0
  let itemsTotal = 0
  this.onStart = undefined;
  this.onLoad = onLoad;
  this.onProgress = onProgress;
  this.onError = onError;
  this.itemStart = url => {
    itemsTotal++
    if (isLoading === false) {
      if (this.onStart !== undefined) {
        this.onStart(url, itemsLoaded, itemsTotal)
      }
    }
    isLoading = true
  };
  this.itemEnd = url => {
    itemsLoaded++
    if (this.onProgress !== undefined) {
      this.onProgress(url, itemsLoaded, itemsTotal)
    }
    if (itemsLoaded === itemsTotal) {
      isLoading = false
      if (this.onLoad !== undefined) {
        this.onLoad()
      }
    }
  };

  Reflect.defineProperty(this, 'isLoading', {
    get: function () {
      return isLoading;
    }
  })
}

THREE.LoadingManager.prototype.itemError = function (url) {
  if (this.onError !== undefined) {
    this.onError(url)
  }
}

THREE.DefaultLoadingManager = new THREE.LoadingManager()
