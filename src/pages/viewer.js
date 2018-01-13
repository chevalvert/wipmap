'use strict'

import config from 'config'
import store from 'utils/store'
import ws from 'utils/websocket'
import hs from 'utils/handshake'

import loader from 'controllers/loader'
import LogScreen from 'components/log-screen'

import agents from 'controllers/agents'
import Map from 'components/map'
import Fog from 'components/fog'

import prng from 'utils/prng'
import getUrlParam from 'utils/get-url-param'
import fps from 'fps-indicator'

function handshake () {
  hs('viewer').then(() => { setup() })
}

function setup () {
  const loading = new LogScreen('chargement')
  Promise.resolve()
  .then(() => loading.mount(document.body))
  .then(() => loading.say('sprites'))
  .then(() => loader.loadSprites())
  .then(() => loading.say('map'))
  .then(() => {
    const x = getUrlParam('x') || 0
    const y = getUrlParam('y') || 0
    const f = getUrlParam('force')
    return loader.loadMap(x, y, f)
  })
  .then(map => {
    store.set('landmarks', map.landmarks)
    start(map)
  })
  .then(() => loading.destroy())
  .catch(err => {
    console.error(err)
    loading.destroy()
    const error = new LogScreen('Error', err, 'error')
    error.mount(document.body)
  })
}

function start (json) {
  prng.setSeed(json.seed)

  const map = new Map(json)
  const fog = new Fog('white')

  map.mount(config.DOM.mapWrapper)
  fog.mount(config.DOM.mapWrapper)

  agents.setup()

  fps()
}


export default { setup, handshake }
