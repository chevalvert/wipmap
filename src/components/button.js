'use strict'

import bel from 'bel'
import noop from 'utils/noop'
import lightness from 'lightness'
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
    style='--color: ${this.color}; --box-color: ${lightness(this.color, -10)}'
    onclick=${e => this.disabled ? this.shake() : this.onclick(e)}>
      ${this.value}
    </button>`
  }

  shake () {
    this.removeClass('is-shaking')
    this.repaint()
    this.addClass('is-shaking')
  }

  enable () {
    super.enable()
    this.removeClass('is-shaking')
  }
}
