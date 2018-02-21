'use strict'

const path = require('path')
const fs = require('fs-extra')

const Plotter = require('xy-plotter')
const Emitter = require('tiny-emitter')

const args = require(path.join(__dirname, 'args'))
const config = require(args.config)

const defaultOpts = {
  address: null,
  xy: {
    pen_positions: {
      up: 30,
      down: 0
    }
  }
}

module.exports = function (server, opts) {
  opts = Object.assign({}, defaultOpts, opts || {})

  const events = new Emitter()
  const plotter = Plotter(opts.xy)
  const serial = plotter.Serial(opts.address, {
    verbose: true,
    progressBar: false,
    disconnectOnJobEnd: true
  })

  let position = [plotter.width / 2, plotter.height / 2]

  serial.on('job-start', job => server.broadcast('job-start', job))
  serial.on('job-end', job => server.broadcast('job-end', job))
  serial.on('job-progress', data => server.broadcast('job-progress', data))

  serial.send(plotter.Job('init').home().move(...position))

  const api = {
    on: events.on.bind(events),
    once: events.once.bind(events),
    off: events.off.bind(events),

    get position () { return position },
    move: line => {
      if (!line || line.length === 0) return

      const scale = (args.live ? fs.readJsonSync(args.config) : config)['plotter']['drawerScale']
      const job = plotter.Job('move')

      job.pen_up()
      line.forEach(([x, y]) => {
        position = [x, y]
        job.move(x * scale, y * scale)
      })

      serial.send(job)
    },

    draw: lines => {
      if (!lines || lines.length === 0) return

      const scale = (args.live ? fs.readJsonSync(args.config) : config)['plotter']['drawerScale']
      const job = plotter.Job('draw')

      lines.forEach(line => {
        job.pen_up()
        line.forEach(([x, y]) => {
          position = [x, y]
          job.move(x * scale, y * scale)
          job.pen_down()
        })
      })

      serial.send(job)
    }
  }

  return api
}
