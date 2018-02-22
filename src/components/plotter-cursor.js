'use strict'

import bel from 'bel'
import PathLerp from 'path-lerp'

import DomComponent from 'abstractions/DomComponent'

export default class PlotterCursor extends DomComponent {
  constructor (color = 'black', zoneComponent) {
    super()
    this.color = color
    this.zoneComponent = zoneComponent
  }

  render () {
    return bel`<div
    class='plotter-cursor'
    style='--plotter-cursor-color: ${this.color}'/>`
  }

  didMount () {
    this.hide()
    this.bindFuncs(['updateZone'])
    window.addEventListener('resize', this.updateZone)
  }

  willUnmount () {
    window.removeEventListener('resize', this.updateZone)
  }

  updateZone () {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.zone = this.zoneComponent && this.zoneComponent.refs.base.getBoundingClientRect()
  }

  begin (path) {
    this.updateZone()
    const flattenedPath = path.reduce((a, b) => a.concat(b), [])
    this.path = new PathLerp(flattenedPath.map(([x, y]) => ({x, y})))
    this.move(0)
    this.show()
  }

  move (percent) {
    const point = this.path.lerp(percent)
    if (!point) return

    const [x, y] = !this.zone
    ? [point.x, point.y]
    : [point.x + this.zone.left, point.y + this.zone.top]

    this.refs.base.style.transform = `translateX(${x}px) translateY(${y}px)`
  }

  end () { this.hide() }
}
