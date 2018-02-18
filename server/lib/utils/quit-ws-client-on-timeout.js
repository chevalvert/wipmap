'use strict'

module.exports = function (client, timeoutDuration = 0) {
  if (timeoutDuration <= 0) return

  let lastPongReceived = Date.now()

  client._socket.on('data', data => {
    if (data[0] == 0x8a) { // eslint-disable-line eqeqeq
      lastPongReceived = Date.now()
    }
  })

  const pingTimer = setInterval(() => {
    if (Date.now() - lastPongReceived > timeoutDuration) {
      clearInterval(pingTimer)
      if (client._socket) client._socket.destroy()
    }
    if (client.readyState === 1) client.ping('.', false)
  }, 1000)
}
