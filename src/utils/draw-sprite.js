'use strict'

import store from 'utils/store'
import prng from 'utils/prng'

export default function (context, name, x, y, scale = 1, index = undefined) {
  const sprite = store.get(`spritesheet_${name}`)
  if (!sprite) return

  index = index === undefined
    ? Math.floor(prng.random() * sprite.length - 1)
    : index

  const i = index * sprite.resolution
  const sx = i % sprite.width
  const sy = ((i - sx) / sprite.width) * sprite.resolution
  const sw = sprite.resolution
  const sh = sprite.resolution
  const dx = Math.floor(x - (sprite.resolution * scale) / 2)
  const dy = Math.floor(y - (sprite.resolution * scale) / 2)
  const dw = Math.floor(sprite.resolution * scale)
  const dh = Math.floor(sprite.resolution * scale)

  context.drawImage(sprite, sx, sy, sw, sh, dx, dy, dw, dh)
}
