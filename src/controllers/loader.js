'use strict'

import store from 'store'
import host from 'utils/get-host'

import post from 'utils/post'
import fetchJSON from 'utils/fetch-json'
import validateJsonResponse from 'utils/validate-json-response'

/* global Image */

function loadConfig () {
  const url = `http://${host.address}:${host.port}/api/config`
  return fetchJSON(url).then(config => {
    Object.entries(config).forEach(([key, value]) => store.set(`config.` + key, value))
    return Promise.resolve()
  })
}

function loadSprites () {
  const spritesheets = Object.entries(store.get('config.spritesheets')).map(([name, opts]) => new Promise((resolve, reject) => {
    const spritesheet = new Image()
    spritesheet.onload = function () {
      this.name = name
      this.resolution = opts.resolution
      this.length = opts.length || (this.width * this.height) / (opts.resolution ** 2)
      store.set(`spritesheet.${name}`, this)
      resolve()
    }
    spritesheet.onerror = function (err) { reject(err) }
    spritesheet.src = `http://${host.address}:${host.port}/${opts.src}`
  }))

  return Promise.all(spritesheets)
}

function loadMap ([x, y, force = false], opts = {}) {
  const url = `http://${host.address}:${host.port}/api/map/${x}/${y}/${+force}`
  return post(url, opts).then(validateJsonResponse)
}

export default {
  loadConfig,
  loadSprites,
  loadMap
}
