'use strict'

function validateJsonResponse (response) {
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }
  throw new TypeError(`Oops, we haven't got JSON!`)
}

export { validateJsonResponse }
export default (url) => new Promise((resolve, reject) => {
  fetch(url)
  .then(response => validateJsonResponse(response))
  .then(json => resolve(json))
  .catch(error => reject(error))
})
