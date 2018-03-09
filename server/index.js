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
.route('/landmark', app.rest(app.addLandmark), 'POST')
// WebSocket events subscription
.watch({
  'client.quit': app.resolveClientQuit,
  handshake: app.handshake
})

if (args.plotter) {
  server
  .route('/map', app.rest(app.getMap), 'GET')
  .route('/plotter/move', (req, res) => { plotter.move(req.body); res.end() }, 'POST')
  .route('/plotter/draw', (req, res) => { plotter.draw(req.body); res.end() }, 'POST')
  .route('/plotter/iddle', (req, res) => res.json(plotter.iddle), 'GET')
  .route('/plotter/biome', (req, res) => app.rest(app.getCurrentBiome)(plotter.position, res), 'GET')
  .start()
  .then(url => log.info(`Server is listenning on ${url}`))
  .catch(err => log.error(err))

  const plotter = require(path.join(__dirname, 'lib', 'plotter'))(server, {
    address: process.env.PLOTTER_COM_PORT,
    mock: process.env.PLOTTER_MOCK,
    previewFile: process.env.PLOTTER_PREVIEW
  })

  app.getMap().then(plotter.init)
} else {
  server
  .watch({ 'agent.move': data => server.broadcast('agent.move', data, app.viewers) })
  .route('/map/:x/:y/:force', app.rest(app.createMap), 'POST')
  .route('/agent/:id', app.rest(app.getAgent), 'GET')
  .start()
  .then(url => {
    log.info(`Server is listenning on ${url}`)
    if (args.open || args.fullscreen) {
      opn(url, { app: ['google chrome', args.fullscreen ? '--kiosk' : ''] })
    }
  }).catch(err => log.error(err))
}
