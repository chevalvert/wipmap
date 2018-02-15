'use strict'

import store from 'store'
import landmarks from 'controllers/landmarks'

export default () => landmarks.length >= store.get('config.gameover').landmarksLength
