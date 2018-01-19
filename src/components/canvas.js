'use strict'

import store from 'utils/store'

import bel from 'bel'
import drawSprite from 'utils/draw-sprite'

import DomComponent from 'abstractions/DomComponent'

export default class Canvas extends DomComponent {
  render () {
    this.scale = store.get('scale')
    this.width = window.innerWidth * this.scale
    this.height = window.innerHeight * this.scale

    const el = bel`<canvas width='${this.width}' height='${this.height}'/>`
    el.style.width = this.width + 'px'
    el.style.height = this.height + 'px'

    return el
  }

  didMount () {
    this.context = this.refs.base.getContext('2d')
    this.bindFuncs(['onresize'])
    window.addEventListener('resize', this.onresize)
  }

  willUnmount () {
    window.removeEventListener('resize', this.onresize)
  }

  onresize () {
    this.resize([window.innerWidth * this.scale, window.innerHeight * this.scale])
  }

  resize ([width, height]) {
    this.width = width
    this.height = height
    this.refs.base.width = this.width
    this.refs.base.height = this.height
    this.refs.base.style.width = this.width + 'px'
    this.refs.base.style.height = this.height + 'px'
  }

  drawSprite (...args) {
    drawSprite(this.context, ...args)
  }

  toDataURL () {
    return this.refs.base.toDataURL()
  }

  clear () {
    this.context.clearRect(0, 0, this.width, this.height)
  }
}
