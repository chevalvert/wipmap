'use strict'

import store from 'utils/store'
import events from 'utils/events'

import inPolygon from 'point-in-polygon'
import { toMap } from 'utils/map-to-world'

import bel from 'bel'
import DomComponent from 'abstractions/DomComponent'

export default class Agent extends DomComponent {
  constructor (id, [x, y]) {
    super()
    this.id = id
    this.color = id
    this.x = x
    this.y = y
    console.log(`#agent-${this.id} was created`)
  }

  render () {
    const el = bel`
    <div class='agent agent-${this.color}' id='agent-${this.id}'/>`
    return el
  }

  didMount() {
    super.didMount()
    this.translate(this.x, this.y)
  }

  forbid (cells) {
    this.forbiddenCells = cells
    return this
  }

  move ([dx, dy]) {
    const x = this.x + dx
    const y = this.y + dy
    this.canMoveTo(x, y) && this.translate(x, y)
    return this
  }

  translate (x, y) {
    this.x = x
    this.y = y
    this.refs.base.style.transform = `translateX(${x}px) translateY(${y}px)`
    events.emit('agent.move', {
      id: this.id,
      position: [this.x, this.y]
    })

  }

  canMoveTo (x, y) {
    return x > 0
      && y > 0
      && x < store.get('width')
      && y < store.get('height')
      && !this.inForbiddenCell(x, y)
  }

  inForbiddenCell (x, y) {
    const pos = toMap([x, y])
    return !!this.forbiddenCells.find(cell => inPolygon(pos, cell))
  }
}
