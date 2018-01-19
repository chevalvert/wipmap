'use strict'

import config from 'config'

import Emitter from 'tiny-emitter'
import ReconnectingWebSocket from 'reconnectingwebsocket'

const ws = new ReconnectingWebSocket(`ws://${config.server.address}:${config.server.port}`)
const events = new Emitter()

let connected = false

ws.onerror = function (err) {
  connected = false
  events.emit('error', err)
}

ws.onclose = function () {
  connected = false
  events.emit('close')
}

ws.onopen = function () {
  connected = true
  events.emit('open')
}

ws.onmessage = function (message) {
  const { event, data } = JSON.parse(message.data)
  events.emit(event, data)
}

export default {
  on: events.on.bind(events),
  once: events.once.bind(events),
  off: events.off.bind(events),

  get connected () { return connected },
  send: (event, data) => {
    if (connected) ws.send(JSON.stringify({ event, data }))
    else console.warn(`WS: cannot send('${event}'). Not connected`)
  },

  // Used for control flow in promises chain
  waitFor: event => new Promise ((resolve, reject) => {
    events.once(event, resolve)
  })
}
