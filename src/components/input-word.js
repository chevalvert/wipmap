'use strict'

import L from 'loc'
import bel from 'bel'
import noop from 'utils/noop'
import DomComponent from 'abstractions/DomComponent'

export default class InputWord extends DomComponent {
  constructor ({ words = [], color = 'black', loc }, onchange = noop) {
    super()
    this.loc = loc
    this.words = words
    this.color = color
    this.onchange = onchange
  }

  set words (words) {
    this._words = [].concat(words)

    this.length = this.words.length
    this.setIndex(0)

    if (this.length === 1) this.addClass('is-constant')
    else this.removeClass('is-constant')
  }

  get words () { return this._words }
  get word () { return this.words[this.index] }
  get localizedWord () {
    return this.loc
      ? L(this.loc + this.word.toLowerCase())
      : this.word
  }

  render () {
    return bel`
    <button
    class='input-word'
    style='--color: ${this.color}'>
      ${this.localizedWord}
    </button>`
  }

  setIndex (i) {
    this.index = i
    if (this.mounted) {
      this.refs.base.innerHTML = this.localizedWord
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
