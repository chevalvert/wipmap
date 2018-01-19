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

function markAsFound ({ index, dataurl }) {
  if (!index) return
  if (!landmarks[index]) return
  landmarks[index].found = true

  // NOTE: possible perf bottleneck with manipulating landmarks
  // when a lot of them have dataurl. If so, use utils/store for dataurl
  // and reference an index in the landmark object
  landmarks[index].dataurl = dataurl
}

export default {
  set,
  find,
  markAsFound,
  filter: cb => Object.values(landmarks).filter(cb),
  forEach: cb => Object.entries(landmarks).forEach(([key, value]) => cb(value, parseInt(key)))
}
