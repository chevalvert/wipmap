'use strict'

import ws from 'utils/websocket'
import hs from 'utils/handshake'

import Message from 'components/message-screen'
import Nipple from 'components/nipple'

function handshake () {
  hs('remote').then(() => {
    ws.once('setcolor', data => { setup(data.color) })
  })
}

function setup (color) {
  if (!color) {
    const message = new Message('No slot available')
    message.mount(document.body)
    return
  }
  const nipple = new Nipple(color)
  nipple.mount(document.querySelector('.nipple-wrapper'))
  nipple.watch(data => { ws.send('agent.move', data) })
}

export default { setup, handshake }
