'use strict'

import L from 'loc'
import store from 'store'
import host from 'utils/get-host'
import ws from 'utils/websocket'
import events from 'utils/events'

import fetchJSON from 'utils/fetch-json'
import post from 'utils/post'
import objectIsEmpty from 'utils/object-is-empty'

import error from 'utils/error'
import loader from 'controllers/loader'

import LogScreen from 'components/log-screen'
import LandmarkGenerator from 'components/landmark-generator'
import Progress from 'components/progress'
import Nipple from 'components/nipple'
import Button from 'components/button'

let nipple
let btnGenerate
let generator
let progress
let gameoverScreen

const SESSION = { id: null, color: null }

function setup ({ id: _id, color: _color }) {
  if (!_id) {
    error(L`error.noslot`)
    return
  }

  SESSION.id = store.set('remote.id', _id)
  SESSION.color = store.set('remote.color', _color)

  progress = new Progress({ color: SESSION.color })
  progress.mount(document.querySelector('.progress-wrapper'))

  ws.on('landmark.add', ({ landmarksLength }) => {
    progress.value = landmarksLength
    if (progress.value >= store.get('config.gameover').landmarksLength) {
      if (gameoverScreen) gameoverScreen.destroy()
      gameoverScreen = new LogScreen(L`gameover`, L`remote.gameover.message`)
      gameoverScreen.mount(document.body)
    }
  })

  ws.on('UID', ({ UID }) => {
    const el = document.querySelector('.map-infos > #uid')
    el.setAttribute('style', `--color: ${SESSION.color}`)
    el.innerHTML = UID
    if (gameoverScreen) gameoverScreen.destroy()
  })

  const loading = new LogScreen(L`loading`, L`remote.waiting-for-server`)
  Promise.resolve()
  .then(() => loading.mount(document.body))
  .then(() => ws.waitFor('UID'))
  .then(() => loading.say(L`loading.sprites`))
  .then(() => loader.loadSprites())
  .then(start)
  .then(() => loading.destroy())
  .catch(err => {
    console.error(err)
    loading.destroy()
    error(err)
  })
}

function start () {
  nipple = nipple || new Nipple(SESSION.color)
  nipple.mount(document.querySelector('.controls'))
  nipple.enable()

  btnGenerate = btnGenerate || new Button({ value: L`remote.buttons.generate`, color: SESSION.color }, generate)
  btnGenerate.disable()

  if (generator) generator.destroy()

  nipple.watch(data => {
    if (!data.direction) return

    btnGenerate.mount(document.querySelector('.button-wrapper'))
    document.querySelector('.button-wrapper').classList.add('is-mounted')
    btnGenerate.enable()

    // Trying to compress data to reduce transport payload
    const dx = Math.trunc(data.direction[0])
    const dy = Math.trunc(data.direction[1])
    ws.send('agent.move', [dx, dy, SESSION.id, SESSION.color])
  })
}

function generate () {
  const loading = new LogScreen(L`loading`, L`landmark-generator.getting`)
  Promise.resolve()
  .then(() => loading.mount(document.body))
  .then(() => fetchJSON(`http://${host.address}:${host.port}/api/agent/${SESSION.id}/`))
  .then(agent => {
    const landmarks = LandmarkGenerator.findAvailable(agent.currentBiome)
    if (!landmarks || objectIsEmpty(landmarks)) {
      btnGenerate.shake()
      btnGenerate.disable()
      loading.destroy()
      return Promise.resolve(null)
    }

    generator = new LandmarkGenerator(agent, landmarks)
    generator.mount(document.querySelector('.landmark-generator-wrapper'))

    nipple.disable()
    btnGenerate.disable()
  })
  .then(() => loading.destroy())
  .then(() => events.waitFor('landmark-generator.validate'))
  .then(send)
  .catch(err => {
    console.error(err)
    loading.destroy()
    error(err)
  })
}

function send (data) {
  if (!data) return start()

  const loading = new LogScreen(L`loading`, L`landmark-generator.sending`)
  Promise.resolve()
  .then(() => loading.mount(document.body))
  .then(() => new Promise((resolve, reject) => {
    post(`http://${host.address}:${host.port}/api/landmark`, data)
    .then(res => {
      if (res.ok) resolve(res)
      else reject(res.statusText)
    })
  }))
  .then(() => {
    loading.destroy()
    start()
  })
  .catch(err => {
    console.error(err)
    loading.destroy()
    error(err)
  })
}

export default {
  setup,
  waitForSlot: ws.once('remote.slot.attributed', data => { setup(data) })
}
