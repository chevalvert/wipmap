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

locales.fr['progress'] = 'objets'
locales.fr['gameover'] = 'game over'
locales.fr['gameover.message'] = 'nouvelle carte dans %s...'

locales.fr['landmark.h'] = 'habitation'
locales.fr['landmark.h.big'] = 'grande'
locales.fr['landmark.h.small'] = 'petite'
locales.fr['landmark.h.square'] = 'carrée'
locales.fr['landmark.h.round'] = 'ronde'

locales.fr['landmark.v'] = 'végétation'
locales.fr['landmark.v.big'] = 'grande'
locales.fr['landmark.v.small'] = 'petite'
locales.fr['landmark.v.leafy'] = 'feuillue'
locales.fr['landmark.v.flowery'] = 'fleurie'

locales.fr['landmark-drawer.h'] = 'une habitation'
locales.fr['landmark-drawer.h.big'] = 'grande'
locales.fr['landmark-drawer.h.small'] = 'petite'
locales.fr['landmark-drawer.h.square'] = 'carrée'
locales.fr['landmark-drawer.h.round'] = 'ronde'

locales.fr['landmark-drawer.v'] = 'de la végétation'
locales.fr['landmark-drawer.v.big'] = 'grande'
locales.fr['landmark-drawer.v.small'] = 'petite'
locales.fr['landmark-drawer.v.leafy'] = 'feuillue'
locales.fr['landmark-drawer.v.flowery'] = 'fleurie'

locales.fr['biome.plains'] = 'une plaine'
locales.fr['biome.desert'] = 'le désert'
locales.fr['biome.taiga'] = 'la taïga'
locales.fr['biome.tundra'] = 'la tundra'
locales.fr['biome.swamp'] = 'un marais'
locales.fr['biome.forest'] = 'la forêt'
locales.fr['biome.jungle'] = 'la jungle'
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
locales.fr['remote.buttons.random'] = 'aléatoire'
locales.fr['remote.buttons.validate'] = 'valider'
locales.fr['remote.buttons.draw'] = 'dessiner'
locales.fr['remote.buttons.undo'] = '←'

locales.fr['remote.landmark-generator.prefix.context'] = 'biome = '
locales.fr['remote.landmark-generator.prefix.type'] = 'objet = '
locales.fr['remote.landmark-generator.prefix.variable'] = '  objet.'
locales.fr['remote.landmark-generator.prefix.modifier-length'] = 'objet.nombre  = '
locales.fr['remote.landmark-generator.prefix.modifier-density'] = 'objet.densité = '
locales.fr['remote.landmark-generator.prefix.modifier-order'] = 'objet.chaos   = '

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
