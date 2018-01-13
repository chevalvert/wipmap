'use strict'

import ws from 'utils/websocket'

export default function handshake (type) {
  return new Promise((resolve, reject) => {
    // TODO: try to send several handshakes
    ws.once('handshake', () => {
      ws.send('handshake', { type })
      resolve()

      // NOTE: resend handshake when reconnecting after connlost
      ws.on('open', () => { ws.send('handshake', { type }) })
    })
  })
}
