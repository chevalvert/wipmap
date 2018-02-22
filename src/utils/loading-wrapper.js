'use strict'

import LogScreen from 'components/log-screen'

export default (title, steps) => new Promise((resolve, reject) => {
  const loading = new LogScreen(title, '', 'loading')
  loading.mount(document.body)

  let previousResolution
  ;(function iterate (i) {
    if (i >= steps.length) {
      loading.destroy()
      return resolve(previousResolution)
    }

    if (typeof steps[i] === 'string') {
      loading.say(steps[i])
      return iterate(++i)
    }

    Promise
    .resolve(steps[i](previousResolution))
    .then(resolution => {
      previousResolution = resolution
      iterate(++i)
    })
    .catch(err => {
      loading.destroy()
      reject(err)
    })
  })(0)
})
