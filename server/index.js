#!/usr/bin/env node
'use strict'

process.title = 'wipmap-server'

const path = require('path')
const fs = require('fs-extra')
const opn = require('opn')
const wipmap = require('wipmap-generate')
const args = require(__dirname + '/utils/config')
const Server = require(__dirname + '/utils/server')

const server = Server({
  public: path.join(__dirname, '..', 'build'),
  page: 'index.html'
})

const opts = {
  distortion: 1,
  gradient: 0,
  poissonDensity: 0.3,
  probablities: {
    water: 0.03,
    forest: 0.02
  },
  biomesMap: [
    ['TAIGA', 'JUNGLE', 'SWAMP'],
    ['TUNDRA', 'PLAINS', 'PLAINS'],
    ['TUNDRA', 'PLAINS', 'DESERT']
  ]
}

// RESTful routing, available at /api/endpoint
server.route('something/else', () => {})
server.route('/map/:x/:y/:force?*', (req, res) => {
  const file = path.join(__dirname, 'data', `${req.params.x}_${req.params.y}.json`)
  const mapExists = fs.pathExistsSync(file)

  if (mapExists && !req.params.force) res.json(fs.readJsonSync(file))
  else {
    const map = wipmap(req.params.x, req.params.y, opts)
    fs.outputJson(file, map, err => {
      if (err) throw err
      else res.json(map)
    })
  }
})

server.start().then(data => {
  console.log(`Server is listenning on ${data.url}`)
  args.open && opn(data.url + data.page, { app: ['google chrome', args.fullscreen ? '--kiosk' : '']} )
})

// Websocket routing
server.on('client', client => { console.log(client.ip) })
server.on('position', data => { console.log(data) })

setInterval(() => {
  const dx = Math.sin(Math.random() * Math.PI * 2)
  const dy = Math.sin(Math.random() * Math.PI * 2)
  server.broadcast('agent.move', { id: 'blue', direction: [dx, dy] })
}, 500)
