var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var autoprefixer = require('autoprefixer');

module.exports = {
  devtool: 'source-map',//'eval'
  entry: [
    './index.html'
  ],
  resolve: {
    extensions: ['', '.js'],
    root: [
      path.resolve('/')
    ]
  },
  output: {
    path: path.join(__dirname, 'docs'),
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin("bundle.css", {
      publicPath: '/docs/',
      allChunks: true
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: path.join(__dirname, 'js')
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css?sourceMap', 'postcss-loader?sourceMap=inline', 'sass?sourceMap']
        //loaders: ['style', 'css?sourceMap', 'sass?sourceMap']
        /*ExtractTextPlugin.extract(
                    'style', // The backup style loader
                    'css?sourceMap!sass?sourceMap'
                )*/
      }
    ]
  },
  postcss: [ autoprefixer({ browsers: ['last 2 versions'] }) ],
  sassLoader: {
    includePaths: [ 'src/assets/styles' ]
  }
};
