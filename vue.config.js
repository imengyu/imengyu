const JavaScriptObfuscator = require('webpack-obfuscator');

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
module.exports = {
  productionSourceMap: false,
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.plugins = config.plugins.concat([
        new JavaScriptObfuscator()
      ])
    }
  }
}