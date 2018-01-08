'use strict'

const path = require('path')
const minimist = require('minimist')
const minimistOpts = {
  boolean: ['open', 'fullscreen'],
  alias: {
    open: ['o'],
    fullscreen: ['f']
  }
}

const argv = minimist(process.argv.slice(2), minimistOpts)

const args = {}
args.output = argv._[0] || path.join(process.cwd(), 'mapping.json')
Object.keys(minimistOpts.alias).forEach(key => {
  if (
  argv.hasOwnProperty(key) !== undefined && typeof argv[key] !== 'undefined'
  ) {
    args[key] = argv[key]
  }
})

module.exports = args
