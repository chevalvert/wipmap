'use strict'

import Canvas from 'abstractions/Canvas'

export default class SpritePreviewer extends Canvas {
  didMount () {
    super.didMount()
    this.addClass('sprite-previewer')
  }

  onresize () {
    this.resize([window.innerWidth / 2, window.innerHeight])
    this.update()
  }

  setSprite (spritesheet, spriteIndex) {
    this.spritesheet = spritesheet
    this.spriteIndex = spriteIndex
    this.update()
  }

  update () {
    if (!this.spritesheet) return

    const x = this.width / 2
    const y = this.height / 2

    this.scale = Math.min(this.width, this.height) / this.spritesheet.resolution

    this.clear()
    this.context.imageSmoothingEnabled = false
    this.drawSprite(this.spritesheet.name, x, y, this.scale, this.spriteIndex)
  }
}
