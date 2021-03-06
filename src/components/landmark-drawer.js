'use strict'

import L from 'loc'
import store from 'store'
import bel from 'bel'
import raw from 'bel/raw'
import Emitter from 'tiny-emitter'
import { normalize } from 'missing-math'

import getSpriteIndex from 'utils/get-sprite-index'

import PlotterCursor from 'components/plotter-cursor'
import Button from 'components/button'
import DrawableCanvas from 'components/drawable-canvas'

import DomComponent from 'abstractions/DomComponent'
import Canvas from 'abstractions/Canvas'

const defaultOpts = {
  color: 'black'
}

export default class LandmarkDrawer extends DomComponent {
  constructor (biome, landmarks, opts = {}) {
    super()
    this.opts = Object.assign({}, defaultOpts, opts)
    this.landmark = this.getRandom(biome, landmarks)
    this.events = new Emitter()
  }

  watch (event, callback) { this.events.on(event, callback) }
  watchOnce (event, callback) { this.events.once(event, callback) }
  unwatch (event, callback) { this.events.off(event, callback) }
  waitFor (event) {
    return new Promise((resolve, reject) => this.events.once(event, resolve))
  }

  getRandom (biome, landmarks) {
    const uids = Object.keys(landmarks)
    const uid = uids[Math.floor(Math.random() * uids.length)]
    return {
      uid,
      biome,
      // Regex allowing the use of optionnal articles matching `(de la )?végétation`
      name: landmarks[uid].name.replace(/(\(|\)\?)/g, ''),
      variables: landmarks[uid].variables.map(variable => {
        const index = Math.floor(Math.random() * variable.length)
        return { index, word: variable[index] }
      })
    }
  }

  getSprite (landmark) {
    console.log(landmark)
    const name = `landmark-${landmark.uid}-${landmark.biome.type.toLowerCase()}`
    const spritesheet = store.get(`spritesheet.` + name)

    return {
      name,
      spritesheet,
      index: getSpriteIndex(spritesheet, landmark.variables.map(v => v.index))
    }
  }

  render () {
    const color = this.opts.color

    this.refs.spriteHolder = this.registerComponent(Canvas)

    this.refs.drawer = this.registerComponent(DrawableCanvas, {
      maxLines: store.get('config.plotter').draw.maxLines,
      maxLength: store.get('config.plotter').draw.maxLength,
      lineWidth: 10
    })

    this.refs.cursor = this.registerComponent(PlotterCursor, color, this.refs.drawer)

    this.refs.buttons = {
      undo: this.registerComponent(Button, { value: L`ui.undo`, color }, () => this.refs.drawer.undo()),
      validate: this.registerComponent(Button, { value: L`ui.draw`, color }, () => this.validate())
    }

    return bel`<div class='landmark-drawer'>
      <div class='landmark-drawer-sprite-holder'>
        ${this.refs.spriteHolder.raw()}
      </div>

      ${this.refs.drawer.raw()}

      <div class='landmark-drawer-controls'>
        <div class='landmark-drawer-sentence' style='--word-color:${color}'>
          dessine${raw(' ')}
          <strong>${this.landmark.name}</strong>
          <strong>${this.landmark.variables[0].word}</strong>
          et${raw(' ')}
          <strong>${this.landmark.variables[1].word}</strong>
          dans${raw(' ')}
          <strong>${L('biome.' + this.landmark.biome.type)}</strong>
        </div>
        <div class='landmark-drawer-buttons'>
          ${Object.values(this.refs.buttons).map(btn => btn.raw())}
        </div>
      </div>
      ${this.refs.cursor.raw()}
    </div>`
  }

  didMount () {
    this.update()

    const buttons = Object.values(this.refs.buttons)
    buttons.forEach(btn => btn.disable())

    this.refs.drawer.watch('beginDraw', () => buttons.forEach(btn => btn.enable()))
    this.refs.drawer.watch('undo', linesLength => {
      if (!linesLength) buttons.forEach(btn => btn.disable())
    })
  }

  update () {
    const sprite = this.getSprite(this.landmark)

    this.refs.spriteHolder.resize([sprite.spritesheet.resolution, sprite.spritesheet.resolution], false)
    this.refs.spriteHolder.smooth(false)
    this.refs.spriteHolder.drawSprite(sprite.name, sprite.spritesheet.resolution / 2, sprite.spritesheet.resolution, 1, sprite.index)

    this.refs.drawer.resize([
      this.refs.spriteHolder.refs.base.offsetWidth,
      this.refs.spriteHolder.refs.base.offsetHeight
    ])
  }

  validate () {
    const lines = this.refs.drawer.lines
    if (!lines || lines.length === 0) return

    const rect = this.refs.drawer.refs.base.getBoundingClientRect()
    const normalizedLines = lines.map(line => line.map(([x, y]) => ([
      normalize(x, rect.left, rect.width),
      normalize(y, rect.top, rect.height)
    ])))

    this.refs.cursor.begin(lines)
    this.addClass('has-cursor')
    this.events.emit('validate', normalizedLines)
  }

  moveCursor (percent) { this.refs.cursor.move(percent) }
  endCursor () {
    this.removeClass('has-cursor')
    this.refs.cursor.end()
  }

  enable () {
    super.enable()
    this.refs.spriteHolder.show()
    this.refs.drawer.enable()
  }

  disable () {
    super.disable()
    this.refs.spriteHolder.hide()
    Object.values(this.refs.buttons).forEach(btn => btn.disable())

    this.refs.drawer.disable()
  }
}
