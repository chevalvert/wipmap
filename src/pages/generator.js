'use strict'

import config from 'config'

import error from 'utils/error'
import loader from 'controllers/loader'
import LogScreen from 'components/log-screen'

import prng from 'utils/prng'
import { validateJsonResponse } from 'utils/fetch-json'

import Map from 'components/map'

function setup () {
  const loading = new LogScreen('chargement')

  const url = `http://${config.server.address}:${config.server.port}/api/generate/0/0`
  const data = {
    width: 2,
    heigth: 2
  }

  Promise.resolve()
  .then(() => loading.mount(document.body))
  .then(() => loading.say('sprites'))
  .then(() => loader.loadSprites())
  .then(() => loading.destroy())
  .then(() => fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({ 'Content-Type': 'application/json' })
  }))
  .then(validateJsonResponse)
  .then(start)
  .catch(err => {
    console.error(err)
    loading.destroy()
    error(err)
  })
}

function start (json) {
  prng.setSeed(json.seed)

  const map = new Map(json)
  map.mount(config.DOM.mapWrapper)
}


export default { setup }
