const title = 'WIPMAP'

module.exports = [
  {
    output: 'index.html',
    content: { title },
    layout: 'pages/viewer.hbs'
  },

  {
    output: 'remote.html',
    content: { title },
    layout: 'pages/remote.hbs'
  }
]
