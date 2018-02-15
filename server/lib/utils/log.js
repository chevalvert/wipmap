'use strict'

const path = require('path')
const fs = require('fs-extra')
const args = require(path.join(__dirname, '..', '..', 'lib', 'args'))
const Log = require('log')

const stream = args.log
  ? fs.createWriteStream(args.log)
  : null
const logLevel = isNaN(args['log-level'])
  ? args['log-level']
  : parseInt(args['log-level'])

module.exports = new Log(logLevel, stream)
