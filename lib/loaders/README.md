Loader conventions
==================

Every loader module only exports a `Function` that takes a filename an returns a `Promise` containing a `THREE.Object3D` with `THREE.Meshs` inside.

Template
--------
```javascript
'use strict'

const Promise = require('bluebird')

/**
 * Loads a XXX file to a THREE.Object3D
 * @param {String} url the filename
 * @returns {Promise.<THREE.Object3D>} containing a THREE.Mesh
 */
function loadFile (fileName) {
  return new Promise((resolve, reject) => {
    //... resolve(object3D)
  })
}

module.exports = loadFile

```