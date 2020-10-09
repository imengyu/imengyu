'use strict'
const path = require('path')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const JavaScriptObfuscator = require('webpack-obfuscator');

const env = process.env.NODE_ENV === 'testing'
  ? require('../config/test.env')
  : require('../config/prod.env')

const webpackConfig = merge(baseWebpackConfig, {
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
  },
  mode: 'production',
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new HtmlWebpackPlugin({
      chunks: ['index'],
      template: path.resolve(__dirname, '../src/index.html'),
      filename: 'index.html',
      inject: false,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsRoot + '/' + config.build.assetsSubDirectory,
      }
    ]),
    new VueLoaderPlugin(),
    // copy favicon
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, '../static/favicon.ico'),
      to: config.build.assetsRoot,
    }]),
    // copy static css
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../src/assets/css'),
        to: config.dev.assetsSubDirectory,
      }
    ]),
    // copy static js
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../src/assets/js'),
        to: config.dev.assetsSubDirectory,
      }
    ]),
    new JavaScriptObfuscator(),
  ],
  optimization: {
    minimize: true,
    minimizer: [ new TerserPlugin({
      sourceMap: config.build.productionSourceMap,
      parallel: true
    }) ]
  }
})

module.exports = webpackConfig
