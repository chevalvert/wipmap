'use strict'

import store from 'store'
import events from 'utils/events'

import Canvas from 'abstractions/Canvas'

export default class Fog extends Canvas {
  constructor (color) {
    super()
    this.color = color || '#F2F2F2'
    this.brush = store.get('spritesheet.brush')
  }

  didMount () {
    super.didMount()
    this.addClass('fog')

    this.bindFuncs(['clear', 'fillSize'])

    this.fillSize()
    window.addEventListener('resize', this.fillSize)
    events.on('fog.clear', ({ position }) => this.clear(position))
  }

  willUnmount () {
    window.removeEventListener('resize', this.fillSize)
  }

  fillSize () {
    this.resize([window.innerWidth, window.innerHeight])
  }

  applyContextStyle () {
    this.context.fillStyle = this.color
    this.context.fillRect(0, 0, this.width, this.height)

    this.smooth(false)
    this.context.globalCompositeOperation = 'destination-out'
  }

  onresize () {
    this.applyContextStyle()
  }

  clear ([x, y]) {
    // TODO: use a brush spritesheet with random sprite index to simulate
    this.context.drawImage(this.brush, x - this.brush.width / 2, y - this.brush.height / 2)
  }
}
