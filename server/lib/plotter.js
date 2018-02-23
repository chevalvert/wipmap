'use strict'

const path = require('path')

const Plotter = require('xy-plotter')
const Emitter = require('tiny-emitter')
const { clamp } = require('missing-math')
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

  let isIddle = true
  let position = [plotter.width / 2, plotter.height / 2]
  const init = plotter.Job('init').home().move(...position)

  if (opts.mock) mock(init)
  else {
    serial.on('job-start', job => {
      isIddle = false
      server.broadcast('job-start', job)
    })
    serial.on('job-end', job => {
      isIddle = true
      server.broadcast('job-end', job)
    })
    serial.on('job-progress', data => server.broadcast('job-progress', data))
    serial.send(init)
  }

  const api = {
    on: events.on.bind(events),
    once: events.once.bind(events),
    off: events.off.bind(events),

    get iddle () { return isIddle },
    get position () { return position },

    move: pathToJob('move', (job, line) => {
      const scale = getConfig().plotter.move.scale

      job.pen_up()
      line.forEach(([x, y]) => job.move(x * scale, y * scale))
    }),

    draw: pathToJob('draw', (job, lines) => {
      const scale = getConfig().plotter.draw.scale

      lines.forEach(line => {
        job.pen_up()
        line.forEach(([x, y]) => job.move(x * scale, y * scale).pen_down())
      })
    })
  }

  return api

  function pathToJob (name, jobCommands) {
    if (!isIddle) return
    return function (path) {
      if (!path || path.length === 0) return

      const job = plotter.Job(name)
      typeof jobCommands === 'function' && jobCommands(job, path)

      applyPosition(job)

      if (opts.mock) mock(job)
      else serial.send(job).catch(err => log.error(err))
    }
  }

  function applyPosition (job) {
    if (!job) return
    const moves = job.buffer.filter(cmd => ~cmd.indexOf('G1'))
    const lastMove = moves[moves.length - 1]
    if (lastMove) {
      const params = lastMove.split(' ')
      const x = parseFloat(params[1].split('X').pop())
      const y = parseFloat(params[2].split('Y').pop())
      position = [clamp(x, 0, plotter.width), clamp(y, 0, plotter.height)]
    }
  }

  function mock (job) {
    isIddle = false
    server.broadcast('job-start', job)
    Promise.all(
      job.buffer.map((cmd, index) => new Promise(resolve => setTimeout(() => {
        log.debug(`MOCK "${job.name}"`, cmd)
        server.broadcast('job-progress', { job, cmd, progress: { elapsed: index, total: job.buffer.length } })
        resolve()
      }, 300 * index)))
    )
    .then(() => {
      isIddle = true
      server.broadcast('job-end', job)
    })
    .catch(err => log.error(err))
  }
}
