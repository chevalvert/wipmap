'use strict'

import config from 'config'
import store from 'utils/store'
import ws from 'utils/websocket'

import Navigo from 'navigo'
import viewer from 'pages/viewer'
import remote from 'pages/remote'

const router = new Navigo(null, false)
router.on({
  '/': viewer.setup,
  '/remote': remote.handshake,
  '/remote.html': remote.handshake
}).resolve();
