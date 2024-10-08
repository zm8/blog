# 常见面试总结

## webpack5 新增了哪些功能

--- 待定

## nginx 做过哪些优化

--- 待定

## canvas 优化

1. 循环绘制一些图形的时候, 尽可能减少 canvas API 的使用。
2. 使用离屏绘制进行预渲染。
3. 逻辑层和背景图层分离, 可以使用分层渲染。
4. 用 webWorker 来处理一些比较耗时的计算。
5. 避免浮点运算, 浮点数取整。因为在动画的过程中就可能出现抖动的情况。

```js
function getInt(num) {
  var rounded;
  rounded = (0.5 + num) | 0;
  return rounded;
}
```

6.合理使用缓存。

## 做过哪些 webpack 优化

### 一.提高构建速度

#### 1. webpack 持久化缓存 cache: filesystem

#### 2. 指定 include

为 loader 指定 include，减少 loader 应用范围，仅应用于最少数量的必要模块。

```js
module.exports = {
  rules: [
    {
      test: /\.(js|ts|jsx|tsx)$/,
      include: paths.appSrc,
      use: [
        {
          loader: "esbuild-loader",
          options: {
            loader: "tsx",
            target: "es2015"
          }
        }
      ]
    }
  ]
};
```

#### 3. thread-loader 多进程 打包

通过 thread-loader 将耗时的 loader 放在一个独立的 worker 池中运行，加快 loader 构建速度。

### 二. 减少打包体积

#### 1. 使用 SplitChunksPlugin 抽离重复代码

`node_modules` 公共模块抽离出来

```js
module.exports = {
  splitChunks: {
    // include all types of chunks
    chunks: "all",
    // 重复打包问题
    cacheGroups: {
      vendors: {
        // node_modules里的代码
        test: /[\\/]node_modules[\\/]/,
        chunks: "all",
        // name: 'vendors', 一定不要定义固定的name
        priority: 10, // 优先级
        enforce: true
      }
    }
  }
};
```

#### 2. 对组件库引用的优化

## 前端如何做鉴权的?

Axios 的拦截网络请求开始，判断本地是否有 token，然后添加到请求头里。

```js
service.interceptors.request.use(
  (config) => {
    // 判断token是否存在，如果存在，就给请求头加上token
    if (localStorage.getItem("token")) {
      config.headers.Authorization = localStorage.getItem("token");
    }
    return config;
  },
  (error) => {}
);
```

拦截 response 的请求，判断当前是否没有 token 或者 登录失效了, 则跳到到登录页面。

## 闭包是什么？有什么作用？有什么优缺点？

闭包是一个函数，它可以访问其包含函数中定义的变量，即使在包含函数执行完毕后仍然可以访问这些变量。

### 作用

**保持状态**：闭包允许函数在调用之间保持状态。这意味着函数可以记住它在之前的调用中的数据，这对于实现计数器、缓存、回调函数等非常有用。

**封装数据**：闭包可以用于创建私有变量，将数据封装在函数内部，以防止外部代码访问和修改这些数据。这有助于实现信息隐藏和封装。

**实现回调和事件处理**：闭包允许您将函数作为参数传递给其他函数，用于实现回调函数、事件处理程序等。

### 缺点

**内存消耗**：使用闭包可能导致内存消耗增加，因为闭包会保留对包含函数的作用域的引用，而这个作用域中的变量在包含函数执行完毕后仍然存在。如果滥用闭包，可能导致内存泄漏。

**性能问题**：在某些情况下，使用过多的闭包可能会导致性能下降，因为每个闭包都需要维护其作用域链，这可能会导致额外的开销。

**可读性和维护性**：过度使用闭包可能会导致代码复杂性增加，降低代码的可读性和维护性，因为它可以使代码变得难以理解。

## vue 和 react 的优势

使用了虚拟 dom，可以用来跨端开发。
都是组件化思想;
都是数据驱动视图方式。
独立的路由系统和独立的状态管路库。

## 前端的加密方法

### 1. 哈希函数

将任意长度的消息映射为**固定长度**的输出的算法。
特点: 不可逆，抗碰撞性，固定长度。
类型有:

- SHA（Secure Hash Algorithm）
- MD5（Message Digest Algorithm 5）

