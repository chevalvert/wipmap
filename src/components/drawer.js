'use strict'

import config from 'config'
import store from 'utils/store'

import { map } from 'missing-math'
import bel from 'bel'
import raf from 'raf'
import Canvas from 'components/canvas'

import DomComponent from 'abstractions/DomComponent'

export default class Drawer extends DomComponent {
  constructor () {
    super()
    this.x = 0
    this.y = 0
    this.px = 0
    this.py = 0
    this.scale = 1
    this.history = []
  }

  render () {
    this.refs.canvas = this.registerComponent(Canvas)
    this.refs.canvas.onresize = () => {
      this.rect = this.refs.canvas.refs.base.getBoundingClientRect()
    }

    this.refs.spriteHolder = this.registerComponent(Canvas)
    this.refs.spriteHolder.onresize = function () {}

    return bel`
      <div class='drawer-wrapper'>
        ${this.refs.spriteHolder.raw()}
        ${this.refs.canvas.raw()}
      </div>
    `
  }

  didMount () {
    super.didMount()
    this.refs.canvas.addClass('drawer')
    this.refs.spriteHolder.addClass('drawer-spriteholder')
    this.bindFuncs(['update', 'beginDraw', 'endDraw', 'draw'])

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

    this.refs.base.removeEventListener('mousedown', this.beginDraw, false)
    this.refs.base.removeEventListener('mouseup', this.endDraw, false)
    this.refs.base.removeEventListener('mousemove', this.draw, false)
    this.refs.base.removeEventListener('mouseleave', this.endDraw)
    this.refs.base.removeEventListener('touchstart', this.beginDraw, false)
    this.refs.base.removeEventListener('touchend', this.endDraw, false)
    this.refs.base.removeEventListener('touchmove', this.draw, false)
  }

  setSprite (spritesheet, spriteIndex) {
    this.resolution = spritesheet.resolution

    this.refs.canvas.resize([this.resolution, this.resolution], false)
    this.refs.spriteHolder.resize([this.resolution, this.resolution], false)

    this.refs.canvas.smooth(false)
    this.refs.spriteHolder.smooth(false)
    this.refs.spriteHolder.drawSprite(spritesheet.name, this.resolution / 2, this.resolution / 2, 1, spriteIndex)
  }

  beginDraw (e) {
    this.stopPropagation(e)
    const [x, y] = this.getPosition(e)
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
    const [x, y] = this.getPosition(e)
    this.x = x
    this.y = y
  }

  pushHistoryState () {
    if (this.history.length >= config.drawer.maxHistoryStates) this.history.shift()
    this.history.push(this.refs.canvas.toDataURL())
  }

  getDataURL () {
    return new Promise ((resolve, reject) => {
      const img = new Image
      img.onload = () => {
        this.refs.spriteHolder.context.drawImage(img, 0, 0)
        resolve(this.refs.spriteHolder.toDataURL())
      }
      img.src = this.refs.canvas.toDataURL()
    })
  }

  undo () {
    if (!this.history.length) return

    const img = new Image
    img.onload = () => {
      this.refs.canvas.clear()
      this.refs.canvas.context.drawImage(img, 0, 0)
    }
    img.src = this.history.pop()
  }

  getPosition (e) {
    const rect = this.rect || this.refs.canvas.refs.base.getBoundingClientRect()
    const x = e.touches ? e.touches[0].clientX - rect.left : e.offsetX
    const y = e.touches ? e.touches[0].clientY - rect.top  : e.offsetY

    return [
      map(x, 0, rect.width, 0, this.resolution),
      map(y, 0, rect.height, 0, this.resolution)
    ].map(Math.floor)
  }

  stopPropagation (e) {
    e.target == this.refs.canvas.refs.base && e.preventDefault()
  }

  update () {
    if (!this.isDrawing) return
    if (this.x === this.px && this.y === this.py) return
    if (this.x < 0 || this.y < 0 || this.x > this.resolution || this.y > this.resolution) return

    // TODO?: lerp from [px, py] to [x, y] to draw plain lines
    this.refs.canvas.context.fillRect(this.x, this.y, 1, 1)
  }
}
