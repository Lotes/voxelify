# Algorithm

* load a mesh object with textures
* arrange, rotate and scale the object, such that one unit of length corresponds
  to one voxel
  * one unit cube is one voxel
* split the object into faces, where each of the three points has spatial
  and texture coordinates
  * the spatial coordinates are already transformed by position, rotation and
    scale of the object
* split each face into sub faces along the unit grid and assign it to the corresponding unit cube
* initialize a color grid of the desired size with 1 voxel margin and fill it with a color, that can used be used for filling the invisible parts (e.g. `rgba(0,0,0,0.5)`)
* for each unit cube: take all faces and compute their weighted color by rasterizing the face on its texture
* for each resulting unit cube color:
  * get its nearest neighbor in the palette (if given)
  * put the color into the color grid
* flood fill the color grid with `rgba(0,0,0,0)` at coordinate (0, 0, 0) to make the outside visible again
* slice the color grid layer-for-layer
* crop each layer only the visible kernel
* pack all kernel into a PNG file (the map)
* save `model.json` and `model.map.png`
