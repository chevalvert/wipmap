#!/usr/bin/env node
'use strict'

require('dotenv').config()
const ENV = process.env.NODE_ENV || 'production'

process.title = 'wipmap-server'

const path = require('path')
const opn = require('opn')
const args = require(path.join(__dirname, 'lib', 'utils', 'args'))
const log = require(path.join(__dirname, 'lib', 'utils', 'log'))
const Server = require(path.join(__dirname, 'lib', 'server'))

const getConfig = require(path.join(__dirname, 'lib', 'utils', 'get-config'))
console.log(getConfig())

const server = Server({
  public: path.join(__dirname, '..', 'build'),
  port: args.port
})

const app = require(path.join(__dirname, 'app'))(server, {
  liveReload: args.live,
  dashboard: ENV !== 'production'
})

server
// RESTful routing, available at /api/endpoint
.route('/config', app.rest(app.sendConfig), 'GET')
.route('/map/:x/:y/:force', app.rest(app.createMap), 'POST')
.route('/landmark', app.rest(app.addLandmark), 'POST')
// WebSocket events subscription
.watch({
  'client.quit': app.resolveClientQuit,
  handshake: app.handshake
})

if (args.plotter) {
  const plotter = require(path.join(__dirname, 'lib', 'plotter'))(server, {
    address: process.env.PLOTTER_COM_PORT
  })

  server
  .watch({
    'agent.move.line': plotter.move,
    'plotter.draw': plotter.draw
  })
  .route('/plotter/biome', (req, res) => app.rest(app.getCurrentBiome)(plotter.position, res), 'GET')
  .start()
  .then(url => log.info(`Server is listenning on ${url}`))
  .catch(err => log.error(err))
} else {
  server
  .watch({ 'agent.move': data => server.broadcast('agent.move', data, app.viewers) })
  .route('/agent/:id', app.rest(app.getAgent), 'GET')
  .start()
  .then(url => {
    log.info(`Server is listenning on ${url}`)
    if (args.open || args.fullscreen) {
      opn(url, { app: ['google chrome', args.fullscreen ? '--kiosk' : ''] })
    }
  }).catch(err => log.error(err))
}
