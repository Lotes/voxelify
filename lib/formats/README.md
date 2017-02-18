Formats
=======

All formats are splitted into PNG sprites and JSON meta data.

Sprites are enumerated by an numeric sprite id. Meta data can be identified via an unique id string.

Folder structure
----------------

```
formats
|- <format_X>
|  |_ <version_1>
|  |  |_ model.schema.json
|  |  |_ version_2.migrator.js
|  |  |_ <version_key_A>.schema.json
|  |  |_ <version_key_B>.validator.js
|  |  ...
|  |_ <version_N>
|  |  |_ model.schema.json
|  |  |_ ...
|  |_ <format_key_A>.schema.json
|  |_ <format_key_B>.validator.js
|_ <global_key_A>.schema.json
|_ <global_key_B>.validator.js
```

Formats must be lowercase words.

Versions must be valid semantic versions (see package `semver`).

Schemas are JSON files with a valid JSON schema.

Validators are functions that get a `Container` and throw errors when something is wrong.

All keys must be lowercase words.
* Global schemas and validators will be applied to all formats.
* Format schemas and validators will only be applied to all versions of a format.
* Version schemas and validators will only be applied to a specific format version.

All schemas and validators will be loaded automatically. you do not have to enter these files somewhere.

Must-haves
----------

Every version folder must contain 
* a `model.schema.json`. It is the actual format descriptor
* a `toMesh.js` script which exports a function that gets a `Container` and returns a `THREE.Object3D` with some `THREE.Mesh` inside

Template:
```javascript
'use strict'

/**
 * Reads the model meta object and returns a mesh (THREE.Object3D)
 * @param {Container} container the container with the format of model.schema.json
 * @returns {THREE.Object3D} a 3D object
 */
function toMesh (container) {
  return container.todo()
}

module.exports = toMesh

```
