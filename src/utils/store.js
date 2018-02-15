'use strict'

import Emitter from 'tiny-emitter'

const events = new Emitter()
const NS = '__STORE.'
const stored = {}

export default {
  watch (k, cb) {
    events.on(NS + k, cb)
  },
  watchOnce (k, cb) {
    events.once(NS + k, cb)
  },
  unwatch (k, cb) {
    events.off(NS + k, cb)
  },
  get (k) {
    return stored[k]
  },
  set (k, val) {
    stored[k] = val
    events.emit(NS + k, val)
    return val
  }
}
