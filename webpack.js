const webpack = require('webpack')
const path = require('path')
const appName = process.env.npm_package_name
const buildMode = process.env.NODE_ENV
const isDev = buildMode === 'development'

const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
    target: 'web',
    context: __dirname + "/src",
    entry: {
        fileAction: path.resolve(path.join('src', 'fileAction.js')),
        init: path.resolve(path.join('src', 'init.js')),
    },
    output: {
      path: __dirname + "/js",
      publicPath: path.join('/apps/', appName, '/js/'),
      clean: false,
      filename: `[name].js?v=[contenthash]`,
	    chunkFilename: `[name].js?v=[contenthash]`,
    },
    devtool: isDev ? 'cheap-source-map' : 'source-map',
    plugins: [
        new webpack.ProvidePlugin({
          process: 'process/browser.js',
        }),
        // Make sure we auto-inject node polyfills on demand
        // https://webpack.js.org/blog/2020-10-10-webpack-5-release/#automatic-nodejs-polyfills-removed
        new NodePolyfillPlugin({
          // Console is available in the web-browser
          excludeAliases: ['console'],
        }),
    ]
}