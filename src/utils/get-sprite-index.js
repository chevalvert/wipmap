'use strict'

// NOTE: landmarks spritesheets need to be composed on
// a carthesian grid with XY [0, 0] at the LEFT TOP
export default (spritesheet, [x, y]) => x + y * (spritesheet.width / spritesheet.resolution)
