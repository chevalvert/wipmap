'use strict'

import config from 'config'
import store from 'utils/store'
import events from 'utils/events'

import Canvas from 'abstractions/Canvas'

export default class Fog extends Canvas {
  constructor (color) {
    super()
    this.color = color || '#F2F2F2'
    this.brush = store.get('spritesheet_brush')
  }

  didMount () {
    super.didMount()
    this.bindFuncs(['clear'])

    this.resize([window.innerWidth, window.innerHeight])
    this.addClass('fog')

    this.context.fillStyle = this.color
    this.context.fillRect(0, 0, this.width, this.height)

    this.smooth(false)
    this.context.globalCompositeOperation = 'destination-out'

    events.on('fog.clear', ({ position }) => this.clear(position))
  }

  clear ([x, y]) {
    // TODO: use a brush spritesheet with random sprite index to simulate
    // blured noised moving radius
    // this.context.drawImage(this.brush, x - this.brush.width / 2, y - this.brush.height / 2)

    this.context.beginPath()
    this.context.arc(x, y, 50, 0, Math.PI * 2)
    this.context.fill()
  }
}
