'use strict'

import parseURL from 'utils/parse-url'

const url = parseURL(window.devServer || window.location.hostname)

export default {
  address: url.hostname,
  port: 8888
}
