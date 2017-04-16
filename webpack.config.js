var webpack = require("webpack");

module.exports = {
  entry: './src/frontend/main',
  output: {
    path: __dirname + '/dest/public/js',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
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