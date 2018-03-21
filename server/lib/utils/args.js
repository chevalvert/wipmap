'use strict'

const fs = require('fs-extra')
const path = require('path')
const minimist = require('minimist')
const minimistOpts = {
  boolean: [
    'fullscreen',
    'help',
    'live',
    'open',
    'plotter',
    'version'
  ],
  string: [
    'config',
    'data',
    'log',
    'log-level',
    'port',
    'landmark-packs'
  ],
  alias: {
    'log-level': [],
    'landmark-packs': [],
    config: ['c'],
    data: ['d'],
    fullscreen: ['f'],
    help: ['h'],
    live: ['l'],
    log: [],
    open: ['o'],
    plotter: [],
    port: ['p'],
    version: ['v']
  },
  default: {
    data: path.join(__dirname, '..', '..', 'data'),
    'log-level': 6,
    port: 8888
  }
}

const argv = minimist(process.argv.slice(2), minimistOpts)

if (argv.help) {
  console.log(fs.readFileSync(path.join(__dirname, '..', '..', 'USAGE'), 'utf-8'))
  process.exit(0)
}

if (argv.version) {
  const pckg = require(path.join(__dirname, '..', '..', '..', 'package.json'))
  console.log(pckg.version)
  process.exit(0)
}

const args = {}
Object.keys(minimistOpts.alias).forEach(key => {
  if (
  argv.hasOwnProperty(key) !== undefined && typeof argv[key] !== 'undefined'
  ) {
    args[key] = argv[key]
  }
})

module.exports = args