SHA/MD5 对比：SHA 在安全性方面优于 MD5，并且可以选择多种不同的密钥长度。 但是，由于内存需求更高，运行速度可能会更慢。 不过，MD5 因其速度而得到广泛使用，但是由于存在碰撞攻击风险，因此不再推荐使用。

### 2. 对称加密

加密和解密的密钥是用同一个。
类型有:

- AES（Advanced Encryption Standard）：高级加密标准算法，速度快，安全级别高，目前已被广泛应用，适用于加密大量数据，如文件加密、网络通信加密等。

### 3.非对称加密

加密和解密使用不同的密钥的算法。
类型有:

- RSA。RSA 是由 3 个人的姓氏开头字母拼接起来。是一个支持变长密钥的公共密钥算法，需要加密的文件块的长度也是可变的。RSA 是一种非对称加密算法，即加密和解密使用一对不同的密钥，分别称为公钥和私钥。

:::tip 参考地址

<https://zh.wikipedia.org/wiki/RSA%E5%8A%A0%E5%AF%86%E6%BC%94%E7%AE%97%E6%B3%95>

<https://juejin.cn/post/7280057907055919144?searchId=202311062228286AB7CDB07D901A338807>

:::

## 上传文件的 content-type

`multipart/form-data; boundary=----WebKitFormBoundaryxkIYCvQLm0nswkRJ`

- multipart/form-data 是文件传输的 content-type 格式
- boundary 是分隔符，分隔多个文件、表单项。如果不自己设置，默认由浏览器自动产生

## sessionStorage 和 localStorage 区别

sessionStorage 关闭 Tab 和浏览器，则会失效。
localStorage 则不会。

## 微任务和宏任务

宏任务: script 代码, setTimeout, setInterval, MessageChannel
微任务: Promise.then, MutationObserver
setTimeout, setInterval 的时间的意思，到达指定时间，会把任务放到事件队列。
浏览器每一帧执行的时候，事件队列先执行微任务再执行宏任务。
注意: 微任务放的事件队列和宏任务放的事件队列不一样。

## webpack

### 原理

`@babel/parser` 把入口文件转换成 AST 抽象语法树，然后获得入口文件的依赖，再递归入口文件的依赖，最后再生成可执行的 js。

### 什么是 loader?

由于 webpack 本身只支持处理 js，json 文件，为了处理其它类型的文件，所以需要 loader。
列举一些 loader:

- css-loader: 解析 css 文件
- style-loader: css 样式插入到 dom
- @babel/preset-env: es6 转 es5
- @babel/preset-react: jsx 语法转换
- @babel/preset-typescript: tsx 语法转换

### 什么是 plugins?

plugin 则可以用于执行范围更广的任务。
如：压缩代码(new TerserWebpackPlugin())，资源管理(new HtmlWebPackPlugin())，注入环境变量（new webpack.DefinePlugin({...}))等。
列举一些:

- terser-webpack-plugin: 压缩代码, webpack5 内置, 当 mode 为 production 时会自动启用。
- html-webpack-plugin: 根据指定的模版生成 html 文件
- mini-css-extract-plugin: 将 js 中的 css 提取到单独的 css 文件中

### 作用

- **模块打包**
  Webpack 可以将应用程序的各种模块（JavaScript、CSS、图片等）打包成一个或多个文件，以减少加载时间和提高性能。这使得模块化开发更加方便。

- **依赖管理**
  Webpack 可以分析应用程序的模块之间的依赖关系，并自动加载所需的模块。它支持 CommonJS、ES6 模块、AMD 等不同的模块系统。

- **自动刷新**
  Webpack 提供开发服务器，支持热模块替换（Hot Module Replacement，HMR），在开发过程中，可以自动刷新浏览器并保留应用程序的状态，而无需手动刷新。

- **代码分割**
  Webpack 支持代码分割，允许将应用程序代码拆分为多个文件，从而实现按需加载，减少初始加载时间。

- **资源加载**
  Webpack 可以处理各种资源文件，包括图片、字体、样式表等，将它们打包到应用程序中，并自动生成文件名和路径。

- **插件系统**
  具有丰富的插件系统，允许开发者使用各种插件来扩展其功能。例如，通过插件可以进行代码压缩、性能优化、代码分析等操作。

- **预处理支持**
  支持使用预处理器（如 Sass、Less、TypeScript）来编写样式和代码，可以通过加载器（loader）来处理这些预处理器。

