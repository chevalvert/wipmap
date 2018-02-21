'use strict'

import L from 'loc'
import store from 'store'

import error from 'utils/error'
import fetchJSON from 'utils/fetch-json'
import getAvailableLandmarks from 'utils/get-available-landmarks'
import host from 'utils/get-host'
import loading from 'utils/loading-wrapper'
import objectIsEmpty from 'utils/object-is-empty'
import post from 'utils/post'
import ws from 'utils/websocket'

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
  if (!_id) return error(L`error.noslot`)

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

  loading(L`loading`, [
    L`remote.waiting-for-server`,
    () => ws.waitFor('UID'),

    L`loading.sprites`,
    () => loader.loadSprites(),
    start
  ]).catch(error)
}

function start () {
  nipple = nipple || new Nipple(SESSION.color)
  nipple.mount(document.querySelector('.controls'))
  nipple.enable()

  btnGenerate = btnGenerate || new Button({ value: L`remote.buttons.generate`, color: SESSION.color }, generate)
  btnGenerate.show()
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
  loading(L`loading`, [
    L`landmark-generator.getting`,
    () => fetchJSON(`http://${host.address}:${host.port}/api/agent/${SESSION.id}/`),
    agent => {
      const landmarks = getAvailableLandmarks(agent.currentBiome)
      if (!landmarks || objectIsEmpty(landmarks)) {
        btnGenerate.shake()
        btnGenerate.disable()
        return Promise.resolve()
      }

      generator = new LandmarkGenerator(agent, landmarks, { color: SESSION.color })
      generator.mount(document.querySelector('.landmark-generator-wrapper'))

      nipple.disable()
      btnGenerate.disable()
      btnGenerate.hide()

      return Promise.resolve(generator)
    }
  ])
  .then(generator => generator ? generator.waitFor('validate') : Promise.resolve())
  .then(send)
  .catch(error)
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
  waitForSlot: () => ws.once('remote.slot.attributed', data => setup(data))
}
