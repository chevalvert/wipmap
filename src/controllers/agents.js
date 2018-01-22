'use strict'

import config from 'config'
import store from 'utils/store'
import ws from 'utils/websocket'
import { toWorld } from 'utils/map-to-world'
import shuffle from 'utils/shuffle-array'

import landmarks from 'controllers/landmarks'

import Agent from 'components/agent'

let agents = []
let forbiddenCells
let startingPoints

function setup () {
  const wipmap = store.get('map.json')
  if (!wipmap) throw Error('map.json is undefined or null.')

  forbiddenCells = wipmap.biomes
    .filter(biome => config.agent.forbidden.includes(biome.type))
    .map(biome => biome.cell)

  startingPoints = shuffle(wipmap.biomes)
    .filter(biome => !biome.isBoundary && !config.agent.forbidden.includes(biome.type))
    .map(biome => biome.site)

  ws.on('agent.add', ({ id }) => { add(id) })
  ws.on('agent.remove', ({ id }) => { remove(id) })
  ws.on('agent.move', ({ id, direction }) => {
    const agent = agents[id] || add(id)
    agent.move(direction || [0, 0])
  })
}

function add (id) {
  if (!id) return
  if (agents[id]) return

  let start = toWorld(startingPoints[Object.keys(agents).length % startingPoints.length])

  // If an agent spawn in reach of an unfound landmark, destroy this landmark
  // NOTE: this may not work if several landmarks are in reach
  const landmark = landmarks.find(start, config.agent.fov / 2)
  landmark && landmarks.remove(landmark)

  agents[id] = new Agent(id, start).forbid(forbiddenCells)
  agents[id].mount(config.DOM.agentsWrapper)
  return agents[id]
}

function remove (id) {
  if (!id) return
  if (!agents[id]) return

  agents[id].destroy()
  delete agents[id]
}

function resume (id) {
  if (!id) return
  if (!agents[id]) return
  agents[id].resume()
}

export default {
  setup,
  add,
  remove,
  resume
}
