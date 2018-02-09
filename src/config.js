'use strict'

import store from 'utils/store'
import getUrlParam from 'utils/get-url-param'

const config = {
  server: {
    address: window.isProduction ? window.location.hostname : '192.168.1.69',
    port: 8888
  },

  stored: {
    scale: getUrlParam('scale') || 1
  },

  agent: {
    speed: 100,
    fov: 100,
    inertia: {
      interpolation: 'linear',
      rigidity: 0.1,
      friction: 10
    },
    forbidden: []
  },

  spritesheets: {
    'grass': { src:'spritesheets/grass.png', resolution: 10 },
    'sand': { src: 'spritesheets/sand.png', resolution: 10 },
    'tree': { src: 'spritesheets/tree.png', resolution: 40, length: 7 },
    'water': { src: 'spritesheets/water.png', resolution: 20 },
    'dune': { src: 'spritesheets/dune.png', resolution: 20 },

    'brush': { src: 'brush.png' },
    'house' : {src: 'spritesheets/house.png', resolution: 20 },
    'rock' : {src: 'spritesheets/rock.png', resolution: 20 }
  },

  biomes: {
    // key: [...[sprite, proba, ...scale]]
    'PLAINS': [['grass', 0.01]],
    'DESERT': [['sand', 1], ['dune', 0.001]],

    'TAIGA': [['sand', 1]],
    'TUNDRA': [['sand', 1]],
    'SWAMP': [['sand', 1]],

    'FOREST': [['tree', 0.1]],
    'WATER': [['water', 0.5]]
  },

  landmarks: {
    house: {
      biomes: ['PLAINS', 'FOREST'],
      variables: [
        ['small', 'big'],
        ['light', 'heavy']
      ]
    },
    tree: {
      biomes: ['PLAINS', 'FOREST', 'JUNGLE'],
      variables: [
        ['touffu', 'pas touffu'],
        ['vert', 'bleu']
      ]
    }
  },

  gameover: 300
}

Object.entries(config.stored)
  .forEach(([key, value]) => { store.set(key, value) })

export default config
