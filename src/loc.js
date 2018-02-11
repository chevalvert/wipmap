'use strict'

const locales = { fr: {}, en: {} }

locales.fr['loading'] = 'chargement'
locales.fr['loading.connection'] = 'en attente de connection'
locales.fr['loading.sprites'] = 'images'
locales.fr['loading.map'] = 'carte'
locales.fr['loading.sendingLandmark'] = 'envoi en cours'
locales.fr['loading.generating'] = 'génération de la nouvelle carte'
locales.fr['loading.drawing'] = 'dessin de la carte en cours'

locales.fr['error'] = 'Erreur'
locales.fr['error.noslot'] = 'Plus de place disponible'

locales.fr['gameover'] = 'game over'

locales.fr['landmark.house'] = 'une maison'

locales.fr['biome.plains'] = ['la plaine', 'une plaine']
locales.fr['biome.desert'] = 'le désert'
locales.fr['biome.taiga'] = 'la taïga'
locales.fr['biome.tundra'] = 'la tundra'
locales.fr['biome.swamp'] = 'un marais'
locales.fr['biome.forest'] = 'la forêt'
locales.fr['biome.water'] = ['la mer', 'un lac', 'un étang']

locales.fr['generator.panel.title'] = 'Options'
locales.fr['generator.panel.map'] = 'carte'
locales.fr['generator.panel.voronoi'] = 'afficher la grille'
locales.fr['generator.panel.width'] = 'largeur'
locales.fr['generator.panel.height'] = 'hauteur'
locales.fr['generator.panel.generate'] = 'générer'
locales.fr['generator.panel.save'] = 'sauvegarder'
locales.fr['generator.panel.distortion'] = 'distortion'
locales.fr['generator.panel.scale'] = 'échelle'
locales.fr['generator.panel.basic'] = 'basique'
locales.fr['generator.panel.quantity'] = 'éléments de paysage'
locales.fr['generator.panel.water'] = 'eau'
locales.fr['generator.panel.forest'] = 'forêts'
locales.fr['generator.panel.houses'] = 'habitations'

locales.fr['remote.buttons.generate'] = 'révéler un lieu'

export default (key, LANG = 'fr') => {
  if (!key) return
  if (Array.isArray(key)) key = key[0]

  const locale = locales[LANG][key.toLowerCase()]
  return locale !== undefined
    ? Array.isArray(locale)
      ? locale[Math.floor(Math.random() * locale.length)]
      : locale
    : key
}
