const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './dist/app.js',
  output: {
    filename: 'bundle.js',
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
      errors: path.resolve(__dirname, 'dist/errors/'),
      middlewares: path.resolve(__dirname, 'dist/middlewares/'),
      utils: path.resolve(__dirname, 'dist/utils/'),
      paths: path.resolve(__dirname, 'dist/api/v1/paths/'),
    },
  },
  externals: [nodeExternals()],
};
