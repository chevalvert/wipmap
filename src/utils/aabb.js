'use strict'

function aabb (points) {
  let xmin = Number.POSITIVE_INFINITY
  let ymin = Number.POSITIVE_INFINITY
  let xmax = Number.NEGATIVE_INFINITY
  let ymax = Number.NEGATIVE_INFINITY

  points.forEach(([x, y, w, h]) => {
    if (x < xmin) xmin = x
    if (y < ymin) ymin = y
    if (x > xmax) xmax = x
    if (y > ymax) ymax = y

    if (w !== undefined && x - w / 2 < xmin) xmin = x - w / 2
    if (h !== undefined && y - h / 2 < ymin) ymin = y - h / 2
    if (w !== undefined && x + w / 2 > xmax) xmax = x + w / 2
    if (h !== undefined && y + h / 2 > ymax) ymax = y + h / 2
  })

  return {
    xmin,
    ymin,
    xmax,
    ymax,
    width: xmax - xmin,
    height: ymax - ymin,
    center: [
      xmin + ((xmax - xmin) / 2),
      ymin + ((ymax - ymin) / 2)
    ]
  }
}

const center = box => point => point.map((v, i) => v - box.center[i])

export { center, aabb }
export default aabb
