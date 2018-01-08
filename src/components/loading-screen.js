'use strict'

import bel from 'bel'
import DomComponent from 'abstractions/DomComponent'
import store from 'utils/store'

export default class LoadingScreen extends DomComponent {
  render () {
    const message = 'chargement'
    const el = bel`
      <section class='loading-screen'>
        <h1 class='loading-screen-message'>${message}</h1>
      </section>`
    return el
  }
}
