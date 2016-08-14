const nodeThree = require('./node-three/index')
const THREE = nodeThree.THREE
const Vector3 = THREE.Vector3
const Plane = THREE.Plane
const Box3 = THREE.Box3

class Node {
  constructor(plane) {
    this.plane = plane
    this.back = null
    this.front = null
  }
  //adds a splittable item to the node
  add(item) {
    const self = this
    const parts = item.split(this.plane)
    parts.front.forEach(function(frontItem) {
      self.front.add(frontItem)
    })
    parts.back.forEach(function(backItem) {
      self.back.add(backItem)
    })
  }
  //traverse all voxels
  //param callback is Function(leafBox, items)
  forEach(callback) {
    this.back.forEach(callback)
    this.front.forEach(callback)
  }
}

class Leaf {
  constructor(box) {
    this.box = box
    this.items = []
  }
  add(item) {
    this.items.push(item)
  }
  //visit this voxel
  //param callback is Function(leafBox, items)
  forEach(callback) {
    callback(this.box, this.items)
  }
}

class VoxelGrid {
  //param box is THREE.Box3
  constructor(box) {
      box = box.clone()
      box.min.floor()
      box.max.ceil()
      this.root = this._build(box)
  }
  //add splittable item to voxel grid
  //param item has Function Item.split(THREE.Plane)
    //returning { front: Item, back: Item }
  add(item) {
    this.root.add(item)
  }
  //traverse all voxels
  //param callback is Function(leafBox, items)
  forEach(callback) {
    this.root.forEach(callback)
  }
  //box is Box3 with integers
  _build(box) {
    const size = box.size()
    const max = Math.max(size.x, size.y, size.z)
    if(max <= 1) //we only need unit cubes!
      return new Leaf(box)
    if(size.x === max) {
      const middleX = box.min.x + Math.floor(size.x / 2)
      const planeX = new Plane(new Vector3(1, 0, 0), -middleX)
      const nodeX = new Node(planeX)
      nodeX.back = this._build(new Box3(box.min, new Vector3(middleX, box.max.y, box.max.z)))
      nodeX.front = this._build(new Box3(new Vector3(middleX, box.min.y, box.min.z), box.max))
      return nodeX
    } else if(size.y === max) {
      const middleY = box.min.y + Math.floor(size.y / 2)
      const planeY = new Plane(new Vector3(0, 1, 0), -middleY)
      const nodeY = new Node(planeY)
      nodeY.back = this._build(new Box3(box.min, new Vector3(box.max.x, middleY, box.max.z)))
      nodeY.front = this._build(new Box3(new Vector3(box.min.x, middleY, box.min.z), box.max))
      return nodeY
    } else {
      const middleZ = box.min.z + Math.floor(size.z / 2)
      const planeZ = new Plane(new Vector3(0, 0, 1), -middleZ)
      const nodeZ = new Node(planeZ)
      nodeZ.back = this._build(new Box3(box.min, new Vector3(box.max.x, box.max.y, middleZ)))
      nodeZ.front = this._build(new Box3(new Vector3(box.min.x, box.min.y, middleZ), box.max))
      return nodeZ
    }
  }
}

module.exports = VoxelGrid
