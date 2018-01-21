'use strict'

import 'whatwg-fetch'

export default (url, data) => fetch(url, {
  method: 'POST',
  body: JSON.stringify(data),
  headers: new Headers({ 'Content-Type': 'application/json' })
})
