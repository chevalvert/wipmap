'use strict'

import L from 'loc'
import config from 'config'
import ws from 'utils/websocket'
import store from 'utils/store'
import events from 'utils/events'

import post from 'utils/post'

import error from 'utils/error'
import loader from 'controllers/loader'

import LogScreen from 'components/log-screen'
import Describer from 'components/describer'
import Nipple from 'components/nipple'

let nipple
let describer
let loading

function setup ({ id, color }) {
  if (!id) {
    const error = new LogScreen(L`error`, L`error.noslot`, 'error')
    error.mount(document.body)
    return
  }

  store.set('remote.id', id)
  store.set('remote.color', color)
  loading = new LogScreen( L`loading` )

  Promise.resolve()
  .then(() => loading.mount(document.body))
  .then(() => loading.say( L`loading.sprites` ))
  .then(() => loader.loadSprites())
  .then(() => start({ id, color }))
  .then(() => loading.destroy())
  .catch(err => {
    console.error(err)
    loading.destroy()
    error(err)
  })
}

function start ({ id, color }) {
  nipple = new Nipple(color)
  nipple.mount(document.querySelector('.nipple-wrapper'))
  nipple.watch(data => ws.send('agent.move', { direction: data.direction, id, color}))

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
  loading = new LogScreen( L`loading.sendingLandmark` )
  loading.mount(document.body)

  const data = {
    agentID: store.get('remote.id'),
    landmark,
    words,
    sentences
  }

  return new Promise ((resolve, reject) => {
    post(`http://${config.server.address}:${config.server.port}/api/landmark`, data)
    .then(res => {
      if (res.ok) resolve(res)
      else reject(res.statusText)
    })
  })
}

export default {
  setup,
  waitForSlot: ws.once('remote.slot.attributed', data => { setup(data) })
}

