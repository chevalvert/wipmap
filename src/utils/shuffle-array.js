'use strict'

import prng from 'utils/prng'

export default ([...arr]) => {
  let m = arr.length
  while (m) {
    const i = Math.floor(prng.random() * m--)
    ;[arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr
}
