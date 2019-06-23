const HtmlWebPackPlugin = require('html-webpack-plugin')
const path = require('path')
const glob = require('glob')

module.exports = {
  mode: 'development',
  devServer: {
    historyApiFallback: true,
  },
  entry: './src/index.js',
  context: path.resolve(__dirname),
  output: {
    publicPath: '/',
    filename: 'main.bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
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
          {
            loader: 'style-loader', // creates style nodes from JS strings
          },
          {
            loader: 'css-loader', // translates CSS into CommonJS
          },
          {
            loader: 'sass-loader', // compiles Sass to CSS, using Node Sass by default
            options: {
              sourceMap: true,
              includePaths: glob.sync(
                path.join(__dirname, '**/node_modules/@material')
              ).map((dir) => path.dirname(dir))
            }
          },
          
        ],
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,  
        use: [ 'file-loader' ]
      }
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    })
  ],
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules',
    ],
    alias: {
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
}
