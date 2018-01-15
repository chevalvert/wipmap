'use strict'

import bel from 'bel'
import DomComponent from 'abstractions/DomComponent'

export default class Button extends DomComponent {
  constructor (value, onclick = function () {}) {
    super()
    this.value = value
    this.onclick = onclick
  }

  render () {
    return bel`
      <button
      class='button'
      onclick=${e => this.onclick(e)}>
        ${this.value}
      </button>`
  }
}
