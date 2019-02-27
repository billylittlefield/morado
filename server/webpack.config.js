const path = require('path');
const nodeExternals = require('webpack-node-externals');

  module.exports = {
    mode: 'development',
    target: "node",
    context: __dirname,
    entry: {
      server: "./src/server.js"
    },
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "bundle-server.js"
    },
    // Don't bundle /node_modules, they will be `npm install`-ed at build time for server:
    externals: [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
      ]
    },
    resolve: {
      modules: [
        path.resolve(__dirname, 'src'),
        'node_modules',
      ],
      alias: {
        '@shared': path.resolve(__dirname, '../shared')
      }
    },
};
