'use strict'

export default href => {
  const parser = document.createElement('a')
  parser.href = href
  return parser
}
