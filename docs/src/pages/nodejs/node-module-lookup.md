# Node 的模块查找策略

当使用 `require` 导入一个模块时，`Node.js` 是如何找到该模块的呢？

## 1. 文件查找

当模块路径以 `./`、`../` 或绝对路径开头时，`Node.js` 首先会在当前目录进行文件查找。

例如：

- 创建 `main.js`，内容为 `require('./a')`。
- 创建 `a` 文件（没有后缀），内容为 `console.log('a')`。
- 运行 `node main.js`，输出 `a`。

如果 `require('./a')` 找不到 `a` 文件，Node.js 会自动尝试补全后缀名，如 `a.js` 或 `a.json`。

例如：

- 修改 `main.js` 为 `const a = require('./a'); console.log(a);`。
- 创建 `a.json` 文件，内容为 `{ "name": "a" }`。
- 运行 `node main.js`，输出 `{ name: 'a' }`。

## 2. 文件夹查找

如果文件查找失败，`Node.js` 会查找指定路径是否为一个文件夹，并在其中查找 `index.js` 或 `index.json`。

如果文件夹中有 `package.json` 文件，并且指定了 `main` 属性，则 `main` 指定的文件将作为入口文件。

例如：

- 创建 `main.js`，内容为 `require('./a')`。
- 创建 `a` 文件夹，并在其中创建 `package.json` 文件，内容为 `{ "main": "b.js" }`。
- 创建 `b.js` 文件，内容为 `console.log('b')`。
- 运行 `node main.js`，输出 `b`。

## 3. 内置模块查找

如果模块路径不以 `./`、`../` 或绝对路径开头，`Node.js` 会进行内置模块查找。例如：

```js
require("fs");
require("http");
require("path");
```

如果尝试查找一个不存在的内置模块（例如 `require('a')`），将会抛出错误。

## 4. 第三方模块查找

如果以上查找都没有找到模块，`Node.js` 会在当前目录及其父级目录中查找 `node_modules` 文件夹。

当找到 `node_modules` 文件夹时，它会继续使用 `文件查找` 和 `文件夹查找` 策略。

首先，我们创建一个 `main.js`，内容为 `require('a')`，下面我们分别测试 `4.1`、`4.2`、`4.3`。

### 4.1

- 创建 `node_modules/a.js`，内容为 `console.log('node_modules/a.js')`。
- 运行 `node main.js`，输出 `node_modules/a.js`。

### 4.2

- 创建 `node_modules/a/index.js`，内容为 `console.log('node_modules/a/index.js')`。
- 运行 `node main.js`，输出 `node_modules/a/index.js`。

### 4.3

- 创建 `node_modules/a/package.json`，内容为 `{ "main": "./b.js" }`。
- 创建 `node_modules/a/b.js`，内容为 `console.log('node_modules/a/b.js')`。
- 运行 `node main.js`，输出 `node_modules/a/b.js`。

### 4.4

- 在父级目录的 `node_modules/a/index.js` 中，内容为 `console.log('../node_modules/a/index.js')`。
- 运行 `node main.js`，输出 `../node_modules/a/index.js`。
