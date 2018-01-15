'use strict'

const loc = { fr: {}, en: {} }

loc.fr['landmark.house'] = 'une maison'

loc.fr['biome.plains'] = ['la plaine', 'une plaine']
loc.fr['biome.desert'] = 'le désert'
loc.fr['biome.taiga']  = 'la taïga'
loc.fr['biome.tundra'] = 'la tundra'
loc.fr['biome.swamp']  = 'un marais'
loc.fr['biome.forest'] = 'la forêt'
loc.fr['biome.water']  = ['la mer', 'un lac', 'un étang']

export default (str, lang = 'fr') => {
  if (!str) return
  const l = loc[lang][str.toLowerCase()]
  return Array.isArray(l)
    ? l[Math.floor(Math.random() * l.length)]
    : l
}
