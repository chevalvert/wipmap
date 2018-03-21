# wipmap / docs / texture

The default texture pack for `wipmap` is [`wipmap.tex.json`](../wipmap.tex.json).  

**[WIP]**
<!--
You can specify your own texture pack with the `--texture-pack` option:

```sh
$ wipmap --texture-pack path/to/my/texture-pack
```

Use the `-l, --live` flag to allow the server to re-read all config files (including external textures file) on request:

```sh
$ wipmap --live --config path/to/my/config.json
```
<sup>Note that in production, the `-l, --live` flag shouldn't be used, as it is far more efficient to request a cached config.</sup>

<br>

## Structure of a texture pack
```sh
my-texpack/
│
├── spritesheet-1.png
├── spritesheet-2.png
├── spritesheet-3.png
│
└── my-texpack.tex.json
```

### `my-texpack.tex.json`

```json
{
  "spritesheets": {
    "sprite1": { "src": "spritesheet-1.png", "resolution": 50 },
    "sprite2": { "src": "spritesheet-2.png", "resolution": 100 },
    "sprite3": { "src": "spritesheet-2.png", "resolution": 10, "length": 3},
  },

  "textures": {
    "BIOME1": [["sprite1", 1]],
    "BIOME2": [["sprite2", 0.01], ["sprite3", 0.05]]
  }
}
```
-->
