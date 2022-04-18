// NOTE:webpackは「read by node.js(learned by net ninjs)」な為CommonJSの記法になっている？
const { resolve } = require("path");
// NOTE:絶対パス（absolute path）を使うためにpathモジュールを呼ぶ
const HtmlWebpackPlugins = require("html-webpack-plugin");
// NOTE: HTML テンプレートを出力する。
// NOTE: dist 配下に index.html がなければ生成する。
// NOTE:変更が加えられていれば初期化（ template.html の中身と同期）してくれる

module.exports = {
  mode: "development",
  // NOTE: package.json に記述した "build": "webpack --mode production" > "build": "webpack" に省略できる
  entry: {
    bundle: resolve(__dirname, "src/index.ts"),
  },
  output: {
    // publicPath: "dist",
    // NOTE:自動でコンパイルする。上記で設定すると HTML テンプレートでの JS の読み込みが一段ネストする（ dist/〇〇js ）
    path: resolve(__dirname, "dist"),
    filename: "[name][contenthash].js",
    // NOTE:entry オブジェクト内のキーがブラケット（[name]）に入るので上記の場合 bundle.js に filename が置換される
    // NOTE:contenthashブラケットを追加してキャッシュ対応にする ＞ リロードしても表示し続ける
    clean: true,
    // NOTE:cleanオプションを追加することでビルドする度にdist配下のjsファイルが増えるのを消せる
    assetModuleFilename: "[name][ext]",
  },
  devtool: "source-map",
  // devtool: "eval-source-map",
  // NOTE:evalを追加したオプションも存在する
  // NOTE:dist配下にjs.mapファイルが生成される
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
        // NOTE:jsファイルの中でimage（png, svg, jpeg ...）やcssを読み込むために設置
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
        // NOTE:distディレクトリ配下へsrcディレクトリのassets配下のにあるimage（png, svg, jpeg ...）をコピーする
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  // NOTE:resolveをしないとTSで記述したモジュールを使えない
  // NOTE:Reactの場合はここにjsxは追記される
  plugins: [
    new HtmlWebpackPlugins({
      title: "Webpack App",
      filename: "index.html",
      template: "src/template.html",
    }),
  ],
};
