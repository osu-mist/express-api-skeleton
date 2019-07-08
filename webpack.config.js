const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './app.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: [nodeExternals()]
};
