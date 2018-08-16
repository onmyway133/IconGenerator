module.exports = {
  mode: "development",
  entry: "./src/renderer.js",
  node: {
    fs: "empty"
 },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
}