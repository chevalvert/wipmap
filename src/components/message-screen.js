'use strict'

import bel from 'bel'
import DomComponent from 'abstractions/DomComponent'
import store from 'utils/store'

export default class MessageScreen extends DomComponent {
  constructor (message) {
    super()
    this.message = message
  }

  render () {
    const el = bel`
      <section class='loading-screen'>
        <h1 class='loading-screen-message'>${this.message}</h1>
      </section>`
    return el
  }
}
