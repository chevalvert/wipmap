'use strict'

import L from 'loc'
import config from 'config'
import ws from 'utils/websocket'
import store from 'utils/store'
import events from 'utils/events'

import fetchJSON from 'utils/fetch-json'
import post from 'utils/post'
import objectIsEmpty from 'utils/object-is-empty'

import error from 'utils/error'
import loader from 'controllers/loader'

import LogScreen from 'components/log-screen'
import LandmarkGenerator from 'components/landmark-generator'
import Nipple from 'components/nipple'
import Button from 'components/button'

let nipple
let btnGenerate
let generator

function setup ({ id, color }) {
  if (!id) {
    const error = new LogScreen(L`error`, L`error.noslot`, 'error')
    error.mount(document.body)
    return
  }

  store.set('remote.id', id)
  store.set('remote.color', color)

  const loading = new LogScreen(L`loading`, L`loading.sprites`)

  Promise.resolve()
  .then(() => loading.mount(document.body))
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
  btnGenerate = new Button(L`remote.buttons.generate`, () => generate(id))

  nipple = new Nipple(color)
  nipple.mount(document.querySelector('.controls'))
  nipple.watch(data => {
    !btnGenerate.mounted && btnGenerate.mount(document.querySelector('.controls'))

    if (!data.direction) return

    // Trying to compress data to reduce transport payload
    const dx = Math.trunc(data.direction[0])
    const dy = Math.trunc(data.direction[1])
    ws.send('agent.move', [dx, dy, id, color])
  })
}

function generate (id) {
  nipple.disable()
  btnGenerate.disable()

  const loading = new LogScreen(L`loading`, L`landmark-generator.getting`)

  Promise.resolve()
  .then(() => loading.mount(document.body))
  .then(() => fetchJSON(`http://${config.server.address}:${config.server.port}/api/agent/${id}/`))
  .then(agent => {
    const landmarks = LandmarkGenerator.findAvailable(agent.currentBiome)
    if (objectIsEmpty(landmarks)) {
      // WIP
      // btnGenerate.shake()
      // return Promise.resolve()
    }

    generator = new LandmarkGenerator(agent, landmarks)
    generator.mount(document.querySelector('.landmark-generator-wrapper'))
    loading.destroy()
    return events.waitFor('landmark-generator.validate')
  })
  .then(send)
  .catch(err => {
    console.error(err)
    loading.destroy()
    error(err)
  })
}

function send (data) {
  const loading = new LogScreen(L`loading`, L`landmark-generator.sending`)

  Promise.resolve()
  .then(() => loading.mount(document.body))
  .then(() => {
    return new Promise((resolve, reject) => {
      post(`http://${config.server.address}:${config.server.port}/api/landmark`, data)
      .then(res => {
        if (res.ok) resolve(res)
        else reject(res.statusText)
      })
    })
  })
  .then(() => {
    nipple.enable()
    btnGenerate.enable()
  })
  .then(() => loading.destroy())
  .catch(err => {
    console.error(err)
    loading.destroy()
    error(err)
  })

  generator.destroy()
}

export default {
  setup,
  waitForSlot: ws.once('remote.slot.attributed', data => { setup(data) })
}
