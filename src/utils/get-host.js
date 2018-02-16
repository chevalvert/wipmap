'use strict'

// TODO: window.devServer = { address, port } instead of hardcoding IP
export default {
  address: window.isProduction ? window.location.hostname : '192.168.1.69',
  port: 8888
}
