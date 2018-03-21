'use strict'

const path = require('path')
const fs = require('fs-extra')
const objectAssignDeep = require('object-assign-deep')
const log = require(path.join(__dirname, 'log'))
const args = require(path.join(__dirname, 'args'))
const removeDuplicates = require(path.join(__dirname, 'array-remove-duplicate'))
const getLandmarkPacks = require(path.join(__dirname, 'get-landmark-packs'))

const _DEFAULT_CONFIG_ = path.join(__dirname, '..', '..', '..', 'wipmap.config.json')
const _DEFAULT_TEXPACK_ = path.join(__dirname, '..', '..', '..', 'wipmap.tex.json')

const defaultConfig = require(_DEFAULT_CONFIG_)
const config = getConfig()

function getConfig () {
  try {
    const cfg = objectAssignDeep.noMutate(
      defaultConfig,
      fs.readJsonSync(args.config || _DEFAULT_CONFIG_) || {},
      // TODO: allow texture override with external texpack via args['texture-pack']
      fs.readJsonSync(_DEFAULT_TEXPACK_)
    )

    getLandmarkPacks(args['landmark-packs']).forEach(pack => {
      pack.landmarks.forEach((landmark, landmarkIndex) => {
        let biomes = []
        landmark.spritesheets.forEach(spritesheet => {
          biomes = biomes.concat(spritesheet.biomes)
          biomes.forEach(biome => {
            // Registering pack's spritesheets in the config object
            cfg.spritesheets = {
              ...cfg.spritesheets,
              [`landmark-${pack.uid}-${landmarkIndex}-${biome.toLowerCase()}`]: {
                src: (pack.uid !== 'default' ? `packs/${pack.uid}/` : '') + spritesheet.src,
                resolution: spritesheet.resolution,
                length: spritesheet.length
              }
            }
          })
        })

        // Registering pack's landmarks in the config object
        cfg.landmarks = {
          ...cfg.landmarks,
          [`${pack.uid}-${landmarkIndex}`]: {
            name: landmark.name,
            biomes: removeDuplicates(biomes),
            variables: landmark.variables
          }
        }
      })
    })

    return cfg
  } catch (err) {
    log.error(err)
    return defaultConfig
  }
}

module.exports = () => args.live ? getConfig() : config
