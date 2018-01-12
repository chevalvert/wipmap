'use strict'

import store from 'utils/store'

import bel from 'bel'
import nipple from 'nipplejs'
import raf from 'raf'

import Emitter from 'tiny-emitter'
import DomComponent from 'abstractions/DomComponent'

export default class Nipple extends DomComponent {
  constructor (color = 'black') {
    super()
    this.color = color
    this.dirx = 0
    this.diry = 0

    this.events = new Emitter()
  }

  render () {
    return bel`<div class='nipple-component'></div>`
  }

  didMount () {
    this.bindFuncs(['onMove'])
    this.joystick = nipple.create({
      zone: this.refs.base,
      color: this.color,
      size: 200,
      mode: 'static',
      position: {top: '50%', left: '50%'}
    })

    this.joystick.on('start', () => { raf.add(this.onMove) })
    this.joystick.on('end', () => { raf.remove(this.onMove) })
    this.joystick.on('move', (_, data) => {
      // TODO: limit max speed
      const speed = data.force * 10
      this.dir = [
        Math.cos(data.angle.radian) * speed,
       -Math.sin(data.angle.radian) * speed
      ]
    })
  }

  watch (cb) { this.events.on('move', cb) }
  watchOnce (k, cb) { this.events.once('move', cb) }
  unwatch (cb) { this.events.off('move', cb) }

  onMove () {
    this.events.emit('move', {
      id: this.color,
      direction: this.dir
    })
  }
}
