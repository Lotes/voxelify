# Algorithm

## Outline
* load a mesh object with textures
* arrange, rotate and scale the object, such that one unit of length corresponds
  to one voxel
  * one unit cube is one voxel
* split the object into triangles, where each of the three points has spatial
  and texture coordinates
  * the spatial coordinates are already transformed by position, rotation and
    scale of the object
* for each triangle ABC
  * visit all voxels which intersect with ABC
    * determine subtriangles of intersection
    * fetch textures color from subtriangles
  * collect the found color information in a voxel grid
* output the voxel grid layer-for-layer into a PNG file
