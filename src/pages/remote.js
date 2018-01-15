'use strict'

import config from 'config'
import ws from 'utils/websocket'

import error from 'utils/error'
import loader from 'controllers/loader'

import LogScreen from 'components/log-screen'
import Describer from 'components/describer'
import Nipple from 'components/nipple'

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

  // WIP
  const data = {
    landmark: ["8.432", "3.509", "house", "PLAINS", "FUN1"],
    describer : {
      x: ["SMALL", "AVERAGE", "BIG"],
      y: ["LIGHT", "AVERAGE", "HEAVY"]
    },
    sentences: [
      'Nous sommes dans %biome,\nje vois une %type %x et %y.',
      'Elle est aussi %z.'
    ]
  }

  // ws.on('remote.landmark.found', data => {
    nipple.disable()

    const describer = new Describer(data)
    describer.mount(config.DOM.describerWrapper)
  // })
}

export default {
  setup,
  waitForSlot: ws.once('setcolor', data => { setup(data.color) })
}
