# Algorithm

## Outline
* load a mesh object with textures
* arrange, rotate and scale the object, such that one unit of length corresponds
  to one voxel
  * one unit cube is one voxel
* split the object into faces, where each of the three points has spatial
  and texture coordinates
  * the spatial coordinates are already transformed by position, rotation and
    scale of the object
* for each face ABC
  * split ABC into sub faces along the unit grid and assign it to the corresponding unit cube
* for each unit cube
  * take all face and compute their weighted color by rasterizing the face on its texture  
* output the voxel grid layer-for-layer into a PNG file
