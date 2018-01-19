'use strict'

import config from 'config'
import landmarks from 'controllers/landmarks'

export default () => {
  const found = landmarks.filter(l => l.found)
  if (!found) return false

  return found.length >= landmarks.length * config.gameover
}
