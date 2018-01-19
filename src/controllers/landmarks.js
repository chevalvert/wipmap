'use strict'

import prng from 'utils/prng'
import distSq from 'utils/distance-squared'
import { toWorld } from 'utils/map-to-world'

let landmarks = {}

const createLandmarkObject = (instance, [x, y, biome, type, seed], index) => ({
  instance,
  position: [x, y],
  biome,
  type,
  seed,
  index
})

function set (wipmap) {
  let i = 0
  Object.entries(wipmap.landmarks).forEach(([instance, instances]) => {
    const type = instance.split('-').shift()
    const seed = prng.random()
    instances.forEach(landmark => {
      landmarks[++i] = createLandmarkObject(instance, [...landmark, type, seed], i)
    })
  })
}

function find (position, searchRadius) {
  return Object.values(landmarks).filter(l => !l.found).find(landmark => {
    const wp = toWorld(landmark.position)
    return distSq(position, wp) < searchRadius ** 2
  })
}

function markAsFound ({ index, seed, dataurl }) {
  if (!index) return
  if (!landmarks[index]) return

  Object.values(landmarks)
  .filter(landmark => landmark.seed === seed)
  .forEach(landmark => {
    // Skip landmark already found, except if the index matches.
    // This condition solves potential conflicts when two remotes
    // are drawing a landmark at the same time.
    if (!!landmark.found && landmark.index !== index) return

    // NOTE: possible perf bottleneck with manipulating landmarks
    // when a lot of them have dataurl. If so, use utils/store for dataurl
    // and reference an index in the landmark object
    landmarks[landmark.index].dataurl = dataurl
    landmarks[landmark.index].found = true
  })
}

// This is used to solve conflicts, see controllers/agents.add
function remove ({ index }) {
  if (!index) return
  delete landmarks[index]
}

export default {
  get all () { return landmarks },
  set,
  find,
  markAsFound,
  remove,
  filter: cb => Object.values(landmarks).filter(cb),
  forEach: cb => Object.entries(landmarks).forEach(([key, value]) => cb(value, parseInt(key)))
}
