'use strict'

import ws from 'utils/websocket'

import error from 'utils/error'
import loader from 'controllers/loader'

import LogScreen from 'components/log-screen'
import Nipple from 'components/nipple'
import Describer from 'controllers/describer'

let nipple

function setup (color) {
  if (!color) {
    const error = new LogScreen('Error', 'no slot available', 'error')
    error.mount(document.body)
    return
  }

  const loading = new LogScreen('chargement', '')
  Promise.resolve()
  .then(() => loading.mount(document.body))
  .then(() => loading.say('sprites'))
  .then(() => loader.loadSprites())
  .then(() => start(color))
  .then(() => loading.destroy())
  .catch(err => {
    console.error(err)
    loading.destroy()
    error(err)
  })
}

function start (color) {
  nipple = new Nipple(color)
  nipple.mount(document.querySelector('.nipple-wrapper'))
  nipple.watch(data => { ws.send('agent.move', data) })

  ws.on('remote.landmark.found', data => {
    const describer = new Describer(data.landmark, data.describer)
    nipple.disable()
  })
}

export default {
  setup,
  waitForSlot: ws.once('setcolor', data => { setup(data.color) })
}
