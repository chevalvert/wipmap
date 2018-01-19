'use strict'

import store from 'utils/store'
import { map } from 'missing-math'

let mapSize = [0, 0]
let width = 0
let height = 0

store.watch('map.json', wipmap => { mapSize = [wipmap.width, wipmap.height] })
store.watch('width', w => { width = w })
store.watch('height', h => { height = h })

// Convert from normalized wipmap-generate coords to window coords
export function toWorld ([x, y]) {
  return [
    map(x, 0, mapSize[0], 0, width),
    map(y, 0, mapSize[1], 0, height)
  ]
}

// Convert from window coords to normalized wipmap-generate coords
export function toMap ([x, y]) {
  return [
    map(x, 0, width, 0, mapSize[0]),
    map(y, 0, height, 0, mapSize[1])
  ]
}
