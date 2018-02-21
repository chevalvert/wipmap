'use strict'

import bel from 'bel'
import PathLerp from 'path-lerp'

import DomComponent from 'abstractions/DomComponent'

export default class PlotterCursor extends DomComponent {
  constructor (color = 'black') {
    super()
    this.color = color
  }

  render () {
    return bel`<div
    class='plotter-cursor'
    style='--plotter-cursor-color: ${this.color}'/>`
  }

  didMount () {
    this.hide()
  }

  begin (path) {
    const flattenedPath = path.reduce((a, b) => a.concat(b), [])
    this.path = new PathLerp(flattenedPath.map(([x, y]) => ({x, y})))
    this.move(0)
    this.show()
  }

  move (percent) {
    const point = this.path.lerp(percent)
    if (!point) return

    this.refs.base.style.left = point.x + 'px'
    this.refs.base.style.top = point.y + 'px'
  }

  end () { this.hide() }
}
