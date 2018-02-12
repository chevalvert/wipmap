'use strict'

import L from 'loc'
import ws from 'utils/websocket'

import error from 'utils/error'
import loader from 'controllers/loader'
import LogScreen from 'components/log-screen'

import agents from 'controllers/agents'
import landmarks from 'controllers/landmarks'
import isGameOver from 'controllers/is-game-over'

import Map from 'components/map'
import Fog from 'components/fog'

import getUrlParam from 'utils/get-url-param'
import fps from 'fps-indicator'

function setup () {
  const loading = new LogScreen(L`loading`)
  Promise.resolve()
  .then(() => loading.mount(document.body))
  .then(() => loading.say(L`loading.sprites`))
  .then(() => loader.loadSprites())
  .then(() => loading.say(L`loading.map`))
  .then(() => {
    const x = getUrlParam('x') || 0
    const y = getUrlParam('y') || 0
    const f = getUrlParam('force')
    return loader.loadMap(x, y, f)
  })
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
  const fog = new Fog('white')

  map.mount(document.querySelector('.map'))
  fog.mount(document.querySelector('.map'))

  agents.setup()
  fps()

  ws.on('landmark.add', ({ sprite, agent, points }) => {
    points.forEach(([x, y]) => {
      landmarks.add({
        sprite,
        position: [agent.position[0] + x, agent.position[1] + y + sprite.spritesheet.resolution / 2]
      })
    })

    agents.resume(agent.id)

    // TODO: improve perf by redrawing only revelant map area
    map.update()

    isGameOver() && end()
  })
}

function end () {
  const endScreen = new LogScreen(L`gameover`)
  endScreen.mount(document.body)

  ws.off('landmark.add')

  // TODO: RESTful call for new map
}

export default { setup }
