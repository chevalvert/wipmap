'use strict'

import L from 'loc'
import store from 'store'
import bel from 'bel'

import Emitter from 'tiny-emitter'
import DomComponent from 'abstractions/DomComponent'

export default class Progress extends DomComponent {
  constructor ({ value = 0, color = 'black' }) {
    super()
    this.events = new Emitter()

    this.value = value
    this.color = color
  }

  render () {
    this.refs.value = bel`<span class='progress-value'>${this.value}</span>`

    return bel`
    <div
    class='progress'
    data-name=${L`progress`}
    style='--color: ${this.color}'>
      ${this.refs.value}<span class='progress-total'>${store.get('config.gameover').landmarksLength}</span>
    </div>`
  }

  get value () { return this._value }
  set value (v) {
    this._value = v
    this.events.emit('change', this._value)
    if (this.mounted) this.refs.value.innerHTML = this._value
  }

  watch (cb) { this.events.on('change', cb) }
  watchOnce (k, cb) { this.events.once('change', cb) }
  unwatch (cb) { this.events.off('change', cb) }
}
