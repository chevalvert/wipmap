'use strict'

import bel from 'bel'
import DomComponent from 'abstractions/DomComponent'

export default class SelectableWord extends DomComponent {
  constructor (words, onchange = function () {} ) {
    super()
    this.words = words
    this.onchange = onchange
  }

  set words (words) {
    this._words = [].concat(words)
    this.length = this.words.length
    this.setIndex(0)
  }

  get words () { return this._words }
  get word () { return this.words[this.index] }

  render () {
    return bel`<button class='selectable-word'>${this.words[this.index]}</button>`
  }

  setIndex (i) {
    this.index = i
    if (this.mounted) {
      this.refs.base.innerHTML = this.words[this.index]
      this.onchange(this.word)
    }
  }

  random () {
    (this.length > 1) && this.setIndex(Math.floor(Math.random() * this.length))
  }

  didMount () {
    if (this.length === 1) {
      this.addClass('is-constant')
      return
    }

    this.refs.base.addEventListener('click', () => {
      this.setIndex(++this.index % this.length)
    })
  }
}
