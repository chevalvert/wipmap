'use strict'

import LogScreen from 'components/log-screen'

export default function (err) {
  err = err instanceof Error ? err : new Error(err)

  const error = new LogScreen(err.name, err.message, 'error')
  console.error(err)
  error.mount(document.body)
}
