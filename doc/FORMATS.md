# Formats

## Metadata

```json
{
  "name": "powerpuff",
  "type": "model",
  "description": "I am a grid!",
  "version": "1.0.0",
  "author": "Me",
  "homepage": "http://example.com",
  "license": "CC1.0"
}
```

Fields:
* `name`: String, required, name of the palette/model
* `version`: semantic version, required, version of palette NOT model!
* `type`: (palette|model), required
* `license`: String, required, license of palette/model
* `description`: String, optional, description of the palette/model
* `author`: String, optional, who made this palette/model?
* `homepage`: URL, optional

## Model

### 2D model
```json
{
  "format": "flat-v1.0.0",
  "map": "image.png"
}
```

Fields:
* `format` = "flat-v1.0.0"
* `map`: image path relative to this file

### 3D layered model
```json
{
  "format": "layered-v1.0.0",
  "map": "image.png",
  "layers": [
    {
      "source": {
        "x": 0,
        "y": 0,
        "width": 16,
        "height": 16
      },
      "target": {
        "x": 0,
        "y": 0
      }    
    },
    null
  ]
}
```

Fields:
* `format` = "layered-v1.0.0"
* `map`: image path relative to this file (**required**)
* `layers`: list of layers (**required**), bottom-up, where each item can be `null` for an empty layer, or an object with following fields
  * `source`: rectangle on source image describing the colors of this layer (**required**)
    * `x`: Integer (**required**)
    * `y`: Integer (**required**)
    * `width`: Integer (**required**)
    * `height`: Integer (**required**)
  * `target`: point where to place the colors on this layer (**optional**)
    * `x`: Integer (**optional**, default is 0)
    * `y`: Integer (**optional**, default is 0)

### 3D assembled model

#### Example

```json
{
  "format": "assembled-v1.0.0",
  "map": "image.png",
  "definitions": {
    "side": {
      "type": "data",
      "source": {
        "x": 12,
        "y": 23,
        "width": 16,
        "height": 17
      },
      "translation": {
        "x": 1,
        "y": 2,
        "z": 10
      },
      "rotation": {
        "yaw": 90,
        "pitch": 0,
        "roll": 0
      }
    }
  },
  "children": [
    {
      "type": "use",
      "reference": "side"
    }, {
      "type": "group",
      "children": []
    }
  ]
}
```

#### Classes

Model
* `format` = "assembled-v1.0.0"
* `map`: relative image path
* `definitions`: map of String => `Part`
* `children`: list of `Part`

*Part* (abstract class)
* `type`: (`use`|`data`|`group`)
* `translation`: `Vector3`, defaults to (0, 0, 0)
* `rotation`: `Euler`, defaults to (0, 0, 0)
* rotation will be applied at the translated location

Use (extends *Part*)
* `reference`: String, a valid definition name

Group (extends *Part*)
* `children`: list of `Part`

Vector3
* `x`: Number
* `y`: Number
* `z`: Number

Euler
* `yaw`: Number
* `pitch`: Number
* `roll`: Number

## Palettes
```json
{
  "C21": "#FF0000",
  "C22": "#00FF00",
  "C23": "#0000FF",
  "C24": {
    "name": "Red",
    "color": "#FF0000"
  }
}
```

It is a map of identifiers to color values or an object with following fields:
* `name`: String, a caption
* `color`: String, a hex color
