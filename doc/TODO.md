# TODO

## General
* Coding guidelines
  * [ ] use Javascript `standard` package
  * [ ] TDD with Mocha/Should
  * [ ] test coverage
  * [ ] JSLint/Hint
* [ ] Documentation
  * [ ] algorithm (pictures++)
  * [ ] usage
  * [ ] API

## Features
* [ ] Prototype
  * [x] read OBJ mesh with textures
  * [x] render scene
  * [x] visit triangles
  * [x] voxelify triangle
  * [x] voxel preview to PNG/GIF
* [ ] Command line
  * [ ] progress via error stream (like git)
  * [ ] autofill of hollow shapes
  * [ ] weighted rasterization
  * [ ] sieve concept for splitting faces one-by-one
  * [ ] palettes (Hama and other suppliers)
  * [ ] breadboards (Hama and other suppliers)
  * [ ] pipes and filters (use cases?)
  * [ ] preview rendering
  * [ ] import THREE.js client libraries [via `vm` package](http://stackoverflow.com/questions/5171213/load-vanilla-javascript-libraries-into-node-js)
  * [ ] export
    * [ ] own format
    * [ ] PDF
    * [ ] construction manual
    * OBJ file
  * [ ] preview
    * [ ] single picture
    * [ ] animation (GIF/video)
* [ ] File format
  * [ ] Metadata
    * [ ] name and description
    * [ ] version
    * [ ] tags
    * [ ] URL/Links/Email
    * [ ] authors/contributors
    * [ ] license
  * [ ] a model
    * [ ] one layer
      * [ ] breadboard
      * [ ] indices/dimensions
      * [ ] mapping indices to color
    * [ ] layer-by-layer
    * [ ] pieces
      * [ ] groups
      * [ ] symbols
      * [ ] position + rotation
  * [ ] a palette
    * [ ] color
    * [ ] name/id
  * [ ] a breadboard
    * [ ] bead position and rotation for index
    * [ ] mapping from PNG data
    * [ ] valid indices
    * [ ] dimension of indices

## beads3d
* [ ] Editor library
  * [ ] tools
    * [ ] Select
    * [ ] Mark
    * [ ] Move
    * [ ] Rotate
