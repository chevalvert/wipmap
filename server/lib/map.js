'use strict'

const path = require('path')
const fs = require('fs-extra')
const wipmap = require('wipmap-generate')

const _DATA_ = path.join(__dirname, '..', 'data')
const _MAPS_ = path.join(_DATA_, 'maps')
const _HISTORY_ = path.join(_DATA_, 'history.json')

const makeUID = require(path.join(__dirname, 'utils', 'create-map-uid'))
const mapFilename = require(path.join(__dirname, 'utils', 'create-map-filename'))(_MAPS_)
const config = require(path.join(__dirname, '..', '..', 'server.config.json'))

let map = {}
let filename
let { history = [] } = fs.pathExistsSync(_HISTORY_) && fs.readJsonSync(_HISTORY_)

function create ([x, y, force = false], opts) {
  return new Promise((resolve, reject) => {
    // Auto move to the next [x,y] when requesting /map/[+|-]/[+|-]
    ;[x, y] = [x, y].map((v, index) => {
      if (!isNaN(v)) return v

      const previousMap = history[history.length - 1]
      if (!previousMap) return 0

      if (v === '+') return previousMap[index] + 1
      if (v === '-') return Math.max(0, previousMap[index] - 1)

      reject(new TypeError(`map.create expects [x,y] to be [int|"+"|"-"], "${v}" given.`))
    }).map(v => parseInt(v))

    filename = mapFilename([x, y])

    if (!+force && map.x === x && map.y === y) resolve(map)
    else {
      map = (!+force && fs.pathExistsSync(filename))
        ? fs.readJsonSync(filename, () => console.log('foo'))
        : {
          uid: makeUID(),
          ...wipmap(x, y, Object.assign({}, config.wipmap, opts || {})),
          landmarks: []
        }
      resolve(map)
    }
  })
}

function addLandmark (landmark) {
  if (!landmark) return
  map.landmarks.push(landmark)
  return landmark
}

function pushToHistory (map) {
  if (!map) return
  history = [
    ...history.filter(([x, y]) => !(map.x === x && map.y === y)),
    [+map.x, +map.y, map.uid]
  ]
}

function save () {
  return new Promise((resolve, reject) => {
    if (!filename) return resolve()
    Promise.resolve()
      .then(() => pushToHistory(map))
      .then(() => fs.outputJson(_HISTORY_, { history }))
      .then(() => fs.outputJson(filename, map))
      .then(resolve)
      .catch(reject)
  })
}

module.exports = {
  create,
  save,
  addLandmark,
  get uid () { return map.uid },
  get landmarks () { return map.landmarks || [] },
  get history () { return history }
}
