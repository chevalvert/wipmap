'use strict'

import store from 'utils/store'
import getUrlParam from 'utils/get-url-param'

const config = {
  server: {
    // address: window.location.origin
    address: '192.168.0.16',
    port: 8888
  },

  DOM: {
    mapWrapper: document.querySelector('.map'),
    agentsWrapper: document.querySelector('.agents')
  },

  stored: {
    scale: getUrlParam('scale') || 1
  },

  spritesheets: {
    'grass': { src:'spritesheets/grass.png', resolution: 10 },
    'sand': { src: 'spritesheets/sand.png', resolution: 10 },
    'tree': { src: 'spritesheets/tree.png', resolution: 40, length: 7 },
    'water': { src: 'spritesheets/water.png', resolution: 20 },
    'dune': { src: 'spritesheets/dune.png', resolution: 20 },
    'brush': { src: 'brush.png' }
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

  forbidden: ['WATER']
}

Object.entries(config.stored)
  .forEach(([key, value]) => { store.set(key, value) })

export default config
