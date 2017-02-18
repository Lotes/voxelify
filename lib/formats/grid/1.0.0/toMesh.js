'use strict'

const Keys = require('../../Keys')
const THREE = require('../../../shared/node-three/index').THREE

/**
 * Reads the model meta object and returns a mesh (THREE.Object3D)
 * @param {Container} container the container with the format of model.schema.json
 * @returns {THREE.Object3D} a 3D object
 */
function toMesh (container) {
  const object = new THREE.Object3D()
  const colorToMaterialMap = new Map()
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const model = container.getMetaObject(Keys.ModelKey)

  /**
   * Cache for materials by color
   * @param {Number} hex the color
   * @returns {THREE.MeshBasicMaterial} a material
   */
  function getMaterial (hex) {
    if (!colorToMaterialMap.has(hex)) {
      colorToMaterialMap.set(hex, new THREE.MeshBasicMaterial({
        color: hex,
        shading: THREE.FlatShading
      }))
    }
    return colorToMaterialMap.get(hex)
  }

  model.layers.forEach((layer, y) => {
    const id = layer.spriteId
    const sprite = container.getSprite(id)
    const offsetX = layer.targetX
    const offsetZ = layer.targetY
    sprite.forEachPixel((color, x, z) => {
      const material = getMaterial(color)
      const voxel = new THREE.Mesh(geometry, material)
      voxel.position.set(offsetX + x, y, offsetZ + z)
      object.add(voxel)
    })
  })
  return object
}

module.exports = toMesh
