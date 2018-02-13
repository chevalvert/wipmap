'use strict'

export default ([...arr], rng = Math.random) => {
  let m = arr.length
  while (m) {
    const i = Math.floor(rng() * m--)
    ;[arr[m], arr[i]] = [arr[i], arr[m]]
  }
  return arr
}
