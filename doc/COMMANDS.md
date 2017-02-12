# Commands 2

Split all commands to different executables with exactly one task.

```
* --progress, print percentual progress to `stderr`
```

## Slicing 3D models

```
voxslice3d
  * -i <filename>, --input <filename>
  * -m <size>, --min-size <size>
  * -M <size>, --max-size <size>
  * -o <filename>, --output <filename>
  * -r <xyz|xzy|yzx|yxz|zxy|zyx>, --rotation-order <xyz|xzy|yzx|yxz|zxy|zyx>
  * -x <angle>, --x-axis <angle>
  * -y <angle>, --y-axis <angle>
  * -z <angle>, --z-axis <angle>
  * -f <stl|obj|auto>, --format ...
  * -t <number>, --thickness <number>
```

## Slicing 2D image

```
voxslice2d
  * -i <filename>, --input <filename>
  * -m <size>, --min-size <size>
  * -M <size>, --max-size <size>
  * -o <filename>, --output <filename>
  * -a <angle>, --angle <angle>
```

## Import layer for layer as grid

```
voxjoingrid
* -i <filenamepattern>, --input <filenamepattern>
* -o <filename>, --output <filename>
* -s <asc|desc>, --sort <asc|desc>
```

## Export grid layer for layer

```
voxsplitgrid
* -i <filename>, --input <filename>
* -o <filenamepatern>, --output <filenamepattern>
* -s <asc|desc>, --sort <asc|desc>
```

## Statistics

```
voxstat <filename>
```

## Preview

## Colorize

```
voxsetpalette
* -i <grid zip in>
* -o <grid zip out>
* -p palette
```
