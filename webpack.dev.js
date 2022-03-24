var path = require('path');
var webpack = require('webpack');
var dotenv = require('dotenv');
var HtmlWebpackPlugin = require('html-webpack-plugin');

dotenv.config({ path: './.env' });

const frontendUrl = new URL(process.env.PREACT_HOST);

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'src') + '/app.tsx',
  devServer: {
    port: parseInt(frontendUrl.port),
    host: frontendUrl.hostname,
    compress: false,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: process.env.FLASK_HOST,
        secure: false
      }
    }
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js'
  },
  watch: true,
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.scss', '.css'],
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat'
    }
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      inject: false
    }),
    new webpack.EnvironmentPlugin([
      'FIREBASE_API_KEY',
      'FIREBASE_AUTH_DOMAIN',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_STG_BUCKET',
      'FIREBASE_MESSAGING_SDR_ID',
      'FIREBASE_APP_ID',
      'FIREBASE_MEASUREMENT_ID',
      'FLASK_HOST',
      'LOCAL_AUTH_PASSWORD',
      'LOCAL_AUTH_USER'
    ])
  ]
}
