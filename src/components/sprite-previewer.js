'use strict'

import store from 'store'
import prng from 'utils/prng'
import { aabb, center } from 'utils/aabb'

import { map } from 'missing-math'
import Poisson from 'poisson-disk-sampling'

import Canvas from 'abstractions/Canvas'

export default class SpritePreviewer extends Canvas {
  constructor () {
    super()
    this.seed = Math.random()
  }

  didMount () {
    super.didMount()
    this.addClass('sprite-previewer')

    this.bindFuncs(['updateSize'])
    window.addEventListener('resize', this.updateSize)
    this.updateSize()
  }

  willUnmount () { window.removeEventListener('resize', this.updateSize) }
  updateSize () { this.resize([window.innerWidth * 0.5, window.innerWidth * 0.5]) }
  onresize () { this.update() }

  setSprite (spritesheet, spriteIndex, { length = 1, density = 1, order = 1 } = {}) {
    this.spritesheet = spritesheet
    this.spriteIndex = spriteIndex
    this.modifiers = { length, density, order }
    this.update()
  }

  generateSpritesPoints () {
    prng.setSeed(this.seed)
    const vmin = Math.min(this.width, this.height)
    const res = this.spritesheet.resolution
    const radius = store.get('config.agent').fov / 2
    const minDistance = map(this.modifiers.density, 0, 100, res / 2, res / 10)
    const maxDistance = minDistance * 2
    const round = map(this.modifiers.order, 0, 100, res / 2, 1)

    const poisson = new Poisson([radius * 2, radius * 2], minDistance, maxDistance, 10, prng.random)

    this.points = [poisson.addPoint([0, 0])]
    // WARNING: possible perf bottleneck
    while (this.points.length < this.modifiers.length) {
      const point = poisson.next()
      if (!point) break
      this.points.push(point)
    }

    const box = aabb(this.points.map(p => [...p, res, res]))
    this.scale = vmin / (radius * 2)

    this.points = this.points
      .map(p => center(box)(p))
      // NOTE: sprite tend to be bottom-heavy, so upping all of them to counterweight
      .map(([x, y]) => [x, y - res / 2])
      .map(p => p.map(v => Math.ceil(v / round) * round))
      .sort((a, b) => a[1] - b[1])
  }

  update () {
    if (!this.spritesheet) return

    this.clear()
    this.smooth(false)

    this.generateSpritesPoints()

    this.points.forEach(([x, y]) => {
      x = this.width / 2 + x * this.scale
      y = this.height / 2 + y * this.scale

      // NOTE: drawing the sprite from the bottom of its hitbox
      y += (this.spritesheet.resolution / 2) * this.scale
      this.drawSprite(this.spritesheet.name, Math.floor(x), Math.floor(y), this.scale, this.spriteIndex)
    })
  }
}
