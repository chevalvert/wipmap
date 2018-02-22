'use strict'

import L from 'loc'

import store from 'store'
import host from 'utils/get-host'
import ws from 'utils/websocket'
import fetchJSON from 'utils/fetch-json'
import objectIsEmpty from 'utils/object-is-empty'
import error from 'utils/error'
import loading from 'utils/loading-wrapper'
import getUrlParam from 'utils/get-url-param'
import getAvailableLandmarks from 'utils/get-available-landmarks'

import loader from 'controllers/loader'

import LogScreen from 'components/log-screen'
import LandmarkDrawer from 'components/landmark-drawer'
import Progress from 'components/progress'
import DrawToMove from 'components/draw-to-move'
import Button from 'components/button'

let control
let btnDraw
let drawer
let progress
let gameoverScreen

const x = getUrlParam('x') || '+'
const y = getUrlParam('y') || '0'
const f = getUrlParam('force')
const SESSION = { id: null, color: null }

function setup ({ id, color }) {
  if (!id) return error(L`error.noslot`)

  SESSION.id = id
  SESSION.color = color

  loading(L`loading`, [
    L`remote.initializing`,
    setupProgress,

    L`loading.waiting-for-server`,
    () => ws.waitFor('UID'),

    L`loading.sprites`,
    () => loader.loadSprites(),

    L`loading.map`,
    () => loader.loadMap([x, y, f]),
    json => setUID(json.uid),

    L`loading.waiting-for-plotter`,
    () => fetchJSON(`http://${host.address}:${host.port}/api/plotter/iddle`),
    iddle => (!iddle) && ws.waitFor('job-end'),

    start
  ])
  .catch(error)
}

function setupProgress () {
  progress = new Progress({ color: SESSION.color })
  progress.mount(document.querySelector('.progress-wrapper'))

  ws.on('landmark.add', ({ landmarksLength }) => {
    progress.value = landmarksLength
    if (progress.value >= store.get('config.gameover').landmarksLength) {
      if (gameoverScreen) gameoverScreen.destroy()
      gameoverScreen = new LogScreen(L`gameover`, L`gameover.message.remote`)
      gameoverScreen.mount(document.body)
    }
  })
}

function setUID (UID) {
  const el = document.querySelector('.map-infos > #uid')
  el.setAttribute('style', `--color: ${SESSION.color}`)
  el.innerHTML = UID
}

function start () {
  control = control || new DrawToMove(SESSION.color)
  control.mount(document.querySelector('.controls'))
  control.enable()
  control.show()

  btnDraw = btnDraw || new Button({ value: L`ui.draw`, color: SESSION.color }, draw)

  if (drawer) drawer.destroy()

  control.watch(line => {
    btnDraw.mount(document.querySelector('.button-wrapper'))
    document.querySelector('.button-wrapper').classList.add('is-mounted')
    btnDraw.disable()
    control.disable()

    ws.send('agent.move.line', line)
    ws.on('job-progress', ({ progress }) => {
      const percent = progress.elapsed / progress.total
      control.moveCursor(percent)
    })

    ws.once('job-end', () => {
      ws.off('job-progress')
      control.endCursor()
      control.clear()
      control.enable()
      btnDraw.show()
      btnDraw.enable()
    })
  })
}

function draw () {
  loading(L`loading`, [
    L`loading.fetching-plotter`,
    () => fetchJSON(`http://${host.address}:${host.port}/api/plotter/biome`),

    L`remote.landmark-generator.initializing`,
    biome => {
      const landmarks = getAvailableLandmarks(biome)
      if (!landmarks || objectIsEmpty(landmarks)) {
        btnDraw.shake()
        btnDraw.disable()
        loading.destroy()
        return Promise.resolve()
      }

      drawer = new LandmarkDrawer(biome, landmarks, { color: SESSION.color })
      drawer.mount(document.querySelector('.landmark-drawer-wrapper'))

      control.disable()
      btnDraw.disable()
      control.hide()
      btnDraw.hide()
      return Promise.resolve(drawer)
    }
  ])
  .then(drawer => drawer ? drawer.waitFor('validate') : Promise.resolve())
  .then(send)
  .catch(error)
}

function send (lines) {
  if (!lines) return start()

  drawer.disable()
  ws.send('plotter.draw', lines)

  ws.on('job-progress', ({ progress }) => {
    const percent = progress.elapsed / progress.total
    drawer.moveCursor(percent)
  })

  ws.once('job-end', () => {
    ws.off('job-progress')
    start()
  })
}

export default {
  waitForSlot: () => ws.once('remote.slot.attributed', data => setup(data))
}
