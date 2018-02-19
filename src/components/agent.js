'use strict'

import store from 'store'
import events from 'utils/events'

import Inertia from 'utils/inertia'
import inPolygon from 'point-in-polygon'
import { toMap } from 'utils/map-to-world'

import raf from 'raf'
import bel from 'bel'
import DomComponent from 'abstractions/DomComponent'

export default class Agent extends DomComponent {
  constructor (id, color, [x, y]) {
    super()
    this.id = id
    this.color = color
    this.x = x
    this.y = y

    this.ix = new Inertia(Object.assign({}, { value: this.x }, store.get('config.agent').inertia || {}))
    this.iy = new Inertia(Object.assign({}, { value: this.y }, store.get('config.agent').inertia || {}))

    console.log(`#agent-${this.id} has been created.`)
  }

  get props () {
    return {
      id: this.id,
      position: [this.x, this.y],
      normalizedPosition: toMap([this.x, this.y]),
      currentBiome: this.currentBiome()
    }
  }

  render () {
    const el = bel`
    <div class='agent' id='agent-${this.id}' style="--agent-color: ${this.color}"/>`
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

  pause () {
    this.paused = true
    this.addClass('is-paused')
  }

  resume () {
    this.paused = false
    this.removeClass('is-paused')
    this.ix.cancel()
    this.iy.cancel()
  }

  update () {
    if (this.paused) return

    this.ix.update()
    this.iy.update()
    if (!this.ix.stopped || !this.iy.stopped) {
      this.applyPosition(this.ix.value, this.iy.value)
    }
  }

  move ([dx, dy]) {
    const newx = this.x + dx
    const newy = this.y + dy
    this.resume()
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
    return x > 0 &&
      y > 0 &&
      x < store.get('width') &&
      y < store.get('height') &&
      !this.inForbiddenCell(x, y)
  }

  // This method is perf heavy, and should only use in async calls
  currentBiome () {
    const pos = toMap([this.x, this.y])
    const map = store.get('map.json')
    return map && map.biomes.find(biome => inPolygon(pos, biome.cell))
  }

  // This is faster than testing this.forbiddenCells.indexOf(this.currentBiome),
  // and can be used in raf calls
  inForbiddenCell (x, y) {
    if (!this.forbiddenCells || !this.forbiddenCells.length) return false

    const pos = toMap([x, y])
    return !!this.forbiddenCells.find(cell => inPolygon(pos, cell))
  }

  forbid (cells) {
    this.forbiddenCells = cells
    return this
  }
}
