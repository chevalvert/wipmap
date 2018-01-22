'use strict'

import config from 'config'
import store from 'utils/store'

import prng from 'utils/prng'
import { toWorld } from 'utils/map-to-world'
import groupBy from 'utils/group-by'

import landmarks from 'controllers/landmarks'
import Canvas from 'components/canvas'

const defaultOpts = {
  voronoi: false,
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
    this.resize([window.innerWidth * this.scale, window.innerHeight * this.scale])
    store.set('width', this.width)
    store.set('height', this.height)

    this.update()
  }

  update () {
    prng.setSeed(this.seed)
    this.clear()
    this.context.imageSmoothingEnabled = false

    this.opts.voronoi && this.draw_debug()
    this.draw_biomePatterns()
    this.draw_landmarks()

    this.draw_debug_landmarks(true)
  }

  draw_biomePatterns () {
    Object.entries(this.wipmap.points).forEach(( [type, points] ) => {
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

  draw_landmarks () {
    landmarks
    .filter(l => l.hasOwnProperty('dataurl'))
    .forEach(landmark => {
      const [x, y] = toWorld(landmark.position)

      if (landmark.dataurl) {
        // landmark get a dataurl from /remote drawer
        if (!landmark.img) {
          const img = new Image
          img.onload = () => {
            landmark.img = img
            this.context.drawImage(img, Math.floor(x - img.width / 2), Math.floor(y - img.height / 2))
          }
          img.src = landmark.dataurl
        } else this.context.drawImage(landmark.img, Math.floor(x - landmark.img.width / 2), Math.floor(y - landmark.img.height / 2))
      }
      else if (landmark.sprite) {
        // landmark get a sprite from /generator
        this.drawSprite(landmark.sprite.name, x, y, this.scale, landmark.sprite.index)
      }
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
    this.wipmap.biomes.forEach(( {cell, type} ) => {
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
    const seeds = groupBy(Object.values(landmarks.all), 'instance')
    Object.values(seeds).forEach(landmarks => {
      this.context.fillStyle = `rgb(${prng.randomInt(0, 255)}, ${prng.randomInt(0, 255)}, ${prng.randomInt(0, 255)})`
      landmarks.filter(l => !l.found).forEach((landmark, index) => {
        const [x, y] = toWorld(landmark.position)
        this.context.fillRect(x - 10, y - 10, 20, 20)
      })
    })
  }
}
