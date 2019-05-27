const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const srcPath = path.resolve(__dirname, 'src');

module.exports = {
  mode,
  entry: [
    path.join(srcPath, 'index.js'),
  ],
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
  module: {
    rules: [
      {
        test: /\.(vert|frag|glsl)$/,
        loader:  [
          'raw-loader',
          'glslify-loader',
        ],
        include: srcPath,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
      },
      __PRODUCTION__: JSON.stringify(mode === 'production'),
    }),
    new HtmlWebpackPlugin({
      template: path.join(srcPath, 'index.ejs'),
      title: 'WebGL',
    }),
  ],
};
