const ThreeExtensions = require('./ThreeExtensions')
const THREE = ThreeExtensions.THREE
const Vector3 = THREE.Vector3
const Plane = THREE.Plane
const Box3 = THREE.Box3

class Node {
  constructor (plane) {
    this.plane = plane
    this.back = null
    this.front = null
  }
  // adds a splittable item to the node
  * add (item, split) {
    for (var x of split(item, this.plane)) {
      if (x.isFront) {
        yield * this.front.add(x.item, split)
      } else {
        yield * this.back.add(x.item, split)
      }
    }
  }
}

class Leaf {
  constructor (box) {
    this.box = box
  }
  * add (item, split) {
    yield {
      item: item,
      box: this.box
    }
  }
}

class UnitSieve {
  // param box is THREE.Box3
  constructor (box) {
    box = box.clone()
    box.min.floor()
    box.max.ceil()
    this.build(box)
  }
  // param box is Box3 with integers
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
  // add splittable item to voxel grid
  // param item can be anything
  // param split is the split function of type Function(Item, Plane): Observable<{ item: Item, isFront: boolean }>
    // returns Observable<{ item: Item, box: Box3 }>
  * sieveWith (item, split) {
    yield * this.root.add(item, split)
  }
  // param: box is Box3 with integers
  // param: getPlane is a Function(x, y, z) where two parameters ar null and the third is an integer (lookup function for planes)
  buildNode (box, getPlane) {
    const size = box.size()
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
    } else {
      const middleZ = box.min.z + Math.floor(size.z / 2)
      const planeZ = getPlane(null, null, middleZ)
      const nodeZ = new Node(planeZ)
      nodeZ.back = this.buildNode(new Box3(box.min, new Vector3(box.max.x, box.max.y, middleZ)), getPlane)
      nodeZ.front = this.buildNode(new Box3(new Vector3(box.min.x, box.min.y, middleZ), box.max), getPlane)
      return nodeZ
    }
  }
}

module.exports = UnitSieve
