'use strict'

import L from 'loc'
import store from 'store'
import events from 'utils/events'

import getSpriteIndex from 'utils/get-sprite-index'

import bel from 'bel'

import Button from 'components/button'
import InputWord from 'components/input-word'
import InputNumber from 'components/input-number'
import SpritePreviewer from 'components/sprite-previewer'
import DomComponent from 'abstractions/DomComponent'

export default class LandmarkGenerator extends DomComponent {
  static findAvailable (biome) {
    if (!biome) return
    let landmarks = {}
    Object.entries(store.get('config.landmarks')).forEach(([category, landmark]) => {
      if (!landmark.biomes.includes(biome.type)) return
      landmarks[category] = landmark
    })
    return landmarks
  }

  constructor (agent, landmarks) {
    super()
    this.agent = agent
    this.landmarks = landmarks || this.findAvailable(agent.currentBiome)
  }

  render () {
    const color = store.get('remote.color')

    this.refs.words = {
      context: this.registerComponent(InputWord, { words: this.agent.currentBiome.type, loc: 'biome.' }),
      category: this.registerComponent(InputWord, { words: Object.keys(this.landmarks), color, loc: 'landmark.' }, () => this.update()),
      variables: [
        // Those words will be populated in this.update on didMount call
        this.registerComponent(InputWord, { color }, () => this.preview()),
        this.registerComponent(InputWord, { color }, () => this.preview())
      ]
    }

    this.refs.modifiers = {
      length: this.registerComponent(InputNumber, { range: [1, 100], step: 1, color }, () => this.preview()),
      density: this.registerComponent(InputNumber, { value: 50, range: [0, 100], step: 10, color, prefix: '%' }, () => this.preview()),
      order: this.registerComponent(InputNumber, { value: 50, range: [0, 100], step: 50, color, prefix: '%' }, () => this.preview())
    }

    this.refs.buttons = {
      random: this.registerComponent(Button, { value: L`remote.buttons.random`, color }, () => this.randomize()),
      validate: this.registerComponent(Button, { value: L`remote.buttons.validate`, color }, () => this.validate())
    }

    this.refs.preview = this.registerComponent(SpritePreviewer)

    return bel`<div class='landmark-generator'>
      <ul class='landmark-generator-sentence'>
        ${
          Object.entries({
            'context': this.refs.words.context.raw(),
            'type': this.refs.words.category.raw(),
            'variable': this.refs.words.variables.map(v => v.raw()),
            'modifier-length': this.refs.modifiers.length.raw(),
            'modifier-density': this.refs.modifiers.density.raw(),
            'modifier-order': this.refs.modifiers.order.raw()
          }).map(([key, els]) => [].concat(els).map(el => {
            return bel`
            <li
            class='landmark-generator-sentence-word'
            data-name=${L(`remote.landmark-generator.prefix.${key}`)}>
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
      const type = this.refs.words.category.word
      if (!type) return
      this.landmarks[type].variables.forEach((words, index) => {
        this.refs.words.variables[index].loc = `landmark.${type}.`
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
      this.refs.modifiers.length.refs.btns[1].shake()
      this.refs.modifiers.length.value = this.refs.preview.points.length
    }
  }

  getSprite () {
    const name = `${this.agent.currentBiome.type.toLowerCase()}-${this.refs.words.category.word}`
    const spritesheet = store.get(`spritesheet.` + name)
    return {
      name,
      spritesheet,
      index: getSpriteIndex(spritesheet, this.refs.words.variables.map(w => w.index))
    }
  }

  randomize () {
    ;[
      this.refs.words.category,
      ...this.refs.words.variables,
      ...Object.values(this.refs.modifiers)
    ].forEach(w => w.random())
  }

  get words () {
    return [this.refs.words.category, ...this.refs.words.variables].map(w => w.word)
  }

  validate () {
    // TODO: handle undefined sprite ?
    const sprite = this.getSprite()
    const points = this.refs.preview.points
    events.emit('landmark-generator.validate', {
      sprite,
      points,
      agent: this.agent
    })
  }
}
