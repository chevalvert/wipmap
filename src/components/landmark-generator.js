'use strict'

import config from 'config'
import store from 'utils/store'
import events from 'utils/events'

import getSpriteIndex from 'utils/get-sprite-index'

import bel from 'bel'

import Button from 'components/button'
import SelectableWord from 'components/selectable-word'
import SpritePreviewer from 'components/sprite-previewer'
import DomComponent from 'abstractions/DomComponent'

export default class LandmarkGenerator extends DomComponent {
  static findAvailable (biome) {
    let landmarks = {}

    Object.entries(config.landmarks).forEach(([category, landmark]) => {
      if (!landmark.biomes.includes(biome.type)) return
      landmarks[category] = landmark
    })
    return landmarks
  }

  constructor (agent, landmarks) {
    super()
    this.agent = agent
    this.landmarks = landmarks || this.findAvailable(agent.currentBiome)
  }

  render () {
    this.refs.words = {
      category: this.registerComponent(SelectableWord, Object.keys(this.landmarks), () => this.update()),
      variables: [
        // Those words will be populated in this.update on didMount call
        this.registerComponent(SelectableWord, [], () => this.preview()),
        this.registerComponent(SelectableWord, [], () => this.preview())
      ]
    }

    this.refs.buttons = {
      random: this.registerComponent(Button, 'random', () => this.randomize()),
      validate: this.registerComponent(Button, 'validate', () => this.validate())
    }

    this.refs.preview = this.registerComponent(SpritePreviewer)

    return bel`<div class="landmark-generator">
      <h1>${this.agent.currentBiome.type}</h1>
      <div class="landmark-generator-sentence">
        ${[this.refs.words.category, ...this.refs.words.variables].map(w => w.raw())}
      </div>
      <div class="landmark-generator-buttons">
        ${Object.values(this.refs.buttons).map(btn => btn.raw())}
      </div>
      <div class="landmark-generator-preview">
        ${this.refs.preview.raw()}
      </div>
    </div>`
  }

  didMount () {
    this.update()
  }

  update () {
    this.landmarks[this.refs.words.category.word].variables.forEach((words, index) => {
      this.refs.words.variables[index].words = words
    })
    this.preview()
  }

  preview () {
    const sprite = this.getSprite()
    this.refs.preview.setSprite(sprite.spritesheet, sprite.index)
  }

  getSprite () {
    const name = this.refs.words.category.word
    const spritesheet = store.get(`spritesheet_${name}`)
    return {
      name,
      spritesheet,
      index: getSpriteIndex(spritesheet, this.refs.words.variables.map(w => w.index))
    }
  }

  randomize () {
    [this.refs.words.category, ...this.refs.words.variables].forEach(w => w.random())
  }

  get words () {
    return [this.refs.words.category, ...this.refs.words.variables].map(w => w.word)
  }

  validate () {
    // TODO: handle undefined sprite ?
    const sprite = this.getSprite()
    events.emit('landmark-generator.validate', {
      sprite,
      agent: this.agent,
    })
  }
}
