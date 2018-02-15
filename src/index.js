'use strict'

import L from 'loc'

import loader from 'controllers/loader'
import handshake from 'utils/handshake'

import Navigo from 'navigo'
import viewer from 'pages/viewer'
import remote from 'pages/remote'

import LogScreen from 'components/log-screen'

const loading = new LogScreen(L`loading`)

const hs = name => Promise.resolve()
  .then(() => loading.say(L`loading.config`))
  .then(loader.loadConfig)
  .then(() => loading.say(L`loading.connection`))
  .then(() => handshake(name))
  .then(() => loading.destroy())

loading.mount(document.body)

const router = new Navigo(null, false)
const routes = {
  '/': () => hs('viewer').then(viewer.setup),
  '/remote': () => hs('remote').then(remote.waitForSlot)
}

Object.entries(routes).forEach(([endpoint, callback]) => {
  routes[endpoint + '.html'] = callback
})

router.on(routes).resolve()
