const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    overlay: true,
    port: 8081,
    stats: 'errors-only',
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
