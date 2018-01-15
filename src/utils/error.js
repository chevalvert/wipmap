'use strict'

import LogScreen from 'components/log-screen'

export default function (err) {
  const error = new LogScreen('Error', err.toString(), 'error')
  error.mount(document.body)
}
