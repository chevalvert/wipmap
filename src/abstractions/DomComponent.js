'use strict'

export default class DomComponent {
  constructor (props) {
    // Add your DOM references to this.refs
    this.refs = {}
    // Add your animejs animation to this.anims
    this.anims = {}
    this.timers = []
    this.subcomponents = []
    this.didInit(props)
  }

  // Add subComponent to this component
  registerComponent (Component, ...props) {
    const c = new Component(...props)
    this.subcomponents.push(c)
    return c
  }

  // Use it if you want to create DOM from the JS and use mount instead of hydrate
  render () {}

  // Called after the component is instantiated
  didInit () {}

  // Called just before the component is mounted to the DOM
  willMount () {}

  // Called just after the component is mounted to the DOM
  didMount () {}

  // Called just before the component is removed from the DOM
  willUnmount () {}

  callWillMount () {
    if (!this.refs.base) return
    this.willMount(this.refs.base)
    this.subcomponents.forEach(c => c.callWillMount())
  }

  callDidMount () {
    if (!this.refs.base) return
    this.mounted = true
    this.subcomponents.forEach(c => c.callDidMount())
    this.didMount(this.refs.base)
  }

  // Use a already existing DOM element as base for the component
  hydrate (el) {
    if (!el || this.mounted) return
    this.callWillMount(el)
    this.refs.base = el
    this.mounted = true
    this.callDidMount()
  }

  // Render DOM from the render() function into an existing DOM element
  // If you specify a sibling, the element will be inserted before it
  mount (parent, sibling = null) {
    if (!parent || this.mounted) return
    const el = this.render()
    if (!el) return
    this.callWillMount(el)
    sibling ? parent.insertBefore(el, sibling) : parent.appendChild(el)
    this.refs.base = el
    this.mounted = true
    this.callDidMount()
  }

  // Render DOM from the render() function and return the raw object
  raw () {
    if (this.mounted || this.refs.base) return this.refs.base
    const el = this.render()
    this.refs.base = el
    return el
  }

  bindFuncs (funcs) {
    funcs.forEach(func => { this[func] = this[func].bind(this) })
  }

  // Quick helper for timer in promises
  timer (delay, cb) {
    return new Promise((resolve, reject) => {
      const self = this
      if (cb) cb = cb.bind(self)
      const timer = window.setTimeout(callback, delay)
      self.timers.push(timer)
      function callback () {
        const index = self.timers.indexOf(timer)
        if (~index) self.timers.splice(index, 1)
        resolve()
        if (cb) cb()
      }
    })
  }

  // Remove the DOM and destroy the component
  destroy () {
    if (!this.mounted) return
    this.willUnmount(this.refs.base)
    this.subcomponents.forEach(c => c.destroy())
    this.refs.base && this.refs.base.parentNode && this.refs.base.parentNode.removeChild(this.refs.base)
    for (let k in this.refs) delete this.refs[k]
    for (let k in this.anims) {
      if (typeof this.anims[k].pause === 'function') this.anims[k].pause()
      delete this.anims[k]
    }
    // remove all non-finished timers
    this.timers.forEach(timer => window.clearTimeout(timer))
    this.anims = undefined
    this.timers = undefined
    this.refs = undefined
    this.mounted = false
  }

  addClass (className) {
    if (this.refs.base && this.refs.base.classList) {
      this.refs.base.classList.add(className)
    }
  }

  removeClass (className) {
    if (this.refs.base && this.refs.base.classList) {
      this.refs.base.classList.contains(className) && this.refs.base.classList.remove(className)
    }
  }

  repaint () {
    if (this.refs.base) {
      void this.refs.base.offsetHeight
    }
  }

  show () {
    this.hidden = false
    if (this.refs.base) this.refs.base.style.display = ''
  }

  hide () {
    this.hidden = true
    if (this.refs.base) this.refs.base.style.display = 'none'
  }

  enable () {
    this.disabled = false
    this.removeClass('is-disabled')
  }

  disable () {
    this.disabled = true
    this.addClass('is-disabled')
  }
}
