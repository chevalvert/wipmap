'use strict'

import config from 'config'
import landmarks from 'controllers/landmarks'

export default () => landmarks.length >= config.gameover
