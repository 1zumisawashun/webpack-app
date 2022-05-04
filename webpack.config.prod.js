const { resolve } = require("path");
const HtmlWebpackPlugins = require("html-webpack-plugin");
const CleanPlugins = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    bundle: resolve(__dirname, "src/index.ts"),
  },
  output: {
    path: resolve(__dirname, "dist"),
    filename: "[name][contenthash].js",
    clean: true,
    assetModuleFilename: "[name][ext]",
  },
  devServer: {
    static: {
      directory: resolve(__dirname, "dist"),
    },
    port: 3000,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
  },
  module: {
    rules: [
      { test: /\.scss$/, use: ["style-loader", "css-loader", "sass-loader"] },
      {
        test: /\.ts$/,
        use: "ts-loader",
        include: [resolve(__dirname, "src")],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    // NOTE:調整中のため使用は気をつけること
    // NOTE:prod用のwebpackを使うのが一般らしい
    new HtmlWebpackPlugins({
      title: "Webpack App",
      filename: "index.html",
      template: "src/template.html",
    }),
    new CleanPlugins.CleanWebpackPlugin(),
  ],
};
