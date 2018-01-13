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
  public: path.join(__dirname, '..', 'build'),
  page: 'index.html'
})

const remotes = {}
const viewers = []
const availableRemotes = [...config.remotes]

// RESTful routing, available at /api/endpoint

server.route('/map/:x/:y/:force?*', (req, res) => {
  const file = path.join(__dirname, 'data', `${req.params.x}_${req.params.y}.json`)
  const mapExists = fs.pathExistsSync(file)

  if (mapExists && !req.params.force) res.json(fs.readJsonSync(file))
  else {
    const map = wipmap(req.params.x, req.params.y, config.wipmap)
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

server.on('client', client => { server.send('handshake', null, client) })
server.on('handshake', ({ type }, client) => {
  client.type = type

  server.print()

  if (type === 'viewer') viewers.push(client)
  if (type === 'remote') {
    const remote = remotes[client.ip] || availableRemotes.shift()
    if (remote) remotes[client.ip] = remote
    server.send('setcolor', { color: remote }, client)
    server.broadcast('agent.add', { id: remote }, viewers)
  }
})

server.on('client.quit', client => {
  server.print()
  if (~viewers.indexOf(client)) viewers.splice(viewers.indexOf(client), 1)
  if (remotes[client.ip]) {
    server.broadcast('agent.remove', { id: remotes[client.ip] }, viewers)
    availableRemotes.push(remotes[client.ip])
    delete remotes[client.ip]
  }
})

server.on('agent.move', data => {
  server.broadcast('agent.move', data, viewers)
})
