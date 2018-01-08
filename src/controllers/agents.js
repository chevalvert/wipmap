'use strict'

import config from 'config'
import store from 'utils/store'
import ws from 'utils/websocket'
import { toWorld } from 'utils/map-to-world'
import shuffle from 'utils/shuffle-array'

import Agent from 'components/agent'

let agents = []
let forbiddenCells
let startingPoints

function setup () {
  const wipmap = store.get('map.json')
  if (!wipmap) throw Error('map.json is undefined or null.')

  forbiddenCells = wipmap.biomes
    .filter(biome => config.forbidden.includes(biome.type))
    .map(biome => biome.cell)

  startingPoints = shuffle(wipmap.biomes)
    .filter(biome => !biome.isBoundary && !config.forbidden.includes(biome.type))
    .map(biome => biome.site)

  ws.on('agent.add', add)
  ws.on('agent.remove', remove)
  // ws.on('agent.move', ({ id, direction }) => {
  store.watch('debug.agent.move', ({ id, direction }) => {
    const agent = agents[id] || add(id)
    agent.move(direction)
  })
}

function add (id) {
  if (agents[id]) return

  const start = toWorld(startingPoints[Object.keys(agents).length % startingPoints.length])
  agents[id] = new Agent(id, start).forbid(forbiddenCells)
  agents[id].mount(config.DOM.agentsWrapper)
  return agents[id]
}

function remove (id) {
  if (!agents[id]) return

  agents[id].destroy()
  delete agents[id]
}

export default {
  setup,
  add,
  remove
}
