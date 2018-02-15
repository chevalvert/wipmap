'use strict'

import store from 'store'
import prng from 'utils/prng'

export default function (context, name, x, y, scale = 1, index = undefined) {
  const spritesheet = store.get(`spritesheet.${name}`)
  if (!spritesheet) return

  index = index === undefined
    ? Math.floor(prng.randomInt(0, spritesheet.length || 0))
    : index % spritesheet.length

  const i = index * spritesheet.resolution
  const sx = i % spritesheet.width
  const sy = ((i - sx) / spritesheet.width) * spritesheet.resolution
  const sw = spritesheet.resolution
  const sh = spritesheet.resolution
  const dx = Math.floor(x - (spritesheet.resolution * scale) / 2)
  // Note: drawing the spritesheet from the bottom of its hitbox
  const dy = Math.floor(y - (spritesheet.resolution * scale))
  const dw = Math.floor(spritesheet.resolution * scale)
  const dh = Math.floor(spritesheet.resolution * scale)

  context.drawImage(spritesheet, sx, sy, sw, sh, dx, dy, dw, dh)
}
