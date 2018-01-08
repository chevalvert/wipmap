'use strict'

const fastRandom = require('fast-random')

let seed = 0
let randomizer = fastRandom(seed)

function setSeed (newSeed) {
  seed = newSeed
  randomizer = fastRandom(seed)
}

const random = () => randomizer.nextFloat()
const randomFloat = (min, max) => randomizer.nextFloat() * (max - min) + min
const randomInt = (min, max) => Math.floor(randomFloat(min, max))

export default {
  setSeed,
  random,
  randomInt,
  randomFloat
}
