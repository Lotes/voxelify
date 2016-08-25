# Commands

## Generate from 3D model

* Status: idea
* Priority: core feature

```
> voxelify
    --generate
    --input-file model.obj
    --size 20
    [--output-file model.json]
    [--yaw 90]
    [--pitch 20]
    [--roll 10]
    [--palette palette.json]
    [--preview-image preview.png]
    [--preview-animation preview.gif]
    [--force]

creating model.json + map.png
```

Mode arguments:
* `--generate`, required, the current tool mode

Input arguments:
* `--input-file model.obj`, required, the input model path
  * currently only OBJ file format supported!
* `--size <int>`, required, the maximal width/depth/height of the model in units
* `--yaw <float>`, optional, euler rotation in degrees for the model
* `--pitch <float>`, optional, euler rotation in degrees for the model
* `--roll <float>`, optional, euler rotation in degrees for the model
* `--palette <palette.json>`, optional, path to palette. Only colors of this palette will be used.

Output arguments:
* `--force`, optional, will overwrite existing files
* at least one must be set:
  * aborts if files already exist, see `--force`
  * `--output-file <model.json>`, optional, the target file path for voxelified model
  * `--preview-image <preview.png>`, optional, the target path for saving a preview image
  * `--preview-animation <preview.gif>`, optional, the target path for saving a preview animation

## Initialize palette

* Status: idea
* Priority: middle

```
> voxelify --palette --output-file palette.json

creating palette.json
```

## Export voxel model

* Status: idea
* Priority: low

```
> voxelify
  --export
  --input-file model.json
  --output-file xyz.abc
  --format (3D|pdf|image)
```
