'use strict'

const path = require('path')
const cuid = require('cuid')
const websocket = require('ws')
const express = require('express')
const Emitter = require('tiny-emitter')
const cors = require('cors')
const table = require('console.table') // eslint-disable-line no-unused-vars

const findFirstAvailableAddress = require(path.join(__dirname, 'utils', 'find-first-available-address'))

const defaultOpts = {
  port: 8888,
  public: path.join(process.cwd(), 'public')
}

module.exports = function WebServer (opts) {
  opts = Object.assign({}, defaultOpts, opts || {})

  const app = express()
  const router = express.Router()

  app.use(express.static(opts.public, { extensions: ['html'] }))
  app.use(express.json())
  app.use(cors({ credentials: true, origin: true }))
  app.use('/api', router)

  let server
  let wss
  let address
  const events = new Emitter()

  const api = {
    on: events.on.bind(events),
    once: events.once.bind(events),
    off: events.off.bind(events),

    get server () { return server },
    get clients () { return wss.clients },
    get wss () { return wss },

    print: () => {
      process.stdout.write('\x1B[2J\x1B[0f')
      const rows = []
      wss.clients.forEach(c => {
        rows.push({
          'IP': c.ip,
          'UID': c.uid,
          'Client type': c.type
        })
      })
      console.table(`Clients connected to ws://${address}:${opts.port}`, rows)
    },

    start: () => {
      return new Promise((resolve, reject) => {
        server = app.listen(opts.port, () => {
          address = findFirstAvailableAddress() || '127.0.0.1'

          resolve(`http://${address}:${opts.port}`)
        })

        wss = new websocket.Server({ server })
        wss.on('connection', (client, req) => {
          client.ip = req.connection.remoteAddress
          client.uid = cuid()
          events.emit('client', client)

          client.on('message', message => {
            const json = JSON.parse(message)
            events.emit(json.event, json.data, client)
          })

          client.on('error', err => {
            events.emit('error', err)
            if (err.code === 'ECONNRESET') events.emit('client.quit', client)
          })

          client.on('close', () => events.emit('client.quit', client))
        })

        wss.on('error', err => { events.emit('error', err) })
      })
    },

    route: (endpoint, cb, method = 'GET') => {
      if (method === 'GET') router.get(endpoint, cb)
      if (method === 'POST') router.post(endpoint, cb)
      else router.all(endpoint, cb)
      return api
    },

    watch: (actions = { eventName: function () {} }) => {
      Object.entries(actions)
      .forEach(([event, callback]) => events.on(event, callback))
      return api
    },

    findClientByIp: ip => Array.from(wss.clients).find(client => client.ip === ip),
    findClientByUid: uid => Array.from(wss.clients).find(client => client.uid === uid),

    broadcast,
    send: (event, data = {}, client = null) => {
      if (client) sendToClient(event, data, client)
      else broadcast(event, data)
    }
  }

  return api

  function broadcast (event, data, clients) {
    clients = clients || wss.clients
    clients.forEach(client => { sendToClient(event, data, client) })
  }

  function sendToClient (event, data, client) {
    if (client.readyState !== websocket.OPEN) return
    client.send(JSON.stringify({ event, data }))
  }
}
