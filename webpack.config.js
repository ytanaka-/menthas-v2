var webpack = require("webpack");
var path = require("path");

module.exports = {
  entry: './src/frontend/main.js',
  output: {
    path: __dirname + '/dest/public/js',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/, loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query:{
          presets: ['es2015']
        }
      }
    ]
  }
}