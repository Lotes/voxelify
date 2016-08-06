# voxelify
[ ![Codeship Status for Lotes/voxelify](https://codeship.com/projects/8ed7cc00-3280-0134-875e-56e93ee34f2b/status?branch=master)](https://codeship.com/projects/164726)

This project can be used to transform a 3D model (OBJ file) into voxel information (3D pixels).

It will be reused in my web interface project "beads3d".

## Idea
```
> npm install -g voxelify
... installs voxelify globally

> voxelify model.obj --size 20 --output result.png
... creates a 20 x 400 PNG image (20 layers with 20 x 20 pixels)
```

## TODO
* [x] read OBJ mesh with textures
* [x] render scene
* [x] visit triangles
* [ ] voxelify triangle
...
* [ ] voxel preview to PNG/GIF
* [ ] documentation (code + usage)

## Nice-to-have
* [ ] import THREE.js client libraries [via `vm` package](http://stackoverflow.com/questions/5171213/load-vanilla-javascript-libraries-into-node-js)
* [x] render camera animation as GIF file
* [ ] use Javascript `standard` package

## Basic algorithm
* load a mesh object with textures
* arrange, rotate and scale the object, such that one unit of length corresponds to one voxel
  * one unit cube is one voxel
* split the object into triangles, where each of the three points has spatial and texture coordinates
  * the spatial coordinates are already transformed by position, rotation and scale of the object
* for each triangle ABC
  * **visit all voxels which intersect with ABC**
  * collect the found color information in a voxel grid
* output the voxel grid layer-for-layer into a PNG file

## License

[MIT](LICENSE.md)
