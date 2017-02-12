Formats
=======

All formats are splitted into PNG sprites and JSON meta data.

Sprites are enumerated by an numeric sprite id. Meta data can be identified via an unique id string.

Folder structure
----------------

```
formats
|- <format_X>
|  |_ <version_1>
|  |  |_ model.schema.json
|  |  |_ version_2.migrator.js
|  |  |_ <version_key_A>.schema.json
|  |  |_ <version_key_B>.validator.js
|  |  ...
|  |_ <version_N>
|  |  |_ model.schema.json
|  |  |_ ...
|  |_ <format_key_A>.schema.json
|  |_ <format_key_B>.validator.js
|_ <global_key_A>.schema.json
|_ <global_key_B>.validator.js
```

Formats must be lowercase words.

Versions must be valid semantic versions (see package `semver`).

Schemas are JSON files with a valid JSON schema.

Validators are functions that get a `Container` and throw errors when something is wrong.

All keys must be lowercase words.
* Global schemas and validators will be applied to all formats.
* Format schemas and validators will only be applied to all versions of a format.
* Version schemas and validators will only be applied to a specific format version.

All schemas and validators will be loaded automatically. you do not have to enter these files somewhere.