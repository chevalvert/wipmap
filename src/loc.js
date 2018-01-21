'use strict'

const locales = { fr: {}, en: {} }

locales.fr['loading'] = 'chargement'
locales.fr['loading.connection'] = 'en attente de connection'
locales.fr['loading.sprites'] = 'images'
locales.fr['loading.map'] = 'carte'
locales.fr['loading.sendingLandmark'] = 'envoi en cours'

locales.fr['error'] = 'Erreur'
locales.fr['error.noslot'] = 'Plus de place disponible'

locales.fr['gameover'] = 'game over'

locales.fr['landmark.house'] = 'une maison'

locales.fr['biome.plains'] = ['la plaine', 'une plaine']
locales.fr['biome.desert'] = 'le désert'
locales.fr['biome.taiga']  = 'la taïga'
locales.fr['biome.tundra'] = 'la tundra'
locales.fr['biome.swamp']  = 'un marais'
locales.fr['biome.forest'] = 'la forêt'
locales.fr['biome.water']  = ['la mer', 'un lac', 'un étang']

export default (key, LANG = 'fr') => {
  if (!key) return
  if (Array.isArray(key)) key = key[0]

  const locale = locales[LANG][key.toLowerCase()]
  return locale
    ? Array.isArray(locale)
      ? locale[Math.floor(Math.random() * locale.length)]
      : locale
    : key
}
