const path = require('path')

const devConfig = () => {
  return {
    entry: './src/index.js',
    mode: 'development',
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
    },
    serve: {
      port: 8080,
    },
  }
}

module.exports = devConfig
