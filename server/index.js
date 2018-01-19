#!/usr/bin/env node
'use strict'

process.title = 'wipmap-server'

const path = require('path')
const fs = require('fs-extra')
const opn = require('opn')
const wipmap = require('wipmap-generate')
const args = require(__dirname + '/utils/config')
const Server = require(__dirname + '/utils/server')

const config = require(__dirname + '/../server.config.json')

const server = Server({
  public: path.join(__dirname, '..', 'build')
})

const remotes = {}
const viewers = []
const availableRemoteColors = [...config.remotes]

const findRemoteByColor = color => Object.values(remotes).find(r => r.color === color)
const attributeColorToRemoteByIP = ip => remotes.hasOwnProperty(ip) ? remotes[ip].color : availableRemoteColors.shift()

// RESTful routing, available at /api/endpoint

server.route('/map/:x/:y/:force?*', (req, res) => {
  const file = path.join(__dirname, 'data', `${req.params.x}_${req.params.y}.json`)
  const mapExists = fs.pathExistsSync(file)

  if (mapExists && !req.params.force) res.json(fs.readJsonSync(file))
  else {
    const map = wipmap(req.params.x, req.params.y, config.wipmap)
    fs.outputJson(file, map, err => {
      // TODO: send error
      if (err) throw err
      else res.json(map)
    })
  }
}, 'GET')

server.route('/generate/:x/:y', (req, res) => {
  // TODO: send error
  if (!req.body) return

  const opts = Object.assign({}, config.wipmap, req.body || {})
  const map = wipmap(req.params.x, req.params.y, opts)
  res.json(map)
}, 'POST')

server.route('/landmark', (req, res) => {
  // TODO: send eror
  if (!req.body) return

  // TODO: write landmark.dataurl in a png file
  server.broadcast('landmark.add', {
    agentID: req.body.agentID,
    landmark: req.body.landmark
  }, viewers)

  res.json(null)
}, 'POST')

// Websocket routing

server.on('client', client => { server.send('handshake', null, client) })
server.on('handshake', ({ type }, client) => {
  client.type = type
  server.print()

  if (type === 'viewer') viewers.push(client)
  if (type === 'remote') {
    const color = attributeColorToRemoteByIP(client.ip)
    if (color) remotes[client.ip] = { color, client: client }

    server.send('setcolor', { color }, client)
    server.broadcast('agent.add', { id: color }, viewers)
  }
})

server.on('client.quit', client => {
  server.print()
  if (~viewers.indexOf(client)) viewers.splice(viewers.indexOf(client), 1)
  if (remotes[client.ip]) {
    const color = remotes[client.ip].color
    server.broadcast('agent.remove', { id: color }, viewers)
    availableRemoteColors.push(color)
    delete remotes[client.ip]
  }
})

server.on('agent.move', data => { server.broadcast('agent.move', data, viewers) })

server.on('agent.landmark.found', ({ agentID, landmark }) => {
  const remote = findRemoteByColor(agentID)
  const cfg = config.wipmap.landmarks[landmark.type]
  if (remote && cfg) {
    server.send('remote.landmark.found', {
      landmark,
      wordsmap: cfg.wordsmap,
      sentences: config.sentences[Math.floor(Math.random() * config.sentences.length)]
    }, remote.client)
  }
})

// Starting server

server
.start()
.then(url => {
  console.log(`Server is listenning on ${url}`)
  if (args.open || args.fullscreen) {
    opn(url, { app: ['google chrome', args.fullscreen ? '--kiosk' : '']} )
  }
}).catch(err => console.log(err))
