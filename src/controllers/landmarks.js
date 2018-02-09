'use strict'

import prng from 'utils/prng'
import distSq from 'utils/distance-squared'
import { toWorld } from 'utils/map-to-world'

let landmarks = []

function reset () {
  landmarks = []
}

function add (landmark) {
  console.log(landmark)
  landmarks.push(landmark)
}

export default {
  get all () { return landmarks },
  get length () { return landmarks.length },
  reset,
  add
}
