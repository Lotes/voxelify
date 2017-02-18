# voxelify

[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![License](http://img.shields.io/:license-mit-green.svg)](LICENSE.md)

| master            | developer           |
| ----------------- | ------------------- |
| [![Build Status](https://travis-ci.org/Lotes/voxelify.svg?branch=master)](https://travis-ci.org/Lotes/voxelify) | [![Build Status](https://travis-ci.org/Lotes/voxelify.svg?branch=developer)](https://travis-ci.org/Lotes/voxelify) |
| [![Coverage Status](https://coveralls.io/repos/github/Lotes/voxelify/badge.svg?branch=master)](https://coveralls.io/github/Lotes/voxelify?branch=master) | - |
| [![Codeship Status](https://codeship.com/projects/8ed7cc00-3280-0134-875e-56e93ee34f2b/status?branch=master)](https://codeship.com/projects/164726) | - |
| [![bitHound Dependencies](https://www.bithound.io/github/Lotes/voxelify/badges/dependencies.svg)](https://www.bithound.io/github/Lotes/voxelify/master/dependencies/npm) | [![bitHound Dependencies](https://www.bithound.io/github/Lotes/voxelify/badges/dependencies.svg)](https://www.bithound.io/github/Lotes/voxelify/developer/dependencies/npm) |
| [![bitHound Dev Dependencies](https://www.bithound.io/github/Lotes/voxelify/badges/devDependencies.svg)](https://www.bithound.io/github/Lotes/voxelify/master/dependencies/npm) | [![bitHound Dev Dependencies](https://www.bithound.io/github/Lotes/voxelify/badges/devDependencies.svg)](https://www.bithound.io/github/Lotes/voxelify/developer/dependencies/npm) |

This project can be used to transform a 3D model (OBJ file) into voxel information (3D pixels).

It will be reused in my web project "beads3d".

## Install
```
> npm install -g voxelify
# installs voxelify globally
```

## Usage
```
> voxslice3d model3D.obj 20 -M
# slices the 3D model with a voxel width of maximum 20
```

## Example

| Original          | Voxels (size = 50)  |
| ----------------- | ------------------- |
| ![](doc/mesh.gif) | ![](doc/voxels.gif) |
