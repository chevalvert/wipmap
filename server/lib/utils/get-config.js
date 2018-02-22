'use strict'

const path = require('path')
const fs = require('fs-extra')
const objectAssignDeep = require('object-assign-deep')
const log = require(path.join(__dirname, 'log'))
const args = require(path.join(__dirname, 'args'))

const _DEFAULT_CONFIG_ = path.join(__dirname, '..', '..', '..', 'wipmap.config.json')

const defaultConfig = require(_DEFAULT_CONFIG_)
const config = getConfig()

function getConfig () {
  try {
    return objectAssignDeep.noMutate(defaultConfig, fs.readJsonSync(args.config || _DEFAULT_CONFIG_) || {})
  } catch (err) {
    log.error(err)
    return defaultConfig
  }
}

module.exports = () => args.live ? getConfig() : config
