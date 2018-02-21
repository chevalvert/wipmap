'use strict'

import { map } from 'missing-math'
import aabb from 'utils/aabb'

export default (lines, range = [[-1, 1], [-1, 1]]) => {
  if (!lines || lines.length === 0) return

  const box = aabb(lines.reduce((a, b) => a.concat(b), []))
  const ratio = [
    box.width > box.height ? (box.width / box.height) : 1,
    box.width > box.height ? 1 : (box.height / box.width)
  ]

  return lines.map(line => line.map(([x, y]) => ([
    map(x, box.xmin, box.xmax, range[0][0], range[0][1]) * ratio[0],
    map(y, box.ymin, box.ymax, range[1][0], range[1][1]) * ratio[1]
  ])))
}
