'use strict'

import L from 'loc'
import LogScreen from 'components/log-screen'

export default function (err) {
  const error = new LogScreen(L`error`, err.toString(), 'error')
  error.mount(document.body)
}
