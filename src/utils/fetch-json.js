'use strict'

import 'whatwg-fetch'
import validateJsonResponse from 'utils/validate-json-response'

/* global fetch */

export default url => new Promise((resolve, reject) => {
  fetch(url)
  .then(response => validateJsonResponse(response))
  .then(json => resolve(json))
  .catch(error => reject(error))
})
