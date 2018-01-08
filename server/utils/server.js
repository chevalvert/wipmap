'use strict'

const fs = require('fs')
const path = require('path')
const websocket = require('ws')
const express = require('express')
const Emitter = require('tiny-emitter')
const cors = require('cors')
const findFirstAvailableAddress = require('./find-first-available-address')

const defaultOpts = {
  port: 8888,
  public: path.join(process.cwd(), 'public'),
  page: ''
}

module.exports = function WebServer (opts) {
  opts = Object.assign({}, defaultOpts, opts || {})

  const app = express()
  app.use(express.static(opts.public, { extensions: ['html'] }))

  const router = express.Router()
  app.use(cors({ credentials: true, origin: true }))
  app.use('/api', router)

  let server
  let wss
  const events = new Emitter()

  const api = {
    on: events.on.bind(events),
    once: events.once.bind(events),
    off: events.off.bind(events),

    get server () { return server },
    get wss () { return wss },

    start: () => {
      return new Promise((resolve, reject) => {
        server = app.listen(opts.port, () => {
          const address = findFirstAvailableAddress()

          resolve({
            url: `http://${address}:${opts.port}`,
            page: opts.page
          })
        })

        wss = new websocket.Server({ server })
        wss.on('connection', (client, req) => {
          client.ip = req.connection.remoteAddress
          events.emit('client', client)

          client.on('message', message => {
            const json = JSON.parse(message)
            events.emit(json.event, json.data, client)
          })

          client.on('error', err => {
            // TODO: handle err.code 'ECONNRESET' to emit client quit event
            events.emit('error', err)
          })
        })

        wss.on('error', err => { events.emit('error', err) })
      })
    },

    route: (endpoint, cb) => {
      router.get(endpoint, cb)
    },

    broadcast,
    send: (event, data, client = null) => {
      if (client) client.send(JSON.stringify({ event, data }))
      else broadcast(event, data)
    }
  }

  return api

  function broadcast (event, data) {
    wss.clients.forEach(client => {
      client.send(JSON.stringify({ event, data }))
    })
  }
}
