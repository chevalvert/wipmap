'use strict'

import ws from 'utils/websocket'

import loader from 'controllers/loader'

import LogScreen from 'components/log-screen'
import Nipple from 'components/nipple'
import Describer from 'components/describer'


function waitForSlot () {
  ws.once('setcolor', data => { setup(data.color) })
}

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
    const error = new LogScreen('Error', err, 'error')
    error.mount(document.body)
  })


  ws.on('remote.landmark.found', landmark => {
    const found = new LogScreen('landmark!', `${landmark[2]} (${landmark[3]})`, 'success')
    found.mount(document.body)
  })
}

function start (color) {
  const nipple = new Nipple(color)
  nipple.mount(document.querySelector('.nipple-wrapper'))
  nipple.watch(data => { ws.send('agent.move', data) })
}

export default { setup, waitForSlot }
