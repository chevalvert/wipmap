'use strict'

import L from 'loc'
import config from 'config'
import store from 'utils/store'
import events from 'utils/events'
import error from 'utils/error'

import bel from 'bel'
import raw from 'bel/raw'

import SelectableWord from 'components/selectable-word'
import Drawer from 'components/Drawer'
import Button from 'components/button'

import DomComponent from 'abstractions/DomComponent'

export default class Describer extends DomComponent {
  constructor (landmark, wordsmap, sentences) {
    super()

    this.landmark = landmark
    this.wordsmap = Object.assign({}, wordsmap, {
      type: L('landmark.' + landmark.type),
      biome: L('biome.' + landmark.biome),
      // TODO: assign Z server side, based on wipmap-generate landmark instance ID
      z: wordsmap.z[Math.floor(Math.random() * wordsmap.z.length)]
    })

    this.sentences = sentences
    this.refs.words = {}
  }

  render () {
    // TODO: handle '\n' for linebreaks
    const DOMSentences = this.sentences.map(sentence => sentence.split(/\%(\w+)/g).map(part => {
      const map = this.wordsmap[part]
      if (!map) return part
      const word = this.registerComponent(SelectableWord, map)
      this.refs.words[part] = word
      return word.raw()
    }))

    this.refs.drawer = this.registerComponent(Drawer)

    this.refs.buttons = {
      random: this.registerComponent(Button, 'random', () => this.randomizeWords()),
      draw: this.registerComponent(Button, 'draw', () => this.showDrawer()),
      undo: this.registerComponent(Button, 'undo', () => this.refs.drawer.undo()),
      send: this.registerComponent(Button, 'send', () => this.onvalidate())
    }

    // TODO: better handling of describer-step
    return bel`
    <div class='describer'>
      <section class='describer-step'>
        <div class='describer-sentence'>${DOMSentences[0]}</div>
      </section>
      <section class='describer-step'>
        <div class='describer-sentence'>${DOMSentences[1]}</div>
        <div class='describer-drawer'>${this.refs.drawer.raw()}</div>
      </section>
      <footer class='describer-footer'>
        ${this.refs.buttons.random.raw()}
        ${raw('&nbsp;')}
        ${this.refs.buttons.undo.raw()}
        ${raw('&nbsp;')}
        ${this.refs.buttons.draw.raw()}
        ${raw('&nbsp;')}
        ${this.refs.buttons.send.raw()}
      </div>
    </div>`
  }

  didMount () {
    super.didMount()
    this.showStep(this.stepIndex || 0)
  }

  randomizeWords () {
    Object.values(this.refs.words).forEach(word => word.random())
  }

  showStep (i) {
    this.refs.base.querySelectorAll('.describer-step').forEach((el, index) => {
      if (index === i) el.style.display = 'block'
      else el.style.display = 'none'
    })
  }

  calcSpriteIndex (sprite) {
    // NOTE: landmarks spritesheets need to be composed on a
    // carthesian grid with XY [0, 0] at the LEFT TOP
    return this.refs.words.x.index + this.refs.words.y.index * (sprite.width / sprite.resolution)
  }

  showDrawer () {
    const spritesheet = store.get(`spritesheet_${this.landmark.type}`)
    if (!spritesheet) error(`describer.js: No spritesheet found for '${this.landmark.type}'`)

    const scale = (Math.min(window.innerWidth, window.innerHeight) - config.drawer.padding) / spritesheet.resolution
    this.refs.drawer.setSprite(spritesheet.name, scale, this.calcSpriteIndex(spritesheet))
    this.showStep(1)
  }

  onvalidate () {
    this.refs.drawer.getDataURL()
    .then(dataurl => {
      events.emit('describer.validate', {
        landmark: Object.assign({}, this.landmark, { dataurl }),
        words: { x: this.refs.words.x.word, y: this.refs.words.y.word },
        sentences: this.sentences
      })
    })
  }
}
