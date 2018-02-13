'use strict'

import L from 'loc'
import bel from 'bel'
import noop from 'utils/noop'
import DomComponent from 'abstractions/DomComponent'

const WORDS_FALLBACK = [L`input-word.undefined`]

export default class InputWord extends DomComponent {
  constructor ({ words = WORDS_FALLBACK, color = 'black', loc }, onchange = noop) {
    super()
    this.loc = loc
    this.words = words
    this.color = color
    this.onchange = onchange
  }

  set words (words = WORDS_FALLBACK) {
    this._words = [].concat(words)

    this.index = 0
    this.length = this._words.length

    if (this.length === 1) this.addClass('is-constant')
    else this.removeClass('is-constant')
  }

  get words () { return this._words }
  get word () { return this.words[this.index] || WORDS_FALLBACK[0] }
  get localizedWord () {
    return this.loc
      ? L(this.loc + this.word.toLowerCase())
      : this.word
  }

  get index () { return this._index }
  set index (i) {
    this._index = i
    if (this.mounted) {
      this.refs.base.innerHTML = this.localizedWord
      this.onchange(this.word)
    }
  }

  render () {
    return bel`
    <button
    onclick=${() => this.next()}
    class='input-word ${this.length === 1 && 'is-constant'}'
    style='--color: ${this.color}'>
      ${this.localizedWord}
    </button>`
  }

  next () {
    this.index = ++this.index % this.length
  }

  random () {
    if (this.length > 1) this.index = Math.floor(Math.random() * this.length)
  }
}
