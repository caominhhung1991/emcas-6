const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
  entry: {
    app: './src/app.js'
  },
  output: {
    path: __dirname + '/public',
    filename: '[name].bundle.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015', 'stage-3']
      }
    },
    {
      test: /\.scss$/,
      loader: 'style-loader!css-loader!sass-loader'
    },
    {
      test: /\.html$/,
      loader: 'html-loader'
    }
    ]
  },
  plugins: [
    new UglifyJsPlugin({
      test: /\.js($|\?)/i
    })
  ],
  devServer: {
    contentBase: 'public',
    host: 'localhost',
    port: '3000'
  }
};