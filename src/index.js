'use strict'

import config from 'config'
import store from 'utils/store'
import ws from 'utils/websocket'

import page from 'page'
import viewer from 'pages/viewer'
import remote from 'pages/remote'

// TODO: ws handshake ?

// TODO: make router work by lookin at :
// https://github.com/visionmedia/page.js/blob/master/examples/basic/index.html
// page('/', viewer.setup())
// page('/remote', () => {
  // remote.setup()
// })
