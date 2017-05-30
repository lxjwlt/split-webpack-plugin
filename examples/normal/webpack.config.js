const path = require('path');
const webpack = require('webpack');
const DividePlugin = require('../..');

module.exports = {
  entry: {
    app: './index.js',
    cmd: './cmd.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist')
  },
  plugins: [
    new DividePlugin({
      maxSize: 1024
    })
  ]
};
