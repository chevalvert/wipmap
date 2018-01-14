'use strict'

export default function (err) {
  const error = new LogScreen('Error', err, 'error')
  error.mount(document.body)
}
