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

// RESTful routing, available at /api/endpoint

server.route('/map/:x/:y/:force?*', (req, res) => {
  const file = path.join(__dirname, 'data', 'maps', `${req.params.x}_${req.params.y}.json`)
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


server.route('/agent/:id', (req, res) => {
  server.once('agent.get.response', agent => res.json(agent || {}))
  server.broadcast('agent.get', { id : req.params.id }, viewers)
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

  server.broadcast('landmark.add', req.body, viewers)
  res.json(null)
}, 'POST')

// Websocket routing

server.on('client', client => { server.send('handshake', null, client) })
server.on('handshake', ({ type }, client) => {
  client.type = type
  server.print()

  if (type === 'viewer') viewers.push(client)
  if (type === 'remote') {
    if (Object.keys(remotes).length >= config.remotes.max) {
      server.send('remote.slot.attributed', {}, client)
      return
    }

    remotes[client.uid] = client
    const color = config.remotes.colors[Math.floor(Math.random() * config.remotes.colors.length)]
    server.send('remote.slot.attributed', { id: client.uid, color }, client)
    server.broadcast('agent.add', { id: client.uid, color }, viewers)
  }
})

server.on('client.quit', client => {
  server.print()
  if (~viewers.indexOf(client)) viewers.splice(viewers.indexOf(client), 1)
  if (remotes[client.uid]) {
    server.broadcast('agent.remove', { id: client.uid }, viewers)
    delete remotes[client.uid]
  }
})

server.on('agent.move', data => { server.broadcast('agent.move', data, viewers) })

// Starting server

server
.start()
.then(url => {
  console.log(`Server is listenning on ${url}`)
  if (args.open || args.fullscreen) {
    opn(url, { app: ['google chrome', args.fullscreen ? '--kiosk' : '']} )
  }
}).catch(err => console.log(err))
