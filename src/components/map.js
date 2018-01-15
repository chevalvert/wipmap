'use strict'

import config from 'config'
import store from 'utils/store'

import prng from 'utils/prng'
import { toWorld } from 'utils/map-to-world'

import Canvas from 'components/canvas'

export default class Map extends Canvas {
  constructor (json) {
    super()
    this.wipmap = json
    store.set('map.json', json)
  }

  didMount () {
    super.didMount()
    this.addClass('map')
    this.onresize()
  }

  onresize () {
    super.onresize()
    store.set('width', this.width)
    store.set('height', this.height)
    this.update()
  }

  update () {
    this.context.imageSmoothingEnabled = false
    // this.draw_debug()
    this.draw_biomePatterns()
    this.draw_debug_landmarks(true)
  }

  draw_biomePatterns () {
    Object.entries(this.wipmap.points).forEach(([type, points]) => {
      points.forEach(point => {
        const [x, y] = toWorld(point)

        if (config.biomes[type]) {
          // TODO: real density repartition calc instead of simple probability calc
          config.biomes[type].forEach(item => {
            if (prng.random() < item[1]) {
              const itemScale = item[2] || 1
              this.drawSprite(item[0], x, y, this.scale * itemScale)
              return
            }
          })
        }
      })
    })
  }

  draw_debug (fill = false) {
    const colors = {
      'TAIGA' : '#66CCFF',
      'JUNGLE' : '#FF8000',
      'SWAMP' : '#3C421E',
      'TUNDRA' : '#800000',
      'PLAINS' : '#80FF00',
      'FOREST' : '#008040',
      'DESERT' : 'yellow',
      'WATER' : 'blue'
    }

    this.context.strokeStyle = 'red'
    this.wipmap.biomes.forEach(({cell, type}) => {
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

  draw_debug_landmarks () {
    this.context.fillStyle = 'red'
    this.wipmap.landmarks.forEach(([i, j, name, biome]) => {
      const [x, y] = toWorld([i, j])
      this.context.fillRect(x - 10, y - 10, 20, 20)
    })
  }
}
