'use strict'

import store from 'store'
import ws from 'utils/websocket'
import { toWorld } from 'utils/map-to-world'
import shuffle from 'utils/array-shuffle'

import Agent from 'components/agent'

const agents = {}
let forbiddenCells
let startingPoints

function setup () {
  const wipmap = store.get('map.json')
  if (!wipmap) throw Error('map.json is undefined or null.')

  forbiddenCells = wipmap.biomes
    .filter(biome => store.get('config.agent').forbidden.includes(biome.type))
    .map(biome => biome.cell)

  startingPoints = shuffle(wipmap.biomes)
    .filter(biome => !biome.isBoundary && !store.get('config.agent').forbidden.includes(biome.type))
    .map(biome => biome.site)

  ws.on('agents.list', agentsID => {
    // This closure references agents by ID
    const currentAgents = Object.keys(agents)
    const agentsToRemove = currentAgents.filter(id => !agentsID.includes(id))

    agentsToRemove.forEach(id => remove(id))
  })

  // ws.on('agent.add', ({ id, color }) => add(id, color))
  ws.on('agent.remove', ({ id }) => remove(id))
  ws.on('agent.move', ([dx, dy, id, color]) => {
    const agent = get(id) || add(id, color)
    agent.move([dx, dy] || [0, 0])
  })

  ws.on('agent.get', ({ id }) => {
    const agent = get(id)
    if (agent) agent.pause()
    ws.send('agent.get.response', agent && agent.props)
  })
}

function add (id, color = 'black') {
  if (!id) return
  if (agents[id]) return

  const start = toWorld(startingPoints[Object.keys(agents).length % startingPoints.length])
  agents[id] = new Agent(id, color, start).forbid(forbiddenCells)
  agents[id].mount(document.querySelector('.agents'))
  return agents[id]
}

function removeAll () {
  Object.keys(agents).forEach(remove)
}

function get (id) {
  if (!id) return
  return agents[id]
}

function remove (id) {
  const agent = get(id)
  if (agent) {
    agent.destroy()
    delete agents[id]
  }
}

export default {
  get,
  setup,
  add,
  remove,
  removeAll
}
