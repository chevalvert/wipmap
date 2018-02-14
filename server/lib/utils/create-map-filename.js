'use strict'

const path = require('path')
module.exports = directory => ([x, y]) => path.join(directory, `${x}_${y}.json`)
