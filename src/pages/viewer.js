'use strict'

import config from 'config'
import store from 'utils/store'
import ws from 'utils/websocket'

import error from 'utils/error'
import loader from 'controllers/loader'
import LogScreen from 'components/log-screen'

import agents from 'controllers/agents'
import landmarks from 'controllers/landmarks'

import Map from 'components/map'
import Fog from 'components/fog'

import prng from 'utils/prng'
import getUrlParam from 'utils/get-url-param'
import fps from 'fps-indicator'

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
    landmarks.set(map)
    start(map)
  })
  .then(() => loading.destroy())
  .catch(err => {
    console.error(err)
    loading.destroy()
    error(err)
  })
}

function start (json) {
  const map = new Map(json)
  const fog = new Fog('white')

  map.mount(config.DOM.mapWrapper)
  // fog.mount(config.DOM.mapWrapper)

  agents.setup()
  fps()

  ws.on('landmark.add', ({ agentID, landmark }) => {
    landmarks.markAsFound(landmark)
    agents.resume(agentID)

    // TODO: improve perf by redrawing only revelant map area
    map.update()
  })
}


export default { setup }
