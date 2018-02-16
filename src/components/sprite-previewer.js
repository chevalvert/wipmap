'use strict'

import store from 'store'
import prng from 'utils/prng'
import { aabb, center } from 'utils/aabb'
import distanceSquared from 'utils/distance-squared'

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
  }

  onresize () {
    this.resize([window.innerWidth * 0.4, window.innerWidth * 0.4])
    this.update({})
  }

  setSprite (spritesheet, spriteIndex, { length = 1, density = 1, order = 1 }) {
    this.spritesheet = spritesheet
    this.spriteIndex = spriteIndex
    this.modifiers = { length, density, order }
    this.update()
  }

  generateSpritesPoints () {
    prng.setSeed(this.seed)
    const vmin = Math.min(this.width, this.height)
    this.scale = vmin / store.get('config.agent').fov

    const res = this.spritesheet.resolution
    const radius = store.get('config.agent').fov / 2
    const round = map(this.modifiers.order, 0, 100, res, 1)
    const minDistance = map(this.modifiers.density, 0, 100, res * 2, res / 4)
    const maxDistance = minDistance * 2

    const poisson = new Poisson([radius * 2, radius * 2], minDistance, maxDistance, 10, prng.random)
    this.points = poisson.fill()
      .slice(0, this.modifiers.length)
      .filter(p => p)

    const box = aabb(this.points.map(p => [...p, res, res]))
    this.points = this.points
      .map(p => center(box)(p))
      .map(([x, y]) => ([x + res / 2, y + res / 2]))
      .filter(p => distanceSquared(p, [0, 0]) <= radius ** 2)
      .map(([x, y]) => {
        return [
          Math.ceil(x / round) * round,
          Math.ceil(y / round) * round
        ]
      })
      .sort((a, b) => a[1] - b[1])
  }

  update () {
    if (!this.spritesheet) return

    this.clear()
    this.context.imageSmoothingEnabled = false

    this.generateSpritesPoints()

    this.points.forEach(([x, y]) => {
      x = this.width / 2 + x * this.scale
      y = this.height / 2 + y * this.scale

      // Note: drawing the sprite from the bottom of its hitbox
      // y += (this.spritesheet.resolution / 2) * this.scale
      this.drawSprite(this.spritesheet.name, Math.floor(x), Math.floor(y), this.scale, this.spriteIndex)
    })
  }
}
