#!/usr/bin/env node
'use strict'

process.title = 'wipmap-server'

const path = require('path')
const opn = require('opn')
const args = require(path.join(__dirname, 'lib', 'args'))
const log = require(path.join(__dirname, 'lib', 'utils', 'log'))
const config = require(args.config)
const Server = require(path.join(__dirname, 'lib', 'server'))

const ENV = process.env.NODE_ENV || 'production'

const server = Server({
  public: path.join(__dirname, '..', 'build'),
  port: args.port,
  wsTimeout: config.remotes.timeout
})

const app = require(path.join(__dirname, 'app'))(server, {
  liveReload: args.live,
  dashboard: ENV !== 'production'
})

server
// WebSocket actions subscription
.watch({
  'client.quit': app.resolveClientQuit,
  handshake: app.handshake,
  'agent.move': data => server.broadcast('agent.move', data, app.viewers)
})
// RESTful routing, available at /api/endpoint
.route('/config', app.rest(app.sendConfig), 'GET')
.route('/map/:x/:y/:force', app.rest(app.createMap), 'POST')
.route('/agent/:id', app.rest(app.getAgent), 'GET')
.route('/landmark', app.rest(app.addLandmark), 'POST')
.start()
.then(url => {
  log.info(`Server is listenning on ${url}`)
  if (args.open || args.fullscreen) {
    opn(url, { app: ['google chrome', args.fullscreen ? '--kiosk' : ''] })
  }
}).catch(err => log.error(err))
