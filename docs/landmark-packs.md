# wipmap / docs / landmark packs

The default landmark pack for `wipmap` is [`wipmap.pack.json`](../wipmap.pack.json).  

You can add your own packs with the `--landmark-packs` option:

```sh
$ wipmap --landmark-packs path/to/my/packs/
```

To prevent `wipmap` from loading the default landmark pack, use the `--no-default-pack` flag:

```sh
$ wipmap --no-default-pack --landmark-packs path/to/my/packs/
```

Use the `-l, --live` flag to allow the server to re-read all config files (including external packs) on request:

```sh
$ wipmap --live --landmark-packs path/to/my/packs/
```
<sup>Note that in production, the `-l, --live` flag shouldn't be used, as it is far more efficient to request a cached config.</sup>

<br>

## Structure of a packs directory
```sh
my-packs/
│
├── pack-1/
│   ├── spritesheet-1.png
│   ├── spritesheet-2.png
│   ├── spritesheet-3.png
│   └── pack-1.pack.json
│
├── pack-2/
│   ├── spritesheet-1.png
│   ├── spritesheet-2.png
│   └── pack-2.pack.json
│
└── ...
```

### `pack-1.pack.json`

```json
[
  {
    "name": "landmark-1",
    "variables": [
      ["x1", "x2", "x3"],
      ["y1", "y2", "y3"]
    ],
    "spritesheets": [
      { "biomes": ["DESERT"], "src": "spritesheet-1.png", "resolution": 100 }
    ]
  },

  {
    "name": "(some )?landmark-2",
    "variables": [
      ["x1", "x2"],
      ["y1", "y2"]
    ],
    "spritesheets": [
      { "biomes": ["JUNGLE", "FOREST", "PLAINS"], "src": "spritesheet-2.png", "resolution": 120 },
      { "biomes": ["TUNDRA", "TAIGA", "SWAMP"], "src": "spritesheet-3.png", "resolution": 120 }
    ]
  }
]
```

### Optionnal article
When defining a landmark name, you can pass an optionnal article used in some syntactic cases: 
```json
name: "(article )?name"
```

For instance, a landmark named `(a )?house` could be used in the following sentences:
- _Please draw a house._
- _landmark type = house_

## Multilang

Multilang for packs isn't supported yet. You'll need to load manually translated packs.
