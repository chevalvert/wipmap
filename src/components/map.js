'use strict'

import store from 'store'

import prng from 'utils/prng'
import { toWorld } from 'utils/map-to-world'

import landmarks from 'controllers/landmarks'
import Canvas from 'abstractions/Canvas'

const defaultOpts = {
  voronoi: false
}

export default class Map extends Canvas {
  constructor (json, opts) {
    super()
    this.opts = Object.assign({}, defaultOpts, opts || {})
    this.wipmap = json
    this.seed = json.seed
    store.set('map.json', json)
    this.updateBiomeSprites()
  }

  didMount () {
    super.didMount()
    this.addClass('map')

    this.bindFuncs(['fillSize'])
    this.fillSize()
    window.addEventListener('resize', this.fillSize)
  }

  willUnmount () {
    window.removeEventListener('resize', this.fillSize)
  }

  fillSize () {
    this.resize([window.innerWidth, window.innerHeight])
  }

  onresize () {
    store.set('width', this.width)
    store.set('height', this.height)

    this.update(true)
  }

  update (force = false) {
    prng.setSeed(this.seed)
    if (force) this.updateBiomeSprites()

    this.sprites = [...this.biomeSprites]
    landmarks.all.forEach(landmark => {
      const [x, y] = toWorld(landmark.position)
      landmark.points.forEach(([offx, offy]) => {
        this.sprites.push([
          landmark.sprite.name,
          x + offx,
          y + offy + landmark.sprite.spritesheet.resolution / 2,
          this.scale,
          landmark.sprite.index
        ])
      })
    })

    this.sprites.sort((a, b) => a[2] - b[2])
    this.draw()
  }

  draw () {
    this.clear()
    this.context.imageSmoothingEnabled = false
    if (this.opts.voronoi) this.drawVoronoi()

    this.sprites.forEach(sprite => this.drawSprite(...sprite))
  }

  updateBiomeSprites () {
    this.biomeSprites = []
    Object.entries(this.wipmap.points).forEach(([type, points]) => {
      const sprites = store.get('config.textures')[type]
      if (!store.get('config.textures')[type]) return

      points.forEach(point => {
        const [x, y] = toWorld(point)
        sprites.forEach(([name, probability, scale]) => {
          if (prng.random() < probability) {
            this.biomeSprites.push([name, x, y, scale || this.scale, prng.randomInt(0, 100)])
          }
        })
      })
    })
  }

  drawVoronoi (fill = false) {
    const colors = {
      'TAIGA': '#66CCFF',
      'JUNGLE': '#FF8000',
      'SWAMP': '#3C421E',
      'TUNDRA': '#800000',
      'PLAINS': '#80FF00',
      'FOREST': '#008040',
      'DESERT': 'yellow',
      'WATER': 'blue'
    }

    this.context.strokeStyle = 'red'
    this.wipmap.biomes.forEach(({ cell, type }) => {
      this.context.fillStyle = colors[type]
      this.context.beginPath()
      cell.forEach((point, index) => {
        const [x, y] = toWorld(point)
        if (index === 0) this.context.moveTo(x, y)
        else this.context.lineTo(x, y)
      })
      fill && this.context.closePath()
      fill && this.context.fill()
      this.context.stroke()
    })

    this.context.fillStyle = 'red'
    this.wipmap.biomes.forEach(({ site, type }) => {
      const [x, y] = toWorld(site)
      this.context.fillRect(x - 4, y - 4, 8, 8)
    })
  }
}
