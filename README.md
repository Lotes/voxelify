# voxelify

[ ![Codeship Status for Lotes/voxelify](https://codeship.com/projects/8ed7cc00-3280-0134-875e-56e93ee34f2b/status?branch=master)](https://codeship.com/projects/164726)

This project can be used to transform a 3D model (OBJ file) into voxel information (3D pixels).

It will be reused in my web interface project "beads3d".

## Idea

	npm install -g voxelify
	voxelify model.obj --size 20 --output result.png
	//creates a 20 x 400 PNG image (20 layers with 20 x 20 pixels)

## TODO

* [x] read OBJ mesh with textures
* [x] render scene
* [x] visit triangles
* [ ] voxelify triangle
...
