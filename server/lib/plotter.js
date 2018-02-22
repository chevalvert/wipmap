'use strict'

const path = require('path')

const Plotter = require('xy-plotter')
const Emitter = require('tiny-emitter')
const log = require(path.join(__dirname, 'utils', 'log'))

const getConfig = require(path.join(__dirname, 'utils', 'get-config'))

const defaultOpts = {
  address: null,
  xy: {
    pen_positions: {
      up: 30,
      down: 0
    }
  },
  mock: false
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
  const init = plotter.Job('init').home().move(...position)

  if (opts.mock) mock(init)
  else {
    serial.on('job-start', job => server.broadcast('job-start', job))
    serial.on('job-end', job => server.broadcast('job-end', job))
    serial.on('job-progress', data => server.broadcast('job-progress', data))
    serial.send(init)
  }

  const api = {
    on: events.on.bind(events),
    once: events.once.bind(events),
    off: events.off.bind(events),

    get position () { return position },
    move: pathToJob('move', (job, line) => {
      const scale = getConfig()['plotter']['drawerScale']

      job.pen_up()
      line.forEach(([x, y], index) => {
        position = [x, y]
        job.move(x * scale, y * scale)
      })
    }),

    draw: pathToJob('draw', (job, lines) => {
      const scale = getConfig()['plotter']['drawerScale']

      job.pen_up()
      lines.forEach(line => {
        line.forEach(([x, y], index) => {
          position = [x, y]
          job.move(x * scale, y * scale)
          job.pen_down()
        })
      })
    })
  }

  return api

  function pathToJob (name, jobCommands) {
    return function (path) {
      if (!path || path.length === 0) return

      const job = plotter.Job(name)
      typeof jobCommands === 'function' && jobCommands(job, path)

      if (opts.mock) mock(job)
      else serial.send(job)
    }
  }

  function mock (job) {
    server.broadcast('job-start', job)
    Promise.all(
      job.buffer.map((cmd, index) => new Promise(resolve => setTimeout(() => {
        log.debug(`MOCK "${job.name}"`, cmd)
        server.broadcast('job-progress', { progress: { elapsed: index, total: job.buffer.length } })
        resolve()
      }, 300 * index)))
    )
    .then(() => server.broadcast('job-end', job))
    .catch(err => log.error(err))
  }
}
