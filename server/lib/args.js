'use strict'

const fs = require('fs-extra')
const path = require('path')
const minimist = require('minimist')
const minimistOpts = {
  boolean: [
    'open',
    'fullscreen',
    'help',
    'version',
    'live'
  ],
  sring: ['port'],
  alias: {
    fullscreen: ['f'],
    help: ['h'],
    live: ['l'],
    open: ['o'],
    port: ['p'],
    version: ['v']
  },
  default: {
    port: 8888
  }
}

const argv = minimist(process.argv.slice(2), minimistOpts)

if (argv.help) {
  console.log(fs.readFileSync(path.join(__dirname, '..', 'usage.txt'), 'utf-8'))
  process.exit(0)
}

if (argv.version) {
  const pckg = require(path.join(__dirname, '..', '..', 'package.json'))
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
