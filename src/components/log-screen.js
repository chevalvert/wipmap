'use strict'

import bel from 'bel'
import DomComponent from 'abstractions/DomComponent'

export default class MessageScreen extends DomComponent {
  constructor (title, message = '', className = '') {
    super()
    this.title = title
    this.message = message
    this.className = className
  }

  render () {
    this.refs.message = bel`<div class='log-screen-message'>${this.message}</div>`
    const el = bel`
      <section class='log-screen ${this.className}'>
        <div class='log-screen-content'>
          <h1 class='log-screen-title'>${this.title}</h1>
          ${this.refs.message}
        </div>
      </section>`
    return el
  }

  say (text) {
    if (this.mounted) this.refs.message.innerHTML = text
  }
}
