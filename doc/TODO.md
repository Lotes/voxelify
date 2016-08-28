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
* [x] Prototype
  * [x] read OBJ mesh with textures
  * [x] render scene
  * [x] visit triangles
  * [x] voxelify triangle
  * [x] voxel preview to PNG/GIF
* [ ] Command line
  * [ ] ~~use [web-gl](https://gist.github.com/bsergean/6780d7cc0cabb1b4d6c8) not canvas~~
    * currently does not work, try it again later
  * [ ] progress via error stream (like git)
  * [ ] autofill of hollow shapes
  * [ ] weighted rasterization
  * [ ] sieve concept for splitting faces one-by-one
  * [ ] palettes (Hama and other suppliers)
  * [ ] ~~boards (Hama and other suppliers)~~
  * [ ] pipes and filters (use cases?)
  * [ ] preview rendering
  * [x] import THREE.js client libraries [via `vm` package](http://stackoverflow.com/questions/5171213/load-vanilla-javascript-libraries-into-node-js)
  * [ ] export
    * [ ] own format
    * [ ] PDF
    * [ ] construction manual
    * [ ] OBJ/STL file
  * [ ] preview
    * [ ] single picture
    * [ ] animation (GIF/video)
* [x] File format
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
* [ ] Editor library
  * [ ] tools
    * [ ] Select
    * [ ] Mark
    * [ ] Move
    * [ ] Rotate
