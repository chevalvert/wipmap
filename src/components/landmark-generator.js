'use strict'

import L from 'loc'
import store from 'store'

import getSpriteIndex from 'utils/get-sprite-index'
import getAvailableLandmarks from 'utils/get-available-landmarks'

import bel from 'bel'
import Emitter from 'tiny-emitter'

import Button from 'components/button'
import InputWord from 'components/input-word'
import InputNumber from 'components/input-number'
import SpritePreviewer from 'components/sprite-previewer'
import DomComponent from 'abstractions/DomComponent'

const defaultOpts = {
  color: 'black'
}

export default class LandmarkGenerator extends DomComponent {
  constructor (agent, landmarks, opts = {}) {
    super()
    this.opts = Object.assign({}, defaultOpts, opts)
    this.agent = agent
    this.landmarks = landmarks || getAvailableLandmarks(agent.currentBiome)
    this.events = new Emitter()
  }

  watch (event, callback) { this.events.on(event, callback) }
  watchOnce (event, callback) { this.events.once(event, callback) }
  unwatch (event, callback) { this.events.off(event, callback) }
  waitFor (event) {
    return new Promise((resolve, reject) => this.events.once(event, resolve))
  }

  render () {
    const color = this.opts.color
    const uids = Object.values(this.landmarks).map(landmark => landmark.name).map(name => name.split('?').pop())
    this.refs.words = {
      context: this.registerComponent(InputWord, { words: this.agent.currentBiome.type, loc: 'biome.' }),
      uid: this.registerComponent(InputWord, { words: uids, color }, () => this.update()),
      variables: [
        // Those words will be populated in this.update on didMount call
        this.registerComponent(InputWord, { color }, () => this.preview()),
        this.registerComponent(InputWord, { color }, () => this.preview())
      ]
    }

    this.refs.modifiers = {
      length: this.registerComponent(InputNumber, { range: [1, 100], step: 1, color }, () => this.preview()),
      density: this.registerComponent(InputNumber, { value: 50, range: [0, 100], step: 10, color, prefix: '%' }, () => this.preview()),
      order: this.registerComponent(InputNumber, { value: 50, range: [0, 100], step: 25, color, prefix: '%' }, () => this.preview())
    }

    this.refs.buttons = {
      random: this.registerComponent(Button, { value: L`ui.random`, color }, () => this.randomize()),
      validate: this.registerComponent(Button, { value: L`ui.validate`, color }, () => this.validate())
    }

    this.refs.preview = this.registerComponent(SpritePreviewer)

    return bel`<div class='landmark-generator'>
      <ul class='landmark-generator-sentence'>
        ${
          Object.entries({
            'context': this.refs.words.context.raw(),
            'type': this.refs.words.uid.raw(),
            'variable': this.refs.words.variables.map(v => v.raw()),
            'modifier-length': this.refs.modifiers.length.raw(),
            'modifier-density': this.refs.modifiers.density.raw(),
            'modifier-order': this.refs.modifiers.order.raw()
          }).map(([key, els]) => [].concat(els).map(el => {
            return bel`
            <li
            class='landmark-generator-sentence-word'
            data-name=${L(`ui.landmark-generator.${key}`)}>
              ${el}
            </li>`
          }))
        }
      </ul>

      <div class='landmark-generator-buttons'>
        ${Object.values(this.refs.buttons).map(btn => btn.raw())}
      </div>

      <div class='landmark-generator-preview'>
        ${this.refs.preview.raw()}
      </div>
    </div>`
  }

  didMount () { this.update() }

  update () {
    window.requestAnimationFrame(() => {
      const index = this.refs.words.uid.index
      Object.values(this.landmarks)[index].variables.forEach((words, index) => {
        this.refs.words.variables[index].words = words
      })
      this.preview()
    })
  }

  preview () {
    const sprite = this.getSprite()
    const modifiers = {}
    Object.entries(this.refs.modifiers).forEach(([key, modifier]) => {
      modifiers[key] = modifier.value
    })
    this.refs.preview.setSprite(sprite.spritesheet, sprite.index, modifiers)

    if (this.refs.modifiers.length.value > this.refs.preview.points.length) {
      this.refs.modifiers.length.value = this.refs.preview.points.length
      this.refs.modifiers.length.refs.btns[1].disable()
    }
  }

  getSprite () {
    const index = this.refs.words.uid.index
    const name = `landmark-${Object.keys(this.landmarks)[index]}-${this.agent.currentBiome.type.toLowerCase()}`
    const spritesheet = store.get(`spritesheet.` + name)

    return {
      name,
      spritesheet,
      index: getSpriteIndex(spritesheet, this.refs.words.variables.map(w => w.index))
    }
  }

  randomize () {
    ;[
      this.refs.words.uid,
      ...this.refs.words.variables,
      ...Object.values(this.refs.modifiers)
    ].forEach(w => w.random())
  }

  get words () {
    return [this.refs.words.uid, ...this.refs.words.variables].map(w => w.word)
  }

  validate () {
    // TODO: handle undefined sprite ?
    const sprite = this.getSprite()
    const points = this.refs.preview.points
    this.events.emit('validate', {
      sprite,
      points,
      agent: this.agent
    })
  }
}
