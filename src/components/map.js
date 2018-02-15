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
  }

  didMount () {
    super.didMount()
    this.addClass('map')
  }

  onresize () {
    this.resize([window.innerWidth, window.innerHeight])
    store.set('width', this.width)
    store.set('height', this.height)

    this.update()
  }

  update () {
    prng.setSeed(this.seed)
    this.clear()
    this.context.imageSmoothingEnabled = false

    this.opts.voronoi && this.drawDebug()

    // TODO: merge biome & landmark layers to avoid Z-order conflicts
    // between biome sprites and landmark sprites
    this.drawBiomePatterns()
    this.drawLandmarks()
  }

  drawBiomePatterns () {
    Object.entries(this.wipmap.points).forEach(([type, points]) => {
      points.forEach(point => {
        const [x, y] = toWorld(point)

        if (store.get('config.biomes')[type]) {
          // TODO: real density repartition calc instead of simple probability calc
          store.get('config.biomes')[type].forEach(item => {
            if (prng.random() < item[1]) {
              const itemScale = item[2] || 1
              this.drawSprite(item[0], x, y, this.scale * itemScale)
            }
          })
        }
      })
    })
  }

  drawLandmarks () {
    landmarks.all
    .forEach(landmark => {
      const [x, y] = toWorld(landmark.position)
      landmark.points.forEach(([offx, offy]) => {
        offy += landmark.sprite.spritesheet.resolution / 2
        this.drawSprite(landmark.sprite.name, x + offx, y + offy, this.scale, landmark.sprite.index)
      })
    })
  }

  drawDebug (fill = false) {
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
