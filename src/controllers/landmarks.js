'use strict'

let landmarks = []

function reset () {
  landmarks = []
}

function add ({ sprite, agent, points }) {
  landmarks.push({ sprite, points, position: agent.normalizedPosition })
  landmarks.sort((a, b) => a.position[1] - b.position[1])
}

export default {
  get all () { return landmarks },
  get length () { return landmarks.length },
  reset,
  add
}
