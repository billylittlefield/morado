const devConfig = require('./webpack.config.js')

const prodConfig = () => {
  const base = devConfig()
  base.mode = 'production'

  return base
}

module.exports = prodConfig
