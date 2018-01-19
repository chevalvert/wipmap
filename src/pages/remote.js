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
let describer
let loading

function setup (color) {
  if (!color) {
    const error = new LogScreen('Error', 'no slot available', 'error')
    error.mount(document.body)
    return
  }

  loading = new LogScreen('chargement')

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

  ws.on('remote.landmark.found', describe)
}

function describe ({ landmark, wordsmap, sentences }) {
  Promise.resolve()
  .then(() => {
    nipple.disable()
    describer = new Describer(landmark, wordsmap, sentences)
    describer.mount(config.DOM.describerWrapper)
  })
  .then(() => events.waitFor('describer.validate'))
  .then(send)
  .then(() => {
    describer.destroy()
    nipple.enable()
    loading.destroy()
  })
  .catch(err => {
    console.error(err)
    loading.destroy()
    error(err)
  })
}

function send ({ landmark, words, sentences })  {
  loading = new LogScreen('envoi')
  loading.mount(document.body)

  const data = {
    agentID: store.get('remote.id'),
    landmark,
    words,
    sentences
  }

  return new Promise ((resolve, reject) => {
    fetch(`http://${config.server.address}:${config.server.port}/api/landmark`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({ 'Content-Type': 'application/json' })
    }).then(res => {
      if (res.ok) resolve(res)
      else reject(res.statusText)
    })
  })
}

export default {
  setup,
  waitForSlot: ws.once('setcolor', data => { setup(data.color) })
}

