'use strict'

import config from 'config'
import store from 'utils/store'

import raf from 'raf'
import Canvas from 'components/canvas'


export default class Drawer extends Canvas {
  constructor () {
    super()
    this.x = 0
    this.y = 0
    this.px = 0
    this.py = 0
    this.scale = 1
    this.history = []
  }

  didMount () {
    super.didMount()
    this.addClass('drawer')
    this.bindFuncs(['update', 'beginDraw', 'endDraw', 'draw'])

    this.context.imageSmoothingEnabled = false

    this.refs.base.addEventListener('mousedown', this.beginDraw, false)
    this.refs.base.addEventListener('mouseup', this.endDraw, false)
    this.refs.base.addEventListener('mousemove', this.draw, false)
    this.refs.base.addEventListener('mouseleave', this.endDraw)

    this.refs.base.addEventListener('touchstart', this.beginDraw, false)
    this.refs.base.addEventListener('touchend', this.endDraw, false)
    this.refs.base.addEventListener('touchmove', this.draw, false)

    raf.add(this.update)
  }

  willUnmount () {
    super.willUnmount()
    raf.remove(this.update)
  }

  onresize () {
    this.rect = this.refs.base.getBoundingClientRect()
  }

  pixelate ([x, y]) {
    return [
      Math.floor(x / this.scale) * this.scale,
      Math.floor(y / this.scale) * this.scale
    ]
  }

  setSprite (name, scale, spriteIndex) {
    // WIP
    this.scale = scale
    this.sprite = store.get(`spritesheet_${name}`)

    const [w, h] = this.pixelate([this.sprite.resolution * scale, this.sprite.resolution * scale])

    this.resize([w, h])
    this.context.imageSmoothingEnabled = false

    this.context.globalAlpha = 0.1
    this.drawSprite(name, w / 2, w / 2, scale, spriteIndex)
    this.context.globalAlpha = 1

  }

  beginDraw (e) {
    this.stopPropagation(e)
    const [x, y] = this.getTouchPos(e)
    this.x = x
    this.y = y
    this.isDrawing = true
    this.pushHistoryState()
  }

  endDraw (e) {
    this.stopPropagation(e)
    this.isDrawing = false
    this.px = this.x
    this.py = this.y
  }

  draw (e) {
    this.stopPropagation(e)
    const [x, y] = this.getTouchPos(e)
    this.x = x
    this.y = y
  }

  pushHistoryState () {
    if (this.history.length >= config.drawer.maxHistoryStates) this.history.shift()
    this.history.push(this.toDataURL())
  }

  undo () {
    if (!this.history.length) return

    const img = new Image
    img.src = this.history.pop()

    this.clear()
    const ctx = this.context
    img.onload = function () {
      ctx.drawImage(this, 0, 0)
    }
  }

  getTouchPos (e) {
    const rect = this.rect || this.refs.base.getBoundingClientRect()
    return e.touches
      ? this.pixelate([e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top])
      : this.pixelate([e.offsetX, e.offsetY])
  }

  stopPropagation (e) {
    e.target == this.refs.base && e.preventDefault()
  }

  update () {
    if (!this.isDrawing) return
    if (this.x === this.px && this.y === this.py) return

    // TODO?: lerp from [px, py] to [x, y] to draw plain lines
    this.context.fillRect(this.x, this.y, this.scale, this.scale)
  }
}
