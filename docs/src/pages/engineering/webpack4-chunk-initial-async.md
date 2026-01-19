# Webpack4 设置 initial 和 async 的区别

它们只对于多入口文件的时候会有区别。

`package.json`:

```json
{
  "name": "webpack4-build-demo",
  "scripts": {
    "build": "webpack --mode production"
  },
  "devDependencies": {
    "webpack": "^4.47.0",
    "webpack-cli": "^4.10.0",
    "clean-webpack-plugin": "^4.0.0"
  }
}
```

`webpack.config.js`:

```js
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: {
    entry1: "./src/entry1.js",
    entry2: "./src/entry2.js"
  },
  optimization: {
    splitChunks: {
      chunks: "initial", // 或者 "async"
      minSize: 0,
      name: "common"
    }
  },
  mode: "production", // 设置为生产模式
  plugins: [new CleanWebpackPlugin()]
};
```

`src/entry1.js`：

```js
import "./shared"; // 一个被多个入口共享的模块
import("./dynamic"); // 动态导入

console.log("entry1");
```

`src/entry2.js`：

```js
import "./shared";

console.log("entry2");
```
