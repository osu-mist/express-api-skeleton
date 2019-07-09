const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './app.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
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
      errors: path.resolve(__dirname, 'errors/'),
      middlewares: path.resolve(__dirname, 'middlewares/'),
      utils: path.resolve(__dirname, 'utils'),
      paths: path.resolve(__dirname, 'api/v1/paths/'),
    },
  },
  externals: [nodeExternals()],
};
