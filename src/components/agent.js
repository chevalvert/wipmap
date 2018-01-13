'use strict'

import config from 'config'
import store from 'utils/store'
import events from 'utils/events'

import Inertia from 'utils/inertia'
import inPolygon from 'point-in-polygon'
import { toMap } from 'utils/map-to-world'

import raf from 'raf'
import bel from 'bel'
import DomComponent from 'abstractions/DomComponent'

export default class Agent extends DomComponent {
  constructor (id, [x, y]) {
    super()
    this.id = id
    this.color = id
    this.x = x
    this.y = y

    this.ix = new Inertia(Object.assign({}, { value: this.x }, config.agent.inertia || {}))
    this.iy = new Inertia(Object.assign({}, { value: this.y }, config.agent.inertia || {}))

    console.log(`#agent-${this.id} was created`)
  }

  render () {
    const el = bel`
    <div class='agent agent-${this.color}' id='agent-${this.id}'/>`
    return el
  }

  didMount () {
    super.didMount()
    this.bindFuncs(['update'])
    this.applyPosition(this.x, this.y)
    raf.add(this.update)
  }

  willUnmount () {
    raf.remove(this.update)
  }

  update () {
    this.ix.update()
    this.iy.update()
    this.applyPosition(this.ix.value, this.iy.value)
  }

  forbid (cells) {
    this.forbiddenCells = cells
    return this
  }

  move ([dx, dy]) {
    const x = this.x + dx
    const y = this.y + dy
    // TODO?: instead of stopping the agent, try to walk it around
    if (this.canMoveTo(x, y)) {
      this.ix.to(this.x + dx)
      this.iy.to(this.y + dy)
    }
    return this
  }

  applyPosition (x, y) {
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
