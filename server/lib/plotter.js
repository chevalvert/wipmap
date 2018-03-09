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
  mock: false,
  previewFile: null
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
  let position = [0, 0]

  serial.on('job-start', job => {
    isIddle = false
    server.broadcast('job-start', job)
  })

  serial.on('job-end', job => {
    isIddle = true
    server.broadcast('job-end', job)
  })

  serial.on('job-progress', data => server.broadcast('job-progress', data))

  const api = {
    on: events.on.bind(events),
    once: events.once.bind(events),
    off: events.off.bind(events),

    get iddle () { return isIddle },
    get position () { return position },

    init: map => {
      const signature = getConfig().plotter.signature
      const job = plotter.Job('init')

      job.home()
      if (signature.enable) job.text(signature.prefix + map.uid, 0, plotter.height, signature)
      job.pen_up()
      job.move(plotter.width / 2, plotter.height / 2)

      applyPosition(job)

      if (opts.mock) mock(job)
      else serial.send(job).catch(err => log.error(err))
    },

    move: pathToJob('move', (job, line) => {
      const config = getConfig().plotter.move

      job.pen_up()
      job.setSpeed(config.speed > 0 ? config.speed : null)
      line.forEach(([x, y]) => job.move(x * config.scale, y * config.scale))
    }),

    draw: pathToJob('draw', (job, lines) => {
      const config = getConfig().plotter.draw

      job.setSpeed(config.speed > 0 ? config.speed : null)
      lines.forEach(line => {
        job.pen_up()
        line.forEach(([x, y]) => job.move(x * config.scale, y * config.scale).pen_down())
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
    server.broadcast('job-start', { job })
    Promise.all(
      job.buffer.map((cmd, index) => new Promise(resolve => setTimeout(() => {
        log.debug(`MOCK "${job.name}"`, cmd)
        server.broadcast('job-progress', { job, cmd, progress: { elapsed: index, total: job.buffer.length } })
        resolve()
      }, 10 * index)))
    )
    .then(() => {
      isIddle = true
      server.broadcast('job-end', { job })
      if (opts.previewFile) plotter.File().export(job, opts.previewFile)
    })
    .catch(err => log.error(err))
  }
}
