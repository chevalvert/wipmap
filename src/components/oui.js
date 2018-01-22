'use strict'

import L from 'loc'
import oui from 'ouioui'

const lastOf = (arr) => arr[arr.length - 1]

const defaultOpts = {
  // See oui.scss:$oui-colors for available colors
  color: 'red'
}

export default class Oui {
  constructor (values, opts) {
    opts = Object.assign({}, defaultOpts, opts || {})
    this.values = values
    this.panel = oui.datoui({ label: L('generator.panel.title') })

    this.el = document.querySelector('.oui')
    this.el.classList.add('oui-' + opts.color)

    this.folders = []
  }

  get lastFolder () {
    return lastOf(this.folders) || this.panel
  }

  add (key, opts) {
    opts = Object.assign({}, {
      label: L('generator.panel.' + key),
      step: 1
    }, opts || {})
    return this.lastFolder.add(this.values, key, opts)
  }

  addFolder (label) {
    const folder = this.panel.addFolder({ label: L('generator.panel.' + label), open: true })
    this.folders.push(folder)
    return folder
  }

  addButton (label, callback, opts) {
    opts = Object.assign({}, {
      label: L('generator.panel.' + label)
    }, opts || {})

    opts.style = Object.assign({}, {
      color: 'rgb(250, 250, 250)',
      width: '100%'
    }, opts.style)

    return this.panel.add({ [label]: callback }, label, opts)
  }
}
