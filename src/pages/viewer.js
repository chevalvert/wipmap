'use strict'

import config from 'config'
import store from 'utils/store'
import ws from 'utils/websocket'

import loader from 'controllers/loader'
import Loading from 'components/loading-screen'

import agents from 'controllers/agents'
import Map from 'components/map'
import Fog from 'components/fog'

import prng from 'utils/prng'
import getUrlParam from 'utils/get-url-param'
import fps from 'fps-indicator'

function setup () {
  const loading = new Loading()

  Promise.resolve()
  .then(() => loading.mount(document.body))
  .then(() => loader.loadSprites())
  .then(() => {
    const x = getUrlParam('x') || 0
    const y = getUrlParam('y') || 0
    const f = getUrlParam('force')
    return loader.loadMap(x, y, f)
  })
  .then(map => start(map))
  .then(() => loading.destroy())
  .catch(err => { console.warn(err) })

  function start (json) {
    prng.setSeed(json.seed)

    const map = new Map(json)
    const fog = new Fog('white')

    map.mount(config.DOM.mapWrapper)
    fog.mount(config.DOM.mapWrapper)

    agents.setup()

    agents.add('blue')
    agents.add('red')
    agents.add('green')
    agents.add('pink')

    fps()
  }

  window.addEventListener('mousedown', e => {
    const target = e.target
    if (target.classList.contains('agent')) {
      window.onmousemove = e => {
        store.set('debug.agent.move', {
          id: target.id.replace('agent-', ''),
          direction: [e.movementX, e.movementY]
        })
      }
    }
  })

  window.addEventListener('mouseup', e => {
    window.onmousemove = null
  })
}

export default { setup }
