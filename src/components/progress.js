'use strict'

import L from 'loc'
import bel from 'bel'
import config from 'config'
import DomComponent from 'abstractions/DomComponent'

export default class Progress extends DomComponent {
  constructor ({ value = 0, color = 'black' }) {
    super()
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
      ${this.refs.value}<span class='progress-total'>${config.gameover}</span>
    </div>`
  }

  get value () { return this._value }
  set value (v) {
    this._value = v
    if (this.mounted) this.refs.value.innerHTML = this._value
  }
}
