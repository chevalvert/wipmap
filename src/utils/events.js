'use strict'

import Emitter from 'tiny-emitter'

const events = new Emitter()
events.waitFor = event => new Promise ((resolve, reject) => {
  events.once(event, resolve)
})

export default events
