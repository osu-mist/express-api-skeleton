const config = require('config');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './dist/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  module: {
    noParse: new RegExp(`dist\/api\/v1\/db\/(?!${
      config.dataSources.dataSources.join('|')
    })`),
  },
  mode: 'development',
  devtool: 'source-map',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    alias: {
      Errors: path.resolve(__dirname, 'dist/errors/'),
      Middlewares: path.resolve(__dirname, 'dist/middlewares/'),
      Utils: path.resolve(__dirname, 'dist/utils/'),
      Paths: path.resolve(__dirname, 'dist/api/v1/paths/'),
    },
  },
  externals: [nodeExternals()],
};
