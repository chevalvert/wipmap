'use strict'

import L from 'loc'
import store from 'store'
import ws from 'utils/websocket'

import error from 'utils/error'
import loader from 'controllers/loader'
import LogScreen from 'components/log-screen'
import SelfDestructingLogScreen from 'components/self-destructing-log-screen'

import agents from 'controllers/agents'
import landmarks from 'controllers/landmarks'
import isGameOver from 'controllers/is-game-over'

import Map from 'components/map'
import Fog from 'components/fog'

import getUrlParam from 'utils/get-url-param'

import fps from 'fps-indicator'

const x = getUrlParam('x') || '+'
const y = getUrlParam('y') || '0'
const f = getUrlParam('force')

let map
let fog

function setup () {
  const loading = new LogScreen(L`loading`)
  Promise.resolve()
  .then(() => loading.mount(document.body))
  .then(() => loading.say(L`loading.sprites`))
  .then(() => loader.loadSprites())
  .then(() => loading.say(L`loading.map`))
  .then(() => loader.loadMap([x, y, f]))
  .then(start)
  .then(() => loading.destroy())
  .catch(err => {
    console.error(err)
    loading.destroy()
    error(err)
  })
}

function start (json) {
  landmarks.reset()
  json.landmarks.forEach(landmarks.add)

  map = new Map(json)
  map.mount(document.querySelector('.map'))

  fog = new Fog(store.get('config.fog').color)
  if (store.get('config.fog').enable) fog.mount(document.querySelector('.map'))

  agents.setup()
  if (!window.isProduction) fps()

  ws.on('landmark.add', landmark => {
    landmarks.add(landmark)
    agents.resume(landmark.agent.id)
    map.update()
    if (isGameOver()) end()
  })
}

function end () {
  ws.off('landmark.add')
  agents.removeAll()

  const endScreen = new SelfDestructingLogScreen(L`gameover`, L`gameover.message`, store.get('config.gameover').duration, 'game-over-screen')

  Promise.resolve()
  .then(() => endScreen.mount(document.body))
  .then(() => endScreen.waitFor('destroy'))
  .then(() => {
    map.destroy()
    fog.destroy()
  })
  .then(setup)
  .catch(err => {
    console.log(err)
    endScreen.destroy()
    error(err)
  })
}

export default { setup }
