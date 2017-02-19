'use strict'

const nodeThree = require('../shared/node-three/index')
const THREE = nodeThree.THREE
const Vector3 = THREE.Vector3
const Plane = THREE.Plane
const Box3 = THREE.Box3

/**
 * This Node is used for binary space splitting. The plane is the splitter geometry.
 * Back and front are node lists of further nodes. At leaf level the class `Leaf` will be used.
 */
class Node {
  /**
   * Creates a Node
   * @param {THREE.Plane} plane this plane splits the 3D space at this node to front and back side
   */
  constructor (plane) {
    this.plane = plane
    this.back = null
    this.front = null
  }

  /**
   * Adds a splittable item to the node
   * @param {Object} item an object that can be splitted by `split` into more objects of same type
   * @param {Function} callback passes as only parameter a single splitted object, splitted by the sieve
   * @param {Function} split is the split function of type Function(Item, Plane, Callback: Function<{ item: Item, isFront: boolean }, Void>)
   * @returns {void}
   */
  add (item, callback, split) {
    split(item, this.plane, (item, isFront) => {
      if (isFront) {
        this.front.add(item, callback, split)
      } else {
        this.back.add(item, callback, split)
      }
    })
  }
}

/**
 * The leaf node is ideally an unit cube.
 */
class Leaf {
  /**
   * Creates a leaf
   * @param {THREE.Box3} box the box which emcompasses the 3D space belonging to this leaf
   */
  constructor (box) {
    this.box = box
  }

  /**
   * Returns every item that was added. Used for recursion with `Node` class
   * @param {Object} item a splittable item
   * @param {Function} callback passes as only parameter a single splitted object, splitted by the sieve
   * @returns {void}
   */
  add (item, callback) {
    callback({
      item: item,
      box: this.box
    })
  }
}

/**
 * The unit sieve is a tool to split polygons with the help of unit boxes.
 */
class UnitSieve {
  /**
   * Creates a unit sieve of given metrics
   * @param {THREE.Box3} boxArg used to build a unit sieve of same size and position
   */
  constructor (boxArg) {
    let box = boxArg.clone()
    box.min.floor()
    box.max.ceil()
    this.build(box)
  }

  /**
   * Initializes the unit sieve
   * @param {THREE.Box3} box contains the needed size and position
   * @returns {void}
   */
  build (box) {
    const xNormal = new Vector3(1, 0, 0)
    const yNormal = new Vector3(0, 1, 0)
    const zNormal = new Vector3(0, 0, 1)
    const xPlanes = new Map()
    const yPlanes = new Map()
    const zPlanes = new Map()
    const lookupAxis = function (map, vector, constant) {
      if (!map.has(constant)) {
        map.set(constant, new Plane(vector, -constant))
      }
      return map.get(constant)
    }
    const lookup = function (x, y, z) {
      if (typeof x === 'number') return lookupAxis(xPlanes, xNormal, x)
      if (typeof y === 'number') return lookupAxis(yPlanes, yNormal, y)
      if (typeof z === 'number') return lookupAxis(zPlanes, zNormal, z)
      throw new Error('Unexpected plane lookup!')
    }
    this.root = this.buildNode(box, lookup)
  }

  /**
   * Split a polygon using the sieve
   * @param {Object} item can be anything
   * @param {Function} callback passes as only parameter a single splitted object, splitted by the sieve
   * @param {Function} split is the split function of type Function(Item, Plane, Callback: Function<{ item: Item, isFront: boolean }, Void>)
   * @returns {void}
   */
  sieveWith (item, callback, split) {
    this.root.add(item, callback, split)
  }

  /**
   * Helper function to build the BSP tree
   * @param {THREE.Box3} box is Box3 with integers
   * @param {Function<Number, Number, Number, THREE.Plane>} getPlane is a Function(x, y, z) where two parameters ar null and the third is an integer (lookup function for planes)
   * @returns {Node|Leaf} returns a node tree splitting the 3D space
   */
  buildNode (box, getPlane) {
    const size = box.getSize()
    const max = Math.max(size.x, size.y, size.z)
    if (max <= 1) { // we only need unit cubes!
      return new Leaf(box)
    }
    if (size.x === max) {
      const middleX = box.min.x + Math.floor(size.x / 2)
      const planeX = getPlane(middleX, null, null)
      const nodeX = new Node(planeX)
      nodeX.back = this.buildNode(new Box3(box.min, new Vector3(middleX, box.max.y, box.max.z)), getPlane)
      nodeX.front = this.buildNode(new Box3(new Vector3(middleX, box.min.y, box.min.z), box.max), getPlane)
      return nodeX
    } else if (size.y === max) {
      const middleY = box.min.y + Math.floor(size.y / 2)
      const planeY = getPlane(null, middleY, null)
      const nodeY = new Node(planeY)
      nodeY.back = this.buildNode(new Box3(box.min, new Vector3(box.max.x, middleY, box.max.z)), getPlane)
      nodeY.front = this.buildNode(new Box3(new Vector3(box.min.x, middleY, box.min.z), box.max), getPlane)
      return nodeY
    }
    const middleZ = box.min.z + Math.floor(size.z / 2)
    const planeZ = getPlane(null, null, middleZ)
    const nodeZ = new Node(planeZ)
    nodeZ.back = this.buildNode(new Box3(box.min, new Vector3(box.max.x, box.max.y, middleZ)), getPlane)
    nodeZ.front = this.buildNode(new Box3(new Vector3(box.min.x, box.min.y, middleZ), box.max), getPlane)
    return nodeZ
  }
}

module.exports = UnitSieve
