'use strict'

import LogScreen from 'components/log-screen'
import Emitter from 'tiny-emitter'

export default class MessageScreen extends LogScreen {
  constructor (title, message = '', duration, className) {
    super(title, message, `self-destructing-log-screen ${className}`)
    this.events = new Emitter()

    this.duration = duration
    this.time = duration
  }

  watch (event, cb) { this.events.on(event, cb) }
  watchOnce (event, cb) { this.events.once(event, cb) }
  unwatch (event, cb) { this.events.off(event, cb) }
  waitFor (event) {
    return new Promise(resolve => {
      this.events.once(event, resolve)
    })
  }

  didMount () {
    this.bindFuncs(['tick'])
    this.timer = setInterval(this.tick, 1000)
    this.update()
  }

  tick () {
    this.time--
    this.events.emit('tick', this.time)
    this.update()
  }

  say (text) {
    this.message = text
    this.update()
  }

  update () {
    if (this.mounted) this.refs.message.innerHTML = this.message.replace(/%s/g, this.time)

    if (this.time <= 0) {
      clearInterval(this.timer)
      this.events.emit('destroy')
      this.destroy()
    }
  }
}
