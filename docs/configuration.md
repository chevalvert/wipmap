# wipmap/configuration

>For "live reload" capability run `node server` with the `-l, --live` flag:
>```sh
>$ node server --live --config=wipmap.config.json # enable live reloading of wipmap.config.json
>```

### [`wipmap.config.json`](../wipmap.config.json)

<pre>
{
  "remotes": {
    "max": 0,                # number of maximum simultaneous remote connections
    "colors": [              # list of remote CSS valid colors
      "rgb(255, 50, 70)",
      "rgb(255, 90, 20)",
      "rgb(255, 150, 40)",
      "rgb(255, 225, 60)",
      "rgb(80, 230, 130)",
      "rgb(0, 120, 80)",
      "rgb(0, 160, 180)",
      "rgb(80, 130, 255)",
      "rgb(20, 20, 180)",
      "rgb(110, 230, 255)",
      "rgb(150, 150, 255)",
      "rgb(150, 60, 255)",
      "rgb(110, 0, 120)",
      "rgb(255, 100, 240)",
      "rgb(255, 150, 155)"
    ]
  },

  "wipmap-generate": {       # wipmap-generate configuration
    "width": 8,              # see <a href=https://github.com/chevalvert/wipmap-generate"">wipmap-generate module</a>
    "height": 6,
    "decimals": 3,

    "jitter": 0.4,
    "distortion": 1,
    "gradient": 0,
    "poissonDensity": 0.3,

    "probablities": {
      "water": 0.01,
      "forest": 0.02
    },

    "biomesMap": [
      ["TAIGA", "JUNGLE", "SWAMP"],
      ["TUNDRA", "PLAINS", "PLAINS"],
      ["TUNDRA", "PLAINS", "DESERT"]
    ]
  },

  "gameover": {            
    "landmarksLength": 100, # number of landmarks to reveal before reaching the gameover screen
    "duration": 10          # duration of the gameover screen in seconds
  },

  "fog": {
    "enable": true,         # wether to enable or disable entirely the fog of war layer
    "color": "white"        # CSS valid color of the fog
  },

  "agent": {
    "speed": 10,           # speed of the agent
    "fov": 150,            # radius of the agent field of view
    "inertia": {           # parameters of the agent <a href="../src/utils/inertia.js">inertia equation</a>
      "interpolation": "linear",
      "rigidity": 0.1,
      "friction": 10
    },
    "forbidden": []        # list of biomes the agent can't move to
  },

  "spritesheets": {        # reference spritesheets assets
    "blobs": { "src": "spritesheets/Biome-blobs-10px.png", "resolution": 10 },
    "bush": { "src": "spritesheets/Biome-bush-20px.png", "resolution": 20 },
    "dune": { "src": "spritesheets/Biome-dune-60px.png", "resolution": 60 },
    "grass1": { "src": "spritesheets/Biome-grass1-10px.png", "resolution": 10 },
    "grass2": { "src": "spritesheets/Biome-grass2-10px.png", "resolution": 10 },
    "gravel": { "src": "spritesheets/Biome-gravel-10px.png", "resolution": 10 },
    "hills": { "src": "spritesheets/Biome-hills-20px.png", "resolution": 20 },
    "mountain": { "src": "spritesheets/Biome-mountain-60px.png", "resolution": 60 },
    "pike": { "src": "spritesheets/Biome-pike-20px.png", "resolution": 20 },
    "rock": { "src": "spritesheets/Biome-rock-20px.png", "resolution": 20 },
    "sand": { "src": "spritesheets/Biome-sand-10px.png", "resolution": 10, "length": 5 },
    "soil": { "src": "spritesheets/Biome-soil-10px.png", "resolution": 10 },
    "tree": { "src": "spritesheets/Biome-tree-All-60px.png", "resolution": 60 },
    "tree-forest": { "src": "spritesheets/Biome-tree-Forest-50px.png", "resolution": 50 },
    "tree-jungle": { "src": "spritesheets/Biome-tree-Jungle-50px.png", "resolution": 50 },
    "tree-plains": { "src": "spritesheets/Biome-tree-Plains-50px.png", "resolution": 50 },
    "tree-taiga": { "src": "spritesheets/Biome-tree-Taiga-50px.png", "resolution": 50 },

    "water1": { "src": "spritesheets/Biome-water1-20px.png", "resolution": 20 },
    "water2": { "src": "spritesheets/Biome-water2-35px.png", "resolution": 35, "length": 2 },
    "water3": { "src": "spritesheets/Biome-water3-40px.png", "resolution": 40 },
    "water4": { "src": "spritesheets/Biome-water4-60px.png", "resolution": 60 },
    "water5": { "src": "spritesheets/Biome-water5-60px.png", "resolution": 60, "length": 4 },

    "brush": { "src": "BRUSH-04-150px.png" },

    "desert-H": { "src": "spritesheets/Landmark-Desert-habitation-65px.png", "resolution": 65 },
    "forest-H": { "src": "spritesheets/Landmark-Forest-habitation-65px.png", "resolution": 65 },
    "jungle-H": { "src": "spritesheets/Landmark-Jungle-habitation-100px.png", "resolution": 100 },
    "plains-H": { "src": "spritesheets/Landmark-Plains-habitation-65px.png", "resolution": 65 },
    "swamp-H": { "src": "spritesheets/Landmark-Swamp-habitation-65px.png", "resolution": 65 },
    "taiga-H": { "src": "spritesheets/Landmark-Taiga-habitation-100px.png", "resolution": 100 },
    "tundra-H": { "src": "spritesheets/Landmark-Tundra-habitation-65px.png", "resolution": 65 },

    "desert-V": { "src": "spritesheets/Landmark-Desert-vegetation-90px.png", "resolution": 90 },
    "forest-V": { "src": "spritesheets/Landmark-Forest-vegetation-45px.png", "resolution": 45 },
    "jungle-V": { "src": "spritesheets/Landmark-Jungle-vegetation-110px.png", "resolution": 110 },
    "plains-V": { "src": "spritesheets/Landmark-Plains-vegetation-45px.png", "resolution": 45 },
    "swamp-V": { "src": "spritesheets/Landmark-Swamp-vegetation-45px.png", "resolution": 45 },
    "taiga-V": { "src": "spritesheets/Landmark-Taiga-vegetation-45px.png", "resolution": 45 },
    "tundra-V": { "src": "spritesheets/Landmark-Tundra-vegetation-45px.png", "resolution": 45 }
  },

  "biomes": {
    "DESERT": [["sand", 1], ["dune", 0.01]],
    "FOREST": [["soil", 0.01], ["tree-forest", 0.05]],
    "JUNGLE": [["blobs",0.1], ["tree-jungle", 0.02]],
    "PLAINS": [["grass2", 0.08], ["tree-plains", 0.003]],
    "SWAMP": [["water1", 0.1], ["grass2", 0.02]],
    "TAIGA": [["tree-taiga", 0.005], ["hills", 0.02], ["pike", 0.005]],
    "TUNDRA": [["rock", 0.002], ["gravel", 0.04], ["bush", 0.002], ["mountain", 0.001]],
    "WATER": [["water4", 1]]
  },

  "landmarks": {
    "H": {
      "biomes": ["DESERT", "FOREST", "JUNGLE", "PLAINS", "SWAMP", "TAIGA", "TUNDRA"],
      "variables": [
        ["small", "big"],
        ["square", "round"]
      ]
    },
    "V": {
      "biomes": ["DESERT", "FOREST", "JUNGLE", "PLAINS", "SWAMP", "TAIGA", "TUNDRA"],
      "variables": [
        ["small", "big"],
        ["leafy", "flowery"]
      ]
    }
  }
}
</pre>
