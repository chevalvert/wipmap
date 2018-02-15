'use strict'

import bel from 'bel'
import drawSprite from 'utils/draw-sprite'
import getUrlParam from 'utils/get-url-param'

import DomComponent from 'abstractions/DomComponent'

export default class Canvas extends DomComponent {
  render () {
    this.scale = getUrlParam('scale') || 1
    const el = bel`<canvas></canvas>`
    return el
  }

  didMount () {
    this.bindFuncs(['onresize'])
    this.context = this.refs.base.getContext('2d')
    this.onresize()
    window.addEventListener('resize', this.onresize)
  }

  willUnmount () {
    window.removeEventListener('resize', this.onresize)
  }

  onresize () {}

  resize ([width, height], css = true) {
    this.width = width
    this.height = height
    this.refs.base.width = this.width
    this.refs.base.height = this.height
    if (css) {
      this.refs.base.style.width = this.width + 'px'
      this.refs.base.style.height = this.height + 'px'
    }
  }

  drawSprite (...args) {
    drawSprite(this.context, ...args)
  }

  smooth (v = true) {
    this.imageSmoothingEnabled = v
  }

  toDataURL () {
    return this.refs.base.toDataURL()
  }

  clear () {
    this.context.clearRect(0, 0, this.width, this.height)
  }
}
