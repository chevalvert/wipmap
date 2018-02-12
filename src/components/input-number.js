'use strict'

import bel from 'bel'
import noop from 'utils/noop'
import DomComponent from 'abstractions/DomComponent'
import Button from 'components/button'

import { lerp, clamp } from 'missing-math'

export default class InputNumber extends DomComponent {
  constructor ({ value, range = [0, 100], step = 1, color = 'black', prefix = '' }, onchange = noop) {
    super()
    this.step = step
    this.range = range.map(v => this.round(v))
    this.color = color
    this.prefix = prefix
    this.onchange = onchange

    this._value = this.round(value) || this.range[0]
  }

  render () {
    this.refs.value = bel`
    <button
    class='input-number-value'
    data-prefix='${this.prefix}'
    style='--color: ${this.color}'>
      ${this.value}
    </button>`

    this.refs.btns = [
      this.registerComponent(Button, { value: '-', color: this.color }, () => this.decrement()),
      this.registerComponent(Button, { value: '+', color: this.color }, () => this.increment())
    ]

    return bel`
    <div class='input-number'>
      ${this.refs.value}
      <div class='input-number-buttons'>
        ${this.refs.btns.map(b => b.raw())}
      </div>
    </div>`
  }

  round (v) { return Math.ceil(v / this.step) * this.step }

  get value () { return this._value }
  set value (v) {
    this._value = clamp(this.round(v), this.range[0], this.range[1])
    this.update()
    this.onchange(this.value)
  }

  didMount () { this.update() }

  update () {
    if (this.mounted) {
      this.refs.value.innerHTML = this.value
      this.refs.btns.forEach((btn, index) => {
        btn.enable()
        if (this.value === this.range[index]) btn.disable()
      })
    }
  }

  decrement () { this.value -= this.step }
  increment () { this.value += this.step }

  random () { this.value = lerp(this.range[0], this.range[1], Math.random()) }
}
