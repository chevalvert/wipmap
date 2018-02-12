'use strict'

import bel from 'bel'
import noop from 'utils/noop'
import DomComponent from 'abstractions/DomComponent'

export default class Button extends DomComponent {
  constructor ({ value, color = 'black' }, onclick = noop) {
    super()
    this.value = value
    this.color = color
    this.onclick = onclick
  }

  render () {
    return bel`
    <button
    class='button'
    style='--color: ${this.color}'
    onclick=${e => !this.disabled && this.onclick(e)}>
      ${this.value}
    </button>`
  }

  enable () {
    this.disabled = false
    this.removeClass('is-disabled')
  }

  disable () {
    this.disabled = true
    this.addClass('is-disabled')
  }

  shake () {
    this.removeClass('is-shaking')
    this.repaint()
    this.addClass('is-shaking')
  }
}
