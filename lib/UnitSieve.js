const nodeThree = require('./node-three/index')
const THREE = nodeThree.THREE
const Vector3 = THREE.Vector3
const Plane = THREE.Plane
const Box3 = THREE.Box3
const Rx = require('rx')

class Node {
  constructor(plane) {
    this.plane = plane
    this.back = null
    this.front = null
  }
  //adds a splittable item to the node
  add(item, split) {
    return split(item, this.plane)
      .flatMap(x => {
        if(x.isFront)
          return this.front.add(x.item, split)
        else
          return this.back.add(x.item, split)
      })
  }
}

class Leaf {
  constructor(box) {
    this.box = box
  }
  add(item, split) {
    return Rx.Observable.of({
      item: item,
      box: this.box
    })
  }
}

class UnitSieve {
  //param box is THREE.Box3
  constructor(box) {
    box = box.clone()
    box.min.floor()
    box.max.ceil()
    this.root = this._build(box)
  }
  //add splittable item to voxel grid
  //param item can be anything
  //param split is the split function of type Function(Item, Plane): Observable<{ item: Item, isFront: boolean }>
    //returns Observable<{ item: Item, box: Box3 }>
  sieveWith(item, split) {
    return this.root.add(item, split)
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

module.exports = UnitSieve
