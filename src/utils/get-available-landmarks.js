'use strict'

import store from 'store'

export default function (biome) {
  if (!biome) return
  let landmarks = {}
  Object.entries(store.get('config.landmarks')).forEach(([uid, landmark]) => {
    if (!landmark.biomes.includes(biome.type)) return
    landmarks[uid] = landmark
  })
  return landmarks
}
