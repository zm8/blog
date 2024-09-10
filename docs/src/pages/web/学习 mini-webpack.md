# 学习 mini-webpack

### 导读

代码参考文件夹:
[examples/mini-webpack](https://github.com/zm8/blog/blob/master/example/mini-webpack/index.js)

### 1. 基本思路如下

1: 通过 babel/parse 获得'入口文件'的 AST 语法树. 2. 根据 AST 语法树获得'入口文件'的依赖(dependencies) 和浏览器可执行的 code. 3. 根据'入口文件'的 dependencies, 递归 1, 2, 获得所有的依赖关系 和 依赖可以执行的 code. 4. 递归执行'入口文件'code, 和依赖文件的 code.

### 2. 解析完的代码

**浏览器最终打印:**

```js
this is test1.js  test2() {
  console.log('this is test2 ');
}
{}
```

**最终递归可执行的 code:**

```js
;(function (gragh) {
  function require(module) {
    // 相对路径转换成绝对路径的方法
    function localRequire(relativePath) {
      return require(gragh[module].dependencies[relativePath])
    }
    const exports = {}
    ;(function (require, exports, code) {
      eval(code)
    })(localRequire, exports, gragh[module].code)

    return exports
  }
  require('./app.js')
})({
  './app.js': {
    dependencies: {
      './test1.js': './test1.js'
    },
    code: '"use strict";\n\nvar _test = _interopRequireDefault(require("./test1.js"));  \n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n\nconsole.log(_test["default"]);'
  },
  './test1.js': {
    dependencies: {
      './test2.js': './test2.js'
    },
    code: '"use strict";\n\nvar _test = _interopRequireDefault(require("./test2.js"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n\nconsole.log(\'this is test1.js \', _test["default"]);'
  },
  './test2.js': {
    dependencies: {},
    code: '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports["default"] = void 0;\n\nfunction test2() {\n  console.log(\'this is test2 \');\n}\n\nvar _default = test2;\nexports["default"] = _default;'
  }
})
```

1. app.js

```js
var _test = _interopRequireDefault(require('./test1.js'))
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}
console.log(_test['default'])
```

2. test1.js

```js
var _test = _interopRequireDefault(require('./test2.js'))
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}
console.log('this is test1.js ', _test['default'])
```

3. test2.js

```js
Object.defineProperty(exports, '__esModule', { value: true })
exports['default'] = void 0
function test2() {
  console.log('this is test2 ')
}
var _default = test2
exports['default'] = _default
```

:::参考地址
https://mp.weixin.qq.com/s/l-jpWVCb1JvNF7m_6Alc_w
https://segmentfault.com/a/1190000014318751
:::
