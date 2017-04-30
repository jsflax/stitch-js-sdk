/*global __dirname, require, module*/

const webpack = require('webpack');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const path = require('path');
const env  = require('yargs').argv.env; // use --env with webpack 2
const libraryName = 'baas';

let plugins = [];
let outputFile;
if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true, sourceMap: true }));
  outputFile = libraryName + '.min.js';
} else {
  outputFile = libraryName + '.js';
}

const config = {
  entry: __dirname + '/src/index.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/dist/web',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        test: require.resolve('whatwg-fetch'),
        use: 'imports-loader?self=>global'
      },
      {
        test: require.resolve('isomorphic-fetch'),
        use: 'imports-loader?self=>global'
      }
    ]
  },
  resolve: {
    modules: [ path.resolve('./src'), path.resolve('./node_modules') ],
    extensions: ['.json', '.js']
  },
  plugins: plugins,
  node: {
    Buffer: false,
    process: false
  }
};

module.exports = config;
