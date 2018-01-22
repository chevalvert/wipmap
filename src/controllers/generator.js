'use strict'

import L from 'loc'
import Emitter from 'tiny-emitter'
import Oui from 'components/oui'

export default function () {
  const events = new Emitter()
  const values = {
    scale: 50,
    distortion: 1,
    water: 3,
    forest: 2,
    houses: 10,
    grass: 1,
    housesHeight: 50,
    voronoi: false,
  }

  const oui = new Oui(values, {
    color: ['blue', 'red', 'green'][Math.floor(Math.random() * 3)],
  })

  oui.addFolder('map')
  oui.add('voronoi')
  oui.add('scale', { min: 1, max: 100 })
  oui.add('distortion', { min: 0, max: 100 })

  oui.addFolder('quantity')
  oui.add('water', { min: 0, max: 100 })
  oui.add('forest', { min: 0, max: 100 })
  oui.add('grass', { min: 0, max: 100 })

  oui.addFolder('houses')
  oui.add('houses', { min: 0, max: 100 })
  oui.add('housesHeight', { min: 0, max: 3 })

  oui.addButton('generate', () => events.emit('generate', values))
  oui.addButton('save', () => events.emit('save', values))

  return {
    get values () { return values },

    on: events.on.bind(events),
    once: events.once.bind(events),
    off: events.off.bind(events),
    waitFor: event => new Promise ((resolve, reject) => {
      events.once(event, resolve)
    })
  }
}
