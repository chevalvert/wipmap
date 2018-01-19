'use strict'

import config from 'config'
import store from 'utils/store'
import events from 'utils/events'
import ws from 'utils/websocket'

import Inertia from 'utils/inertia'
import inPolygon from 'point-in-polygon'
import { toMap } from 'utils/map-to-world'
import landmarks from 'controllers/landmarks'

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

  onfound (landmark) {
    this.pause()
    ws.send('agent.landmark.found', { agentID: this.id, landmark })
  }

  pause () { this.paused = true }

  resume () {
    this.paused = false
    this.ix.cancel()
    this.iy.cancel()
  }

  update () {
    if (this.paused) return

    this.ix.update()
    this.iy.update()
    if (!this.ix.stopped || !this.iy.stopped) {
      this.applyPosition(this.ix.value, this.iy.value)
      const landmark = landmarks.find([this.x, this.y], config.agent.fov / 2)
      if (landmark) this.onfound(landmark)
    }
  }

  move ([dx, dy]) {
    const newx = this.x + dx
    const newy = this.y + dy
    this.canMoveTo(newx, this.y) && this.ix.to(newx)
    this.canMoveTo(this.x, newy) && this.iy.to(newy)
    return this
  }

  applyPosition (x, y) {
    this.x = x
    this.y = y
    this.refs.base.style.transform = `translateX(${x}px) translateY(${y}px)`

    events.emit('fog.clear', { position: [this.x, this.y] })
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

  forbid (cells) {
    this.forbiddenCells = cells
    return this
  }
}
