'use strict'

import config from 'config'
import prng from 'utils/prng'
import { map } from 'missing-math'
import Canvas from 'abstractions/Canvas'

export default class SpritePreviewer extends Canvas {
  constructor () {
    super()
    this.seed = Math.random()
  }

  didMount () {
    super.didMount()
    this.addClass('sprite-previewer')
  }

  onresize () {
    this.resize([window.innerWidth / 2, window.innerHeight])
    this.update({})
  }

  setSprite (spritesheet, spriteIndex, { length = 1, density = 1, order = 1 }) {
    this.spritesheet = spritesheet
    this.spriteIndex = spriteIndex
    this.modifiers = { length, density, order }
    this.update()
  }

  update () {
    if (!this.spritesheet) return

    this.clear()
    this.context.imageSmoothingEnabled = false

    prng.setSeed(this.seed)
    const vmin = Math.min(this.width, this.height)
    this.scale = vmin / config.agent.fov

    const radius = map(this.modifiers.density, 0, 100, 0, config.agent.fov / 2)
    const jitter = map(this.modifiers.order, 0, 100, config.agent.fov / this.spritesheet.resolution, 1)

    this.points = []
    for (let i = 0; i < this.modifiers.length; i++) {
      const theta = prng.random() * Math.PI * 2
      const r = prng.randomFloat(0, radius)
      const x = Math.floor((Math.cos(-theta) * r) / jitter) * jitter
      const y = Math.floor((Math.sin(-theta) * r) / jitter) * jitter

      this.points.push([x, y])
    }

    this.points.forEach(([x, y]) => {
      x = this.width / 2 + x * this.scale
      y = this.height / 2 + y * this.scale
      y += (this.spritesheet.resolution / 2) * this.scale
      this.drawSprite(this.spritesheet.name, Math.floor(x), Math.floor(y), this.scale, this.spriteIndex)
    })

    this.context.arc(this.width / 2, this.height / 2, vmin / 2, 0, Math.PI * 2)
    this.context.stroke()
  }
}
