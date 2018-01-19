'use strict'

import config from 'config'
import ws from 'utils/websocket'
import store from 'utils/store'
import events from 'utils/events'

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
  store.set('remote.id', color)
  nipple = new Nipple(color)
  nipple.mount(document.querySelector('.nipple-wrapper'))
  nipple.watch(data => { ws.send('agent.move', data) })

  ws.on('remote.landmark.found', ({ landmark, wordsmap, sentences }) => {
    nipple.disable()

    const describer = new Describer(landmark, wordsmap, sentences)
    describer.mount(config.DOM.describerWrapper)

    events.once('describer.validate', ({ dataurl, landmark, words, sentences }) => {
      ws.send('remote.landmark.described', {
        agentID: store.get('remote.id'),
        landmark,
        words,
        sentences
      })

      // TODO: wait for server confirmation of the 'describer.validate' reception
      describer.destroy()
      nipple.enable()
    })
  })
}

export default {
  setup,
  waitForSlot: ws.once('setcolor', data => { setup(data.color) })
}
