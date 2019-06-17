const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const GHPagesSPAWebpackPlugin = require('ghpages-spa-webpack-plugin');

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const srcPath = path.resolve(__dirname, 'src');

module.exports = {
  mode,
  entry: [
    path.join(srcPath, 'index.js'),
  ],
  output: {
    filename: `[name]${(mode === 'production' ? '.[hash]' : '')}.js`,
  },
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
  devServer: {
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.bin$/,
        loader: 'file-loader',
        options: {
          name: `assets/[name]${(mode === 'production' ? '.[hash]' : '')}.[ext]`,
        },
        include: srcPath,
      },
      {
        test: /\.(vert|frag|glsl)$/,
        loader: 'webpack-glsl-loader',
        options: {
          name: `shaders/[name]${(mode === 'production' ? '.[hash]' : '')}.[ext]`,
        },
        include: srcPath,
      },
      {
        test: /\.worker\.js$/,
        loader: 'worker-loader',
        options: {
          name: `[name]${(mode === 'production' ? '.[hash]' : '')}.[ext]`,
        },
        include: srcPath,
      },
    ],
  },
  stats: { children: false, entrypoints: false, modules: false },
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
    new GHPagesSPAWebpackPlugin({
      domain: 'webgl.gatunes.com',
    }),
    new webpack.SourceMapDevToolPlugin({
      test: /\.js$/,
      filename: '[hash].js.map',
    }),
  ],
};
