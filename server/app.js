'use strict'

const path = require('path')
const fs = require('fs-extra')
const log = require(path.join(__dirname, 'lib', 'utils', 'log'))
const map = require(path.join(__dirname, 'lib', 'map'))
const args = require(path.join(__dirname, 'lib', 'args'))
const config = require(args.config)

const defaultOpts = {
  liveReload: false,
  dashboard: false
}

const remotes = {}
const viewers = []

module.exports = function (server, opts) {
  opts = Object.assign({}, defaultOpts, opts || {})

  const api = {
    get remotes () { return remotes },
    get viewers () { return viewers },

    handshake: ({ type }, client) => {
      client.type = type
      if (opts.dashboard) server.print()
      else log.debug('Connection', client.ip, client.uid, client.type)
      if (type === 'viewer') viewers.push(client)
      if (type === 'remote') {
        if (config.remotes.max > 0 && Object.keys(remotes).length >= config.remotes.max) {
          server.send('remote.slot.attributed', {}, client)
          return
        }
        registerRemote(client)
      }
    },

    resolveClientQuit: client => {
      if (opts.dashboard) server.print()
      else log.debug('Disconnection', client.ip, client.uid, client.type)

      if (~viewers.indexOf(client)) viewers.splice(viewers.indexOf(client), 1)
      if (remotes[client.uid]) {
        delete remotes[client.uid]
        server.broadcast('agents.list', Object.keys(remotes), viewers)
      }
    },

    // Decorate a promised action for RESTful calls
    rest: action => (req, res) => {
      action(req)
      .then(resp => res.json(resp))
      .catch(error => {
        log.error(error)
        res.json({ error: error.toString() })
      })
    },

    sendConfig: req => {
      if (!opts.liveReload) return Promise.resolve(config)
      return fs.readJson(args.config)
    },

    getAgent: req => new Promise((resolve, reject) => {
      server.once('agent.get.response', agent => resolve(agent || {}))
      server.broadcast('agent.get', { id: req.params.id }, viewers)
    }),

    createMap: req => new Promise((resolve, reject) => {
      Promise.resolve()
      .then(() => map.save()) // Save previously created map (skipped if first map)
      .then(() => map.create([req.params.x, req.params.y, req.params.force], req.body))
      .then(map => {
        server.broadcast('UID', { UID: map.uid })
        server.broadcast('landmark.add', { landmarksLength: map.landmarks.length })
        return Promise.resolve(map)
      })
      .then(resolve)
      .catch(reject)
    }),

    addLandmark: req => new Promise((resolve, reject) => {
      if (!req.body) reject(new Error('No POST body'))
      const landmark = map.addLandmark(req.body)
      server.broadcast('landmark.add', { ...landmark, landmarksLength: map.landmarks.length })
      resolve()
    })
  }

  return api

  function registerRemote (client) {
    remotes[client.uid] = client
    const color = config.remotes.colors[Math.floor(Math.random() * config.remotes.colors.length)]
    server.send('remote.slot.attributed', { id: client.uid, color }, client)
    setTimeout(() => {
      server.send('UID', { UID: map.uid }, client)
      server.send('landmark.add', { landmarksLength: map.landmarks.length }, client)
    }, 1000)
    server.broadcast('agents.list', Object.keys(remotes), viewers)
  }
}
