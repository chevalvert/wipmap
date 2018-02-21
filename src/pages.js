const title = 'WIPMAP'

module.exports = [
  {
    output: 'index.html',
    content: { title: title + ' — viewer' },
    layout: 'pages/viewer.hbs'
  },
  {
    output: 'remote.html',
    content: { title: title + ' — remote' },
    layout: 'pages/remote.hbs'
  },
  {
    output: 'remote/plotter.html',
    content: { title: title + ' — remote-plotter' },
    layout: 'pages/remote.hbs'
  }
]
