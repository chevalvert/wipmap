'use strict'

import L from 'loc'
import config from 'config'
import store from 'utils/store'

import bel from 'bel'
import raw from 'bel/raw'

import SelectableWord from 'components/selectable-word'
import Drawer from 'components/Drawer'
import Button from 'components/button'

import DomComponent from 'abstractions/DomComponent'

export default class Describer extends DomComponent {
  constructor (data) {
    super()
    this.landmark = data.landmark
    this.sentences = data.sentences
    this.wordsMap = Object.assign({}, data.describer, {
      type: L(`landmark.${data.landmark[2]}`),
      biome: L(`biome.${data.landmark[3]}`),
      z: data.landmark[4]
    })
    this.refs.words = {}
  }

  render () {
    // TODO: handle '\n' for linebreaks
    this.sentences = this.sentences.map(sentence => sentence.split(/\%(\w+)/g).map(part => {
      const map = this.wordsMap[part]
      if (!map) return part
      const word = this.registerComponent(SelectableWord, map)
      this.refs.words[part] = word
      return word.raw()
    }))

    this.refs.drawer = this.registerComponent(Drawer)

    this.refs.buttons = {
      random: this.registerComponent(Button, 'random', () => this.randomizeWords()),
      draw: this.registerComponent(Button, 'draw', () => this.showDrawer()),
      undo: this.registerComponent(Button, 'undo', () => this.refs.drawer.undo())
    }

    return bel`
    <div class='describer'>
      <section class='describer-step'>
        <div class='describer-sentence'>${this.sentences[0]}</div>
      </section>
      <section class='describer-step'>
        <div class='describer-sentence'>${this.sentences[1]}</div>
        <div class='describer-drawer'>${this.refs.drawer.raw()}</div>
      </section>
      <footer class='describer-footer'>
        ${this.refs.buttons.random.raw()}
        ${raw('&nbsp;')}
        ${this.refs.buttons.undo.raw()}
        ${raw('&nbsp;')}
        ${this.refs.buttons.draw.raw()}
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

  showDrawer () {
    // WIP
    // TODO: dynamic calc of scale based on window.size / sprite.size
    const spriteName = this.landmark[2]
    const sprite = store.get(`spritesheet_${spriteName}`)
    const scale = 20
    const index = 0
    this.refs.drawer.setSprite(spriteName, scale, index)
    this.showStep(1)
  }
}
