'use strict'

import bel from 'bel'
import DomComponent from 'abstractions/DomComponent'

export default class SelectableWord extends DomComponent {
  constructor (words) {
    super()
    this.words = [].concat(words)
    this.length = this.words.length
    this.index = 0
  }

  get word () { return this.words[this.index] }

  render () {
    return bel`<button class='selectable-word'>${this.words[this.index]}</button>`
  }

  setIndex (i) {
    this.index = i
    this.refs.base.innerHTML = this.words[this.index]
  }

  random () {
    (this.length > 1) && this.setIndex(Math.floor(Math.random() * this.length))
  }

  didMount () {
    if (this.length === 1) {
      this.addClass('is-disabled')
      return
    }

    this.refs.base.addEventListener('click', () => {
      this.setIndex(++this.index % this.length)
    })
  }
}
