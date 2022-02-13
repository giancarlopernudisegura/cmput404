var path = require('path');
var webpack = require('webpack');
var dotenv = require('dotenv');
var HtmlWebpackPlugin = require('html-webpack-plugin');

dotenv.config({ path: './.env' }); 

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: ['./src/app.tsx'],
  devServer: {
    port: 3000,
    host: '0.0.0.0',
    compress: false,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
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
    extensions: ['.tsx', '.ts', '.js', '.scss', '.css']
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: 'awesome-typescript-loader'
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      inject: false
    }),
    new webpack.EnvironmentPlugin([
      'FIREBASE_API_KEY',
      'FIREBASE_API_KEY',
      'FIREBASE_AUTH_DOMAIN',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_STG_BUCKET',
      'FIREBASE_MESSAGING_SDR_ID',
      'FIREBASE_APP_ID',
      'FIREBASE_MEASUREMENT_ID'
    ])
  ]
}
