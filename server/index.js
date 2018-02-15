#!/usr/bin/env node
'use strict'

process.title = 'wipmap-server'

const path = require('path')
const opn = require('opn')
const args = require(path.join(__dirname, 'lib', 'args'))
const Server = require(path.join(__dirname, 'lib', 'server'))

const server = Server({
  public: path.join(__dirname, '..', 'build'),
  port: args.port
})

const app = require(path.join(__dirname, 'app'))(server, {
  verbose: true,
  liveReload: args.live
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
  console.log(`Server is listenning on ${url}`)
  if (args.open || args.fullscreen) {
    opn(url, { app: ['google chrome', args.fullscreen ? '--kiosk' : ''] })
  }
}).catch(err => console.log(err))
