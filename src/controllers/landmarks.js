'use strict'

import distSq from 'utils/distance-squared'
import { toWorld } from 'utils/map-to-world'

let landmarks = {}

const createLandmarkObject = ([x, y, type, biome], index) => ({
  index,
  type,
  biome,
  position: [x, y]
})

function set (landmarks_array) {
  landmarks_array.forEach((l, i) => {
    landmarks[i] = createLandmarkObject(l, i)
  })
}

function find (position, searchRadius) {
  return Object.values(landmarks).filter(l => !l.found).find(landmark => {
    const wp = toWorld(landmark.position)
    return distSq(position, wp) < searchRadius ** 2
  })
}

function markAsFound (index) {
  if (!landmarks[index]) return
  landmarks[index].found = true
}

export default {
  set,
  find,
  markAsFound,
  filter: cb => Object.values(landmarks).filter(cb),
  forEach: cb => Object.entries(landmarks).forEach(([key, value]) => cb(value, parseInt(key)))
}
