# 学习 CommonJS 和 ES Modules

## CommonJS

- Node 在服务端是用 CommonJS 来实现
- Browserify 让 CommonJS 在浏览器可以实现。
- Webpack 对 CommonJS 的支持和转换。

### 1 CommonJS 使用与原理

`exports` 和 `module.exports` 负责将内容模块的导出。
`require` 函数帮忙导入其他模块内容。
那这些变量是哪里来的呢?
nodejs 编译的时候会对 js 代码首尾包装。runInThisContext 相当于 eval 代码执行。

比如 home.js 如下:

```js
const sayName = require("./hello.js");
module.exports = function say() {
  return {
    name: sayName(),
    author: "我不是外星人"
  };
};
```

那么他会包装成如下:

```js
function wrapper(script) {
  return "(function (exports, require, module, __filename, __dirname) {" + script + "\n})";
}

const modulefunction = wrapper(`
  const sayName = require('./hello.js')
    module.exports = function say(){
        return {
            name:sayName(),
            author:'我不是外星人'
        }
    }
`);

runInThisContext(modulefunction)(module.exports, require, module, __filename, __dirname);
```

### require 加载原理

require 源码如下:

如果之前已经加载过，直接使用它，而不会再去执行它，另外它只会**执行 1 次**。
注意是先放入缓存中，然后再执行他。

```js
 // id 为路径标识符
function require(id) {
   /* 查找  Module 上有没有已经加载的 js  对象*/
   const  cachedModule = Module._cache[id]

   /* 如果已经加载了那么直接取走缓存的 exports 对象  */
  if(cachedModule){
    return cachedModule.exports
  }

  /* 创建当前模块的 module  */
  const module = { exports: {} ,loaded: false , ...}

  /* 将 module 缓存到  Module 的缓存属性中，路径标识符作为 id */
  Module._cache[id] = module
  /* 加载文件 */
  runInThisContext(wrapper('module.exports = "123"'))(module.exports, require, module, __filename, __dirname)
  /* 加载完成 *//
  module.loaded = true
  /* 返回值 */
  return module.exports
}
```

### require 避免循环引用

由于 require 加载模块是同步的，如果当前已经 require 过了，则会放到缓存里面，设置一个标志，不会再执行。

### exports 和 module.exports

```js
exports.name = `《React进阶实践指南》`;
exports.author = `我不是外星人`;
exports.say = function () {
  console.log(666);
};

// 相当于
module.exports = {
  name: `《React进阶实践指南》`,
  author: `我不是外星人`,
  say: function () {
    console.log(666);
  }
};
```

为什么不能直接赋值对象给 exports 呢?

```js
exports = {
  name: `《React进阶实践指南》`,
  author: `我不是外星人`,
  say: function () {
    console.log(666);
  }
};
```

这是由于 js 这个语言的特殊性，内部的形参是重新声明了下，和外部没有关系。

```js
function wrap(myExports) {
  myExports = {
    name: "我不是外星人"
  };
}

let myExports = {
  name: "alien"
};
wrap(myExports);
console.log(myExports);
```

exports 和 module.exports 不要同时使用，否则容易出现覆盖的情况。

```js
exports.name = "alien"; // 此时 exports.name 是无效的
module.exports = {
  name: "《React进阶实践指南》",
  author: "我不是外星人",
  say() {
    console.log(666);
  }
};
```

### exports 和 module.exports 的区别

exports 只能到处一个对象，即 `exports.a, exports.b`，而 `module.exports` 可以导出一个数组 或者 函数。

```js
module.exports = [1, 2, 3]; // 导出数组

module.exports = function () {}; //导出方法
```

## ES Modules

从 ES6 开始，Javascript 才有真正意义上的模块化规范。
ES Modules 的优势:

- 静态导入导出的优势，实现 `tree shaking`。
- 通过`import()` 懒加载方式实现代码分割。

## ES6 module 特性

import 会**自动提升到代码顶层**，import，export 不能放在 **块级作用域** 或 **条件语句**。
这种静态语法，适合进行 tree-shaking。也可以对导入导出做静态类型检查。

```js
// 错误写法
function say() {
  import name from "./a.js";
  export const author = "我不是外星人";
}
```

```js
// 错误写法
isexport &&  export const  name = '《React进阶实践指南》'
```

## import() 动态引入

main.mjs:

```js
setTimeout(() => {
  const b = import("./b.mjs");
  b.then((res) => console.log(res));
});
export default function () {}
```

b.mjs:

```js
export const name = "alien";
export default function sayhello() {
  console.log("hello,world");
}
```

最终会打印出:
![image](https://github.com/zm8/blog_old/assets/32337542/29ed796d-4b1f-404c-813d-a3c78d3379b5)

### 可以用来做什么?

动态加载:

```js
if (isRequire) {
  const result = import("./b");
}
```

路由懒加载:

```js
[
  {
    path: "home",
    name: "首页",
    component: () => import("./home")
  }
];
```

React 中动态加载，而实现代码分割。

```jsx
const LazyComponent =  React.lazy(()=>import('./text'))
class index extends React.Component{
    render(){
        return <React.Suspense fallback={ <div className="icon"><SyncOutlinespin/></div> } >
               <LazyComponent />
           </React.Suspense>
    }
```

## 五 CommonJS 和 ES Modules 总结

CommonJS 的特性如下：

- 同步加载执行文件。
- 每个加载都存在缓存，解决循环引用问题。

ES Modules 的特性如下:

- 静态导入导出的优势，实现了 tree shaking
- 还可以使用 import() 懒加载方式实现代码分割

相同点:
ES Modules 和 CommonJS 引入同一个模块多次，也只执行 1 次。不同点是 ES Modules 的 `import a from './a.mjs';` 会动态提升到头部。

::: 参考地址:
<https://juejin.cn/post/6994224541312483336>
:::