- **多环境配置**
  Webpack 支持多环境配置，允许开发者为开发、测试和生产环境配置不同的构建选项，以满足不同环境的需求。

- **源映射**
  Webpack 生成源映射文件，可以帮助开发者在调试时跟踪到原始源代码，以便更容易定位和修复问题。

- **社区支持**
  Webpack 有一个庞大的社区和生态系统，提供了丰富的文档、插件和工具，使其更易于学习和使用。

参考地址:
<https://juejin.cn/post/7031813766098452493?searchId=202310101549007A30405003CD58D70B9D>

## Echarts 内核

echarts 是基于 [ZRender]<https://ecomfe.github.io/zrender-doc/public/> 框架写的。
ZRender 是二维绘图引擎，它提供 Canvas、SVG、VML 等多种渲染方式。ZRender 也是 ECharts 的渲染器。

## 闭包是什么?

当你在一个函数内部定义另一个函数，而内部函数可以访问外部函数的变量，即使外部函数已经执行完毕，这个内部函数及其访问的变量一起构成了一个闭包。
内部函数“闭包”了来自外部的所有数据，它本质上就是所有“外部”数据的快照，这些数据被冻结并单独存储在内存中。

## 浏览器每一帧做了什么?

浏览器的一帧为 16.7ms。

1. 用户事件, 比如 click
2. 宏任务和微任务。把微任务队列执行完成。宏任务会被浏览器自动调控。比如浏览器如果觉得宏任务执行时间太久，它会将下一个宏任务分配到下一帧中，避免掉帧。
3. 在渲染前执行 scroll/resize 等事件回调。
4. 在渲染前执行 requestAnimationFrame 回调。
5. 渲染界面：面试中经常提到的浏览器渲染时 html、css 的计算布局绘制等都是在这里完成。
6. requestIdleCallback 执行回调：如果前面的那些任务执行完成了，一帧还剩余时间，那么会调用该函数。

宏任务主要包含：script（整体代码）、setTimeout、setInterval、setImmediate、I/O、UI 交互事件。
微任务主要包含：Promise、MutationObserver 等。

