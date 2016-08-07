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
    * fetch weighted textures color from subtriangles
  * collect the found color information in a voxel grid
* output the voxel grid layer-for-layer into a PNG file

## Formulas
Given a triangle `T=ABC` and a voxel `V` with 6 sides.

### Triangles
A triangle can be described as a starting point A with two spanning vectors,
e.g.:

`T(u, v) = A + u * R1 + v * R2`
where `(u+v)` in `{0..1}`, `R1 = B - A` and `R2 = C - A`

The triangle `T` can also be described as plane via its normal `N_t` and a
constant `d`.

`T(x): N * x + d = 0`
where `N = (B-A) x (C-A)` and `d = N * A`.

A plane has no borders, it is infinite in space compared with a triangle!

### Voxels

A voxel is a axis aligned unit cube with 6 sides. Each side can be described as
quad Q or as a plane.

`Q(u, v) = S + u * A1 + v * A2`
where `u, v` in `{0..1}`, S is the starting point of the quad and A1 and A2 are
the spanning axes of the quad.

`Q(x): N * x + d = 0`
where `N = A1 x A2` and `d = N * S`.

## Idea

The triangle is a convex 2D shape. The voxel is a convex 3D shape.
The intersection of two 2D convex shapes is convex again.

For vertices (position + texture coordinates) find the intersection vertices
with the voxel. Then, find the convex hull of the texture coordinates of these
intersection points. The pixels in that hull are partially the color information
of the voxel. This information must be weighted to the size of 3D polygon.  

## Approach

For each quad `Q` of `V`, check where `Q` intersects `T`.

Find the solution `(s, t, u, v)` for the equation `Q(s, t) = T(u, v)`, where
`s, t, (u+v) in {0..1}`.

### Solution
```
Q(s, t) = T(u, v)
S + s * A1 + t * A2 = A + u * R1 + v * R2
s * A1 + t * A2  - u * R1 - v * R2 = A - S
```

Assume `v = 0`. This would check an intersection of AB with Q, where `u` can
be in `{0..1}`.

```
s * A1 + t * A2  - u * R1 = A - S

can be written as matrix equation:
| A1.x A2.x R1.x |   |  s |   | A.x - S.x |
| A1.y A2.y R1.y | * |  t | = | A.y - S.y |
| A1.z A2.z R1.z |   | -u |   | A.z - S.z |
```
