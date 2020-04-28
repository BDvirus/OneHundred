const Path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackConfigDumpPlugin = require('webpack-config-dump-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
 
 

module.exports = {
  entry: {
    app: Path.resolve(__dirname, '../src/scripts/main.ts'),
  },

  output: {
    //path: Path.join(__dirname, '../build'),
    filename: 'js/[name].js',
    libraryTarget: 'amd',
  },
 
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      { from: './src/assets', to: 'assets' },
    ]),
    new HtmlWebpackPlugin({
      template: Path.resolve(__dirname, '../src/index.html')      
    }),
/*
    new WebpackConfigDumpPlugin({
      outputPath: './',
      name: 'webpack.config.dump',
      depth: 4,
    }),
 */
  ],
  externals: [
    function (context, request, callback) {
      // exclude any esri or dojo modules from the bundle
      // these are included in the ArcGIS API for JavaScript
      // and its Dojo loader will pull them from its own build output
      if (
        /^dojo/.test(request) ||
        /^dojox/.test(request) ||
        /^dijit/.test(request) ||
        /^esri/.test(request) ||
        // ordinarily you would only need to speficy the above prefixes,
        // but because we include a third-party Dojo module in this example
        // we need to add it's package to the list of prefixes to exclude
        /^cluster-layer-js/.test(request)
      ) {
        return callback(null, 'amd ' + request);
      }
      callback();
    },
  ],
   
  resolve: {
    alias: {
      '~': Path.resolve(__dirname, '../src'),
    },
  },
   
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },

      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            outputPath: 'assets/images/',
          },
        },
      },
    ],
  },
};


