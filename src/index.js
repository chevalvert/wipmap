'use strict'

import config from 'config'
import store from 'utils/store'
import ws from 'utils/websocket'
import handshake from 'utils/handshake'

import Navigo from 'navigo'
import viewer from 'pages/viewer'
import remote from 'pages/remote'
import generator from 'pages/generator'

const router = new Navigo(null, false)
router.on({
  '/': () => handshake('viewer').then(viewer.setup),

  '/remote': () => handshake('remote').then(remote.waitForSlot),
  '/remote.html': () => handshake('remote').then(remote.waitForSlot),

  '/generator': () => handshake('generator').then(generator.setup),
  '/generator.html': () => handshake('generator').then(generator.setup)
}).resolve()
