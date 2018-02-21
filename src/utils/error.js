'use strict'

import L from 'loc'
import LogScreen from 'components/log-screen'

export default function (err) {
  const error = new LogScreen(L`error`, err.toString(), 'error')
  console.error(err)
  error.mount(document.body)
}
