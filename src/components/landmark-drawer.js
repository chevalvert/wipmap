'use strict'

import L from 'loc'
import store from 'store'
import bel from 'bel'
import raw from 'bel/raw'
import Emitter from 'tiny-emitter'

import normalizePath from 'utils/normalize-path'
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
    const categories = Object.keys(landmarks)
    const category = categories[Math.floor(Math.random() * categories.length)]
    return {
      biome,
      category,
      variables: landmarks[category].variables.map(variable => {
        const index = Math.floor(Math.random() * variable.length)
        return { index, word: variable[index] }
      })
    }
  }

  getSprite (landmark) {
    const name = `${landmark.biome.type.toLowerCase()}-${landmark.category}`
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
      maxLines: store.get('config.plotter').drawerMaxLines,
      maxLength: store.get('config.plotter').drawerMaxLength,
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
          <strong>${L('landmark-drawer.' + this.landmark.category)}</strong>
          <strong>${L('landmark-drawer.' + this.landmark.category + '.' + this.landmark.variables[0].word)}</strong>
          et${raw(' ')}
          <strong>${L('landmark-drawer.' + this.landmark.category + '.' + this.landmark.variables[1].word)}</strong>
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

    const line = lines[0]
    if (!line || line.length === 0) return

    const normalizedLines = normalizePath(lines)

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
