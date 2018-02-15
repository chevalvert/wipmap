'use strict'

import 'whatwg-fetch'

/* global fetch Headers */

export default (url, data) => fetch(url, {
  method: 'POST',
  body: JSON.stringify(data),
  headers: new Headers({ 'Content-Type': 'application/json' })
})
