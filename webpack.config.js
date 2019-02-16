const HtmlWebPackPlugin = require('html-webpack-plugin')
const path = require('path')

const devConfig = () => {
  return {
    mode: 'development',
    context: path.resolve(__dirname),
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
            },
          ],
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader', // creates style nodes from JS strings
            'css-loader', // translates CSS into CommonJS
            'sass-loader', // compiles Sass to CSS, using Node Sass by default
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: './src/index.html',
        filename: 'index.html',
      }),
    ],
    resolve: {
      modules: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'shared'),
        'node_modules',
      ],
      alias: {
        '@shared': path.resolve(__dirname, 'shared')
      }
    },
  }
}

module.exports = devConfig
