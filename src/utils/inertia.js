const frictionMultiplier = 100 // uniform friction through interpolation

const linear = (current, target, params) => {
  const delta = current - target
  return current - (delta / params.friction)
}

const elastic = (current, target, params, dTime, reset) => {
  if (reset) this.speed = 0

  const delta = current - target
  const spring = -delta / (params.friction / frictionMultiplier)
  const damper = -params.rigidity * this.speed
  const acc = (spring + damper) / params.mass

  this.speed += acc * dTime
  return current + (this.speed * dTime)
}

const bounce = (current, target, params, dTime, reset) => {
  if (reset) this.speed = 0;

  const delta = current - target;
  const spring = -delta / (params.friction / frictionMultiplier)
  const damper = -params.rigidity * this.speed
  const acc = (spring + damper) / params.mass

  this.speed += acc * dTime
  const result = current + (this.speed * dTime)

  if ((result - target) >= 0) {
    this.speed = -this.speed
    return target
  }

  return result
}

export default class Inertia {
  constructor({
    value,
    interpolation = 'linear',
    precisionStop = 0.001,
    perfectStop = false,
    rigidity = 0.1,
    friction = 10, /* Damping constant, in kg / s */
    mass = 0.01
  }) {
    // Property params
    this.value = value
    this.targetValue = value
    this.stopped = true

    // Stop params
    this.precisionStop = precisionStop
    this.perfectStop = perfectStop

    // Interpolation params
    this.interpolationFn = this.getInterpolation(interpolation)
    this.interpolationParams = { rigidity, friction, mass }
  }

  getInterpolation (interpolationName) {
    switch (interpolationName) {
      case 'elastic': return elastic
      case 'bounce': return bounce
      default: return linear
    }
  }

  to (targetValue) {
    this.targetValue = targetValue
    if (this.stopped) this.start()
  }

  start () {
    this.reset = true
    this.stopped = false
    this.lastTime = Date.now() - 17
  }

  update () {
    if (this.stopped) return false

    const now = Date.now()
    const dTime = (16.67) / 1000

    const diff = this.value - this.targetValue
    this.value = this.interpolationFn.call(this,
      this.value, this.targetValue, this.interpolationParams, dTime, this.reset)

    if (this.reset) this.reset = false

    if (this.needStop(diff)) {
      if (this.perfectStop) this.value = this.targetValue
      this.stop()
    }

    this.lastTime = now
    return this.value
  }

  needStop (diff) {
    if (Math.abs(diff) < this.precisionStop) {
      if (isNaN(this.speed)) return true
      return Math.abs(this.speed) < this.precisionStop
    } return false
  }

  stop () {
    this.stopped = true
  }

  destroy () {
    this.stop()
    this.interpolationFn = null
    this.interpolationParams = null
  }
}
