'use strict'

import raf from 'raf'
import Emitter from 'tiny-emitter'

import distSq from 'utils/distance-squared'
import Canvas from 'abstractions/Canvas'

const defaultOpts = {
  color: 'black',
  maxLines: -1,
  maxLength: -1,
  lineWidth: 10,
  lineCap: 'round',
  lineJoin: 'round'
}

export default class DrawableCanvas extends Canvas {
  constructor (opts) {
    super()
    this.opts = Object.assign({}, defaultOpts, opts || {})
    this.lines = []
    this.events = new Emitter()
  }

  watch (event, callback) { this.events.on(event, callback) }
  watchOnce (event, callback) { this.events.once(event, callback) }
  unwatch (event, callback) { this.events.off(event, callback) }

  applyContextStyle () {
    this.context.strokeStyle = this.opts.color
    this.context.lineWidth = this.opts.lineWidth
    this.context.lineCap = this.opts.lineCap
    this.context.lineJoin = this.opts.lineJoin
  }

  onresize () { this.applyContextStyle() }

  didMount () {
    super.didMount()
    this.addClass('drawable')
    this.bindFuncs(['update', 'beginDraw', 'endDraw', 'draw'])

    this.resize([window.innerWidth, window.innerHeight])
    raf.add(this.update)

    this.refs.base.addEventListener('mousedown', this.beginDraw, false)
    this.refs.base.addEventListener('mouseup', this.endDraw, false)
    this.refs.base.addEventListener('mouseleave', this.endDraw, false)
    this.refs.base.addEventListener('mousemove', this.draw, false)
    this.refs.base.addEventListener('touchstart', this.beginDraw, false)
    this.refs.base.addEventListener('touchend', this.endDraw, false)
    this.refs.base.addEventListener('touchmove', this.draw, false)
  }

  willUnmount () {
    super.willUnmount()
    raf.remove(this.update)

    this.refs.base.removeEventListener('mousedown', this.beginDraw, false)
    this.refs.base.removeEventListener('mouseup', this.endDraw, false)
    this.refs.base.removeEventListener('mouseleave', this.endDraw, false)
    this.refs.base.removeEventListener('mousemove', this.draw, false)
    this.refs.base.removeEventListener('touchstart', this.beginDraw, false)
    this.refs.base.removeEventListener('touchend', this.endDraw, false)
    this.refs.base.removeEventListener('touchmove', this.draw, false)
  }

  enable () {
    super.enable()
    this.events.emit('enable')
  }

  disable () {
    super.disable()
    this.events.emit('disable')
  }

  clear () {
    super.clear()
    this.lines = []
  }

  beginDraw (e) {
    if (this.disabled) return
    this.stopPropagation(e)

    this.isDrawing = true
    this.lines = this.lines || []
    this.lines.push([])
    this.trimLines(this.opts.maxLines)

    this.events.emit('beginDraw')
  }

  endDraw (e) {
    if (this.disabled) return
    this.stopPropagation(e)

    this.isDrawing = false
    this.events.emit('endDraw')
  }

  draw (e) {
    if (this.disabled) return
    this.stopPropagation(e)
    if (this.isDrawing) {
      window.requestAnimationFrame(() => {
        this.lastLine.push(this.getPosition(e))
        this.trimLength(this.opts.maxLength)
        this.events.emit('draw')
      })
    }
  }

  stopPropagation (e) {
    if (e.target === this.refs.base) e.preventDefault()
  }

  getPosition (e) {
    const rect = this.rect || this.refs.base.getBoundingClientRect()
    const x = e.touches ? e.touches[0].clientX - rect.left : e.offsetX
    const y = e.touches ? e.touches[0].clientY - rect.top : e.offsetY

    return [x, y]
  }

  trimLines (maxLinesLength) {
    if (maxLinesLength < 0) return
    if (this.lines.length > maxLinesLength) {
      this.lines.splice(0, this.lines.length - maxLinesLength)
    }
  }

  // WARNING: possible perf bottleneck
  trimLength (maxLength) {
    if (maxLength < 0) return
    const maxLengthSquared = maxLength ** 2

    while (this.lines.length > 0 && this.getLinesLengthSquared(this.lines) > maxLengthSquared) {
      this.lines[0].splice(0, 1)
      if (this.lines[0].length === 0) this.lines.splice(0, 1)
    }
  }

  getLinesLengthSquared (lines) {
    if (!lines) return

    return lines.reduce((length, line) => {
      return length + this.getLineLengthSquared(line)
    }, 0)
  }

  getLineLengthSquared (line) {
    if (!line || line.length === 0) return

    let [px, py] = line[0]
    return line.reduce((length, point) => {
      const d = distSq([px, py], point)
      ;[px, py] = point
      return length + d
    }, 0)
  }

  undo () {
    if (!this.lines) return
    this.lines.splice(-1, 1)
    this.update()
    this.events.emit('undo', this.lines.length)
  }

  update () {
    super.clear()
    this.lines.forEach(line => {
      if (!line || line.length === 0) return
      this.context.beginPath()
      line.forEach(([x, y], index) => {
        if (index === 0) this.context.moveTo(x, y)
        else this.context.lineTo(x, y)
      })
      this.context.stroke()
    })
  }

  set lastLine (l) { this.lines[this.lines.length - 1] = l }
  get lastLine () { return this.lines[this.lines.length - 1] }
}
