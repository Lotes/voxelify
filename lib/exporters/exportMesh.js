'use strict'

const nodeThree = require('../shared/node-three/index')
const THREE = nodeThree.THREE
const MeshBasicMaterial = THREE.MeshBasicMaterial
const BoxGeometry = THREE.BoxGeometry
const Mesh = THREE.Mesh
const Object3D = THREE.Object3D

/**
 * Convert the grid to a 3D mesh
 * @param {WeightedColorGrid} colorGrid the color grid you want to export
 * @returns {THREE.Object3D} the resulting mesh
 */
function toMesh (colorGrid) {
  const object = new Object3D()
  const colorToMaterialMap = new Map()
  colorGrid.forEach(function (x, y, z, color) {
    if (color.weight === 0) {
      return
    }
    const hex = color.value
    if (!colorToMaterialMap.has(hex)) {
      colorToMaterialMap.set(hex, new MeshBasicMaterial({
        color: hex,
        shading: THREE.FlatShading
      }))
    }
    const material = colorToMaterialMap.get(hex)
    let geometry = new BoxGeometry(1, 1, 1)
    let voxel = new Mesh(geometry, material)
    voxel.position.set(x, y, z)
    object.add(voxel)
  })
  return object
}

module.exports = toMesh
