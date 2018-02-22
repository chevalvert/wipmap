'use strict'

const path = require('path')
const fs = require('fs-extra')
const args = require(path.join(__dirname, 'args'))
const defaultConfig = require(path.join(__dirname, '..', '..', '..', 'wipmap.config.json'))

let config = getConfig()

function getConfig () {
  return args.config
  ? Object.assign({}, defaultConfig, fs.readJsonSync(args.config) || {})
  : defaultConfig
}

module.exports = () => args.live ? getConfig() : config
