const path = require('path');
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')

module.exports = {
  entry: { 
    "index": ['babel-polyfill', path.resolve(__dirname, '../src/index.ts')],
  },
  output: {
    filename: process.env.NODE_ENV === 'production' 
      ? 'static/[name].js' 
      : 'static/[name].js',
    /*
      filename: process.env.NODE_ENV === 'production' 
      ? 'static/[chunkhash].js' 
      : 'static/[name]-[hash].js',
      */
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath,
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': path.resolve(__dirname, '../src'),
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.(ttf|woff|woff2|eot|otf|svg|bmp|png|jpg|jpeg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 0,
              outputPath: process.env.NODE_ENV === 'production' ? 
                config.build.assetsSubDirectory : config.dev.assetsSubDirectory,
            }
          }
        ]
      },
      {
        test: /\.css$/, use: [
          { loader: "style-loader" },
          { loader: 'css-loader' },
        ]
      },
      /*{
        test: /\.ts$/,
        exclude: /node_modules/,
        enforce: 'pre',
        use: [
          {
            loader:'tslint-loader',
          }
        ]
      },*/
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader:'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
            }
          }
        ],
      },
      {
        test: /\.(scss|sass)$/, use: [
          { loader: "style-loader" },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ]
      },
    ]
  },
  plugins: [
  ]
};