![image](https://github.com/zm8/blog_old/assets/32337542/dfa2af3a-1e24-4bf8-838d-65d95217cce2)

## requestAnimationFrame 和 setTimeout, setInterval 的区别?

- `requestAnimationFrame` 在浏览器的**下一帧渲染之前**执行代码，更适合创建平滑的动画效果，因为它与浏览器的渲染循环同步，可以准确控制动画的每一帧。
- `setTimeout`, `setInterval` 在指定的时间间隔执行代码，执行时间不固定，可能受到浏览器的负载和性能影响。

requestAnimationFrame 的优点:

- 经过浏览器优化，动画更流畅
- 窗口没激活时，动画将停止，节省计算资源
- 更省电，尤其是对移动终端

## Object.freeze()

冻结一个对象，冻结对象可以[防止扩展](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions)，并使现有的属性不可写入和不可配置。

```js
const obj = {
  prop: 42
};

Object.freeze(obj);

obj.prop = 33;
// Throws an error in strict mode  严格模式下会抛出错误

console.log(obj.prop);
// Expected output: 42
```

## WeakMap 和 Map 的区别

WeakMap 只接受对象（null 除外）和 Symbol 值作为键名，不接受其他类型的值作为键名。
WeakMap**键名**所引用的对象都是弱引用，只要所引用的对象被清除，垃圾回收机制就会释放该对象所占用的内存。
应用场景，Dom 元素当作 WeakMap 键名。当该 DOM 元素被清除，其所对应的 WeakMap 记录就会自动被移除。

```js
const wm = new WeakMap();
const element = document.getElementById("example");
wm.set(element, "some information");
wm.get(element); // "some information"
```

## Koa 洋葱模型的优点

每个请求进入的时候传递给下一个中间件，能够精确的控制请求处理流程。
异步处理更好，避免回调地狱。
下一个中间件对数据进行处理之后，上一个中间件可以获取到这个数据再进行处理。

## 如何使用 while (true) 模拟 setInterval

直接上代码，注意函数不能直接返回 t, 因为 t 其实是一直变化的。

```js
const setIntervalSimulate = (cb, time) => {
  let t;
  const loop = async () => {
    while (true) {
      await new Promise((r) => (t = setTimeout(r, time)));
      cb();
    }
  };
  loop();
  return () => {
    clearTimeout(t);
  };
};

const clear = setIntervalSimulate(() => {
  console.log(1);
}, 200);
```

## css3

css3 是使用 GPU 加速，如果用 css 来做动画，可以监听下面的事件:

````
animationstart: 动画开始
animationiteration: 动画执行的次数，和css 里面 ```animation-iteration-count``` 有关。
animationend: 动画结束
animationcancel: 动画取消, 比如把下面的 css 里的 .active 样式移除了。
````

```css
.animation.active {
  animation-duration: 2s;
  animation-name: slidein;
  animation-iteration-count: 2;
}

@keyframes slidein {
  from {
    margin-left: 100%;
    width: 300%;
  }

  to {
    margin-left: 0%;
    width: 100%;
  }
}
```

参考地址:
<https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event>

## 回流(Reflow) 和 重绘 (Repaint)

**回流比重绘的代价要更高。**
回流：元素位置变化就会发生 回流，比如 窗口大小改变，字体改变。
重绘：元素颜色或者 visibility 发生变化。

**如何避免**

- 避免频繁操作 DOM 和 频繁操作 CSS，最好一次性重写和更改。
- 对于动画使用绝对定位，让它脱离文档流。

### 快速排序

选择一个基准的数字(通常是中间的)，小于它的都放在左边数据集，大于它的都放在右边数据集，然后对于左边的数据集和右边的数据集重复上面的步骤。

```js
const arr = [2, 3, 1, 5, 6, 4];
const quickSort = (arr) => {
  const len = arr.length;
  if (len <= 1) return arr;
  const pos = Math.floor(len / 2);
  const middle = arr[pos];
  const left = [];
  const right = [];
  for (let i = 0; i < arr.length; i++) {
    if (i === pos) continue;
    if (arr[i] <= middle) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return quickSort(left).concat([middle]).concat(quickSort(right));
};
const newArr = quickSort(arr);
console.log(newArr);
```

### for...of 和 for...in 区别

数据只要部署了 `Iterator['itəreitə]` 接口，那么它就可以使用 `for...of` 来遍历。
Iterator 接口部署在数据结构的 `Symbol.Iterator` 属性上。
举例下面的数组:

```js
var arr = [1, 2, 3];
var iter = arr[Symbol.Iterator]();
iter.next(); // {value: 1, done: false}
iter.next(); // {value: 2, done: false}
iter.next(); // {value:3, done: false}
iter.next(); //  {value:undefined, done: true}
```

具有 iterator 的数据结构如下:

```js
Array
Map
Set
String
TypedArray
函数的 arguments 对象
NodeList 对象
```

`for...of` 不能遍历对象，因为对象没有部署 `Symbol.Iterator` 数据结构:

```js
console.log(Symbol.iterator); // Symbol(Symbol.iterator)
var obj = { a: 1, b: 2 };
for (let i of obj) {
  console.log(i);
}

/*
VM201:1 Uncaught TypeError: obj is not iterable
    at <anonymous>:1:14
*/
```

那么可以给对象部署 Iterator 数据结构:

```js
Object.prototype[Symbol.iterator] = function () {
  const keys = Object.keys(this);
  let i = 0;
  return {
    next: () => {
      const done = i > keys.length - 1;
      const value = done ? undefined : this[keys[i]];
      i++;
      return {
        value,
        done
      };
    }
  };
};

var obj = { a: 1, b: 2 };
for (let i of obj) {
  console.log(i); // 1, 2
}
```

## 小程序的知识

在渲染流程中，WebView H5 方案类似于传统的 Web 应用，先由 Native 打开一个 WebView 容器，WebView 就像浏览器一样，打开 WebView 对应的 URL 地址，然后进行请求资源、加载数据、绘制页面，最终页面呈现在我们眼前。

小程序采用双线程架构，分为逻辑层和渲染层。首先也是 Native 打开一个 WebView 页面，渲染层加载 WXML 和 WXSS 编译后的文件，同时逻辑层用于逻辑处理，比如触发网络请求、setData 更新等等。接下来是请求资源，请求到数据之后，数据先通过逻辑层传递给 Native，然后通过 Native 把数据传递给渲染层 WebView，再进行渲染。

# 其它待定

### js 内存模型, Chrome V8 如何进行垃圾回收

### js 解释器怎么执行代码

### 浏览器渲染原理?
