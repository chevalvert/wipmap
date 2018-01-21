'use strict'

import L from 'loc'
import config from 'config'
import store from 'utils/store'
import ws from 'utils/websocket'
import handshake from 'utils/handshake'

import Navigo from 'navigo'
import viewer from 'pages/viewer'
import remote from 'pages/remote'
import generator from 'pages/generator'

import LogScreen from 'components/log-screen'

const loading = new LogScreen(L`loading`, L`loading.connection`)
const hs = name => handshake(name).then(() => loading.destroy())

loading.mount(document.body)

const router = new Navigo(null, false)
const routes = {
  '/': () => hs('viewer').then(viewer.setup),
  '/remote': () => hs('remote').then(remote.waitForSlot),
  '/generator': () => hs('generator').then(generator.setup)
}

Object.entries(routes).forEach(([endpoint, callback]) => {
  routes[endpoint + '.html'] = callback
})

router.on(routes).resolve()
