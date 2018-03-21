'use strict'

const path = require('path')
const fs = require('fs-extra')
const isDirectory = require('is-directory')
const log = require(path.join(__dirname, 'log'))

const _DEFAULT_LANDMARK_PACK_ = path.join(__dirname, '..', '..', '..', 'wipmap.pack.json')
const defaultLandmarkPack = {
  uid: 'default',
  landmarks: require(_DEFAULT_LANDMARK_PACK_)
}

module.exports = packsDirectory => {
  const packs = fs.readdirSync(packsDirectory)
  .map(name => ({
    name,
    path: path.join(packsDirectory, name),
    cfg: path.join(packsDirectory, name, name + '.pack.json')
  }))
  .filter(dir => isDirectory.sync(dir.path) && fs.existsSync(dir.cfg))
  .map(dir => {
    try {
      return {
        uid: dir.name,
        landmarks: fs.readJsonSync(dir.cfg)
      }
    } catch (e) {
      log.error(e)
    }
  })
  .filter(Boolean)

  return [defaultLandmarkPack, ...packs]
}
