const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const styledComponentsTransformer = createStyledComponentsTransformer();

module.exports = merge({
  entry: path.resolve(__dirname, 'src/index.tsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              getCustomTransformers: () => ({ before: [styledComponentsTransformer] }),
            },
          },
        ],
      },
    ],
  },
  devServer: {
    host: 'localhost',
    port: '8080',
  },
});
