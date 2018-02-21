'use strict'

import store from 'store'
import bel from 'bel'
import Emitter from 'tiny-emitter'

import normalizePath from 'utils/normalize-path'

import PlotterCursor from 'components/plotter-cursor'

import DomComponent from 'abstractions/DomComponent'
import DrawableCanvas from 'components/drawable-canvas'

export default class DrawToMove extends DomComponent {
  constructor (color = 'black') {
    super()
    this.color = color
    this.dirx = 0
    this.diry = 0

    this.events = new Emitter()
    this.line = []
  }

  watch (cb) { this.events.on('move', cb) }
  watchOnce (cb) { this.events.once('move', cb) }
  unwatch (cb) { this.events.off('move', cb) }

  render () {
    const color = this.color

    this.refs.drawer = this.registerComponent(DrawableCanvas, {
      color,
      maxLines: 1,
      maxLength: store.get('config.plotter').moverMaxLength
    })

    this.refs.cursor = this.registerComponent(PlotterCursor, color)

    return bel`
    <div class='draw-to-move'>
      ${this.refs.drawer.raw()}
      ${this.refs.cursor.raw()}
    </div>`
  }

  didMount () {
    this.bindFuncs(['onmove'])
    this.refs.drawer.watch('endDraw', this.onmove)
  }

  onmove () {
    const lines = this.refs.drawer.lines
    if (!lines || lines.length === 0) return

    const line = lines[0]
    if (!line || line.length === 0) return

    const normalizedLines = normalizePath(lines)
    const normalizedLine = normalizedLines[0]

    this.refs.cursor.begin([line])
    this.events.emit('move', normalizedLine.map(point => point.map((v, i) => v - normalizedLine[0][i])))
  }

  moveCursor (percent) {
    this.addClass('has-cursor')
    this.refs.cursor.move(percent)
  }

  endCursor () {
    this.removeClass('has-cursor')
    this.refs.cursor.end()
  }

  clear () { this.refs.drawer.clear() }

  enable () {
    super.enable()
    this.refs.drawer.enable()
  }

  disable () {
    super.disable()
    this.refs.drawer.disable()
  }
}
