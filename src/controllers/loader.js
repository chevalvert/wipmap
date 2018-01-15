'use strict'

import config from 'config'
import store from 'utils/store'

import fetchJSON from 'utils/fetch-json'

function loadSprites () {
  const spritesheets = Object.entries(config.spritesheets).map(([name, opts]) => new Promise((resolve, reject) => {
    const spritesheet = new Image()
    spritesheet.onload = function () {
      this.name = name
      this.resolution = opts.resolution
      this.length = opts.length || (this.width * this.height) / (opts.resolution ** 2)
      store.set(`spritesheet_${name}`, this)
      resolve()
    }
    spritesheet.onerror = function (err) { reject(err) }
    spritesheet.src = opts.src
  }))

  return Promise.all(spritesheets)
}

function loadMap (x, y, force = false) {
  const url = `http://${config.server.address}:${config.server.port}/api/map/${x}/${y}/`
    + (force ? '1' : '')
  return fetchJSON(url)
}

export default {
  loadSprites,
  loadMap
}
