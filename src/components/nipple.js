'use strict'

import store from 'store'

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
      restOpacity: 1,
      position: { top: '50%', left: '50%' }
    })

    this.enable()

    this.joystick.on('start', () => { !this.disabled && raf.add(this.onMove) })
    this.joystick.on('end', () => { raf.remove(this.onMove) })
    this.joystick.on('move', (_, data) => {
      const speed = Math.min(data.force, 1) * store.get('config.agent').speed
      this.dir = [
        Math.cos(data.angle.radian) * speed,
        -Math.sin(data.angle.radian) * speed
      ]
    })
  }

  watch (cb) { this.events.on('move', cb) }
  watchOnce (cb) { this.events.once('move', cb) }
  unwatch (cb) { this.events.off('move', cb) }

  enable () {
    this.disabled = false
    this.removeClass('is-hidden')
  }

  disable () {
    this.disabled = true
    raf.remove(this.onMove)
    this.addClass('is-hidden')
  }

  onMove () {
    this.events.emit('move', { direction: this.dir })
  }
}
