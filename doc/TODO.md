# TODO

## General

### Coding guidelines

  * [ ] use Javascript `standard` package
  * [ ] TDD with Mocha/Should
  * [ ] test coverage
  * [ ] JSLint/Hint

### Documentation

  * [ ] algorithm (pictures++)
  * [ ] usage
  * [ ] API

## Features

### Prototype tests

  * [x] read OBJ mesh with textures
  * [x] render scene
  * [x] visit triangles
  * [x] voxelify triangle
  * [x] voxel preview to PNG/GIF

### Command line

  * [ ] use `commander.js`
  * [ ] use `pretty-error`
  * [ ] use `chalk.js`
  * [ ] use profiler
  * [ ] manage material images differently
  * [ ] ColorGrid aufspalten
    * [ ] model map exporter
    * [ ] paper craft exporter
    * [ ] animation renderer
    * [ ] image renderer
  * [ ] split code into packages with clear interfaces
    * importers
    * converters
    * models
    * exporters
    * three-server
    * camera-tours
    * configuration
    * commands
  * [ ] shrink/split `node-three`
  * [ ] improve splitting algorithm (use polygons and split at leaf level, evaluate first!)
  * [ ] render compact frustum scene
  * [ ] replace Rx.JS with ES6 generators (faster!)
  * [ ] progress via error stream (like git)
  * [ ] autofill of hollow shapes
  * [ ] weighted rasterization
  * [ ] palettes (Hama and other suppliers)
  * [ ] pipes and filters (use cases?)
  * [ ] preview rendering
  * [ ] export
    * [ ] own format
    * [ ] PDF
    * [ ] construction manual
    * [ ] OBJ/STL file
  * [ ] preview
    * [ ] single picture
    * [ ] animation (GIF/video)
  * [x] use reactive extensions
  * [x] sieve concept for splitting faces one-by-one
  * [x] import THREE.js client libraries [via `vm` package](http://stackoverflow.com/questions/5171213/load-vanilla-javascript-libraries-into-node-js)
  * [ ] ~~use [web-gl](https://gist.github.com/bsergean/6780d7cc0cabb1b4d6c8) not canvas~~
    * currently does not work, try it again later
  * [ ] ~~boards (Hama and other suppliers)~~

### File format

  * [x] Metadata
    * [x] name and description
    * [x] version
    * [x] tags
    * [x] URL/Links/Email
    * [x] authors/contributors
    * [x] license
  * [x] a model
    * [x] one layer
      * [x] board
      * [x] indices/dimensions
      * [x] mapping indices to color
    * [x] layer-by-layer
    * [x] pieces
      * [x] groups
      * [x] symbols
      * [x] position + rotation
  * [x] a palette
    * [x] color
    * [x] name/id
  * [ ] ~~a board~~
    * [ ] ~~bead position and rotation for index~~
    * [ ] ~~mapping from PNG data~~
    * [ ] ~~valid indices~~
    * [ ] ~~dimension of indices~~

## beads3d

### Editor library

  * [ ] consider [Voxel builder](http://voxelbuilder.com)
  * [ ] tools
    * [ ] Select
    * [ ] Mark
    * [ ] Move
    * [ ] Rotate

### Repository

  * [ ] upload model per user
  * [ ] model revision history
