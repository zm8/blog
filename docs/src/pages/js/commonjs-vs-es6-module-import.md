# common.js 和 es6 中模块引入的区别

1. CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。
2. CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。

### 1. 解释

    CommonJS 导出的是值的拷贝, 所以下面的例子 couter 的值始终是一样的;
    除非定义一个 getCounter 方法, 动态的获取 counter 的值;

```js
// lib.js
exports.counter = 3
exports.incCounter = () => {
  ++exports.counter
}
exports.getCounter = () => {
  return exports.counter
}

// index.js
const { counter, incCounter, getCounter } = require('./lib')
console.log(counter) // 3
incCounter()
console.log(counter) // 3
console.log(getCounter()) // 4
```

而 ES6 却可以

```js
// lib.js
export let counter = 3
export function incCounter() {
  counter++
}

// index.js
import { counter, incCounter } from './lib'
console.log(counter) // 3
incCounter()
console.log(counter) // 4
```

### 2. 解释

Commonjs 做不了 tree-shaking, 因为 这种引入是动态的，也意味着我们可以基于条件来导入需要的代码：

```js
let dynamicModule
// 动态导入
if (condition) {
  myDynamicModule = require('foo')
} else {
  myDynamicModule = require('bar')
}
```

::: 参考地址
https://www.bookstack.cn/read/es6-3rd/spilt.2.docs-module-loader.md
https://www.bookstack.cn/read/es6-3rd/spilt.2.docs-module-loader.md
:::
