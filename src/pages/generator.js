'use strict'

import L from 'loc'
import config from 'config'
import store from 'utils/store'
import error from 'utils/error'
import loader from 'controllers/loader'
import LogScreen from 'components/log-screen'

import getSpriteIndex from 'utils/get-sprite-index'
import landmarks from 'controllers/landmarks'
import Panel from 'controllers/generator'

import prng from 'utils/prng'
import post from 'utils/post'
import { validateJsonResponse } from 'utils/fetch-json'

import Map from 'components/map'

let map
let loading
let panel

function setupPanel () {
  panel = Panel()
  panel.on('generate', setup)
  panel.on('save', save)
}

function setup () {
  if (!panel) setupPanel()

  // TODO: check diff with previous wipmapConfig, and REST call only if changed
  const wipmapConfig = {
    'width': Math.floor(8 * ((panel.values.scale * 2) / 100)),
    'height': Math.floor(6 * ((panel.values.scale * 2) / 100)),

    'jitter': 0.4,
    'distortion': panel.values.distortion / 100,
    'gradient': 0,
    'poissonDensity': 0.3,

    'probablities': {
      'water': panel.values.water / 100,
      'forest': panel.values.forest / 100,
    },

    'biomesMap': [
      ['TAIGA', 'JUNGLE', 'SWAMP'],
      ['TUNDRA', 'PLAINS', 'PLAINS'],
      ['TUNDRA', 'PLAINS', 'DESERT']
    ],

    'landmarks': {
      'house': {
        'length': panel.values.houses,
        'biomes': ['PLAINS'],
      },
      'tree': {
        'length': 100,
        'biomes': ['WATER'],
      }
    }
  }

  config.biomes = {
    'PLAINS': [['grass', panel.values.grass / 100]],
    'DESERT': [['sand', 1], ['dune', 0.001]],

    'TAIGA': [['sand', 1]],
    'TUNDRA': [['sand', 1]],
    'SWAMP': [['sand', 1]],

    'FOREST': [['tree', 0.1]],
    'WATER': [['water', 0.5]]
  }

  // TODO?: random position based on String seed
  const url = `http://${config.server.address}:${config.server.port}/api/generate/0/0`

  loading = new LogScreen( L`loading` )
  Promise.resolve()
  .then(() => loading.mount(document.body))
  .then(() => map && map.destroy())
  .then(() => loading.say( L`loading.sprites` ))
  .then(() => loader.loadSprites())
  .then(() => loading.say( L`loading.generating` ))
  .then(() => post(url, wipmapConfig))
  .then(validateJsonResponse)
  .then(start)
  .then(() => loading.destroy())
  .catch(err => {
    console.error(err)
    loading.destroy()
    error(err)
  })
}

function start (json) {
  loading && loading.say( L`loading.drawing` )
  return new Promise ((resolve, reject) => {
    prng.setSeed(json.seed)

    landmarks.set(json, true)
    landmarks.forEach(landmark => {
      // WIP: set x / y based on panel params :
      // const x = panel.values[`${landmark.type}-width`] + (prng.random() > 0.9 ? prng.randomInt(-1, 1) : 0)
      // const y = panel.values[`${landmark.type}-height`] + (prng.random() > 0.9 ? prng.randomInt(-1, 1) : 0)
      const x = Math.floor(Math.random() * 3)
      const y = Math.floor(Math.random() * 3)
      landmark.sprite = {
        name: landmark.type,
        index: getSpriteIndex(store.get('spritesheet_' + landmark.type), [x, y])
      }
      landmarks.markAsFound(landmark)
    })

    map = new Map(json, { voronoi: panel.values.voronoi })
    map.mount(config.DOM.mapWrapper)
    resolve()
  })
}

function save () {
  console.log('this map UID is FOO')
}

export default { setup }
