'use strict'

const path = require('path')

module.exports = {
  dev: {

    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: { // 代理配置信息
    },

    // Various Dev Server settings
    host: 'localhost', // can be overwritten by process.env.HOST
    port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-
    devtool: 'cheap-module-eval-source-map',
    cacheBusting: true,
    cssSourceMap: true
  },

  build: {
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsRootServer: path.resolve(__dirname, '../dist/server'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',

    productionSourceMap: false,
    devtool: '#source-map',
  }
}
