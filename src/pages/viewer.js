'use strict'

import L from 'loc'
import config from 'config'
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
  const map = new Map(json)
  const fog = new Fog(config.fog.color)
  map.mount(document.querySelector('.map'))
  fog.mount(document.querySelector('.map'))

  agents.setup()
  if (!window.isProduction) fps()

  ws.on('landmark.add', ({ sprite, agent, points }) => {
    agents.resume(agent.id)
    landmarks.add({
      sprite,
      points,
      position: agent.normalizedPosition
    })

    // TODO: improve perf by redrawing only revelant map area
    map.update()
    if (isGameOver()) end()
  })
}

function end () {
  ws.off('landmark.add')
  agents.removeAll()

  const endScreen = new SelfDestructingLogScreen(L`gameover`, L`gameover.message`, config.secondsBeforeReboot, 'game-over-screen')

  Promise.resolve()
  .then(() => endScreen.mount(document.body))
  .then(() => endScreen.waitFor('destroy'))
  .then(setup)
  .catch(err => {
    console.log(err)
    endScreen.destroy()
    error(err)
  })
}

export default { setup }
