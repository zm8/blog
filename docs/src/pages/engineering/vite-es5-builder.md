# Vite 打包 ES5 库

## 一.背景

目前 Vue3 已经放弃对 IE11 的支持，Vite 打包最低支持到 ES6，所以通常研究打包 ES5 库没太大必要。不过，如果你需要适配较低端的手机或者支持 IE11 浏览器的项目，这还是有用的。

由于 Vite 生产环境使用 rollup 打包代码，所以相关配置需要参考 rollup 官网。

<https://rollupjs.org/tools/#babel>

:::tip 提示
当前使用的 Vite 版本为 6
:::

## 二.实现

### 1.搭建 Vite 项目

首先，创建一个新的 Vite 项目：

``` bash
pnpm create vite my-vue-app --template vue-ts
cd my-vue-app
pnpm i
```

### 2.安装 babel 相关依赖

接下来，安装 Babel 及其相关插件：

```bash
pnpm i @babel/core @babel/preset-env @rollup/plugin-babel core-js -D
```

### 3.配置 vite.config.ts

在 `vite.config.ts` 文件中配置 Babel 插件：

```ts
import { defineConfig } from "vite";
import babel from "@rollup/plugin-babel";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // 入口文件
        main: "src/main.ts"
      },
      plugins: [
        // 配置 Babel 插件
        babel({
          babelHelpers: "bundled",
          extensions: [".js", ".jsx", ".ts", ".tsx", ".vue"]
        })
      ]
    }
  }
});
```

### 4.新建 `.babelrc.json`

在项目根目录下新建 .babelrc.json 文件，配置 Babel：

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": 3,
        "targets": { "chrome": "58", "ie": "11" }
      }
    ]
  ]
}
```

:::tip 提示

`useBuiltIns: usage` 会根据代码中实际使用的 API 按需引入 `polyfill`，`corejs` 设置为 3 表示使用 `corejs` 的第 3 版。

:::

## 三.测试 1 - 字符串扩展方法 `trimEnd`

### 1. 新建 `main.ts`

在 `src` 目录下新建 `main.ts` 文件，添加以下代码：

```ts
const str = "123".trimEnd();
console.log(str);
```

### 2. 打包

运行以下命令打包项目：

```bash
pnpm run build
```

你会看到类似如下的输出：

```
> vue-tsc -b && vite build

vite v6.0.5 building for production...
✓ 86 modules transformed.
dist/assets/main-B5CCLAht.js  15.24 kB │ gzip: 6.19 kB
✓ built in 1.18s
```

### 3. 分析打包结果

打开 `dist/assets/main-B5CCLAht.js` 文件，搜索 `trimEnd`，可以看到字符串的`trimEnd` 相关的 `core-js` pollyfill 已经注入。

### 4. 测试结果

#### 4.1 修改 `index.html` 页面

在 `index.html` 页面中删除 js 字符串的原型方法，注入以下代码：

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + Vue + TS</title>
  </head>
  <body>
    <div id="app"></div>
    <script>
      delete String.prototype.trimEnd;
    </script>
    <script type="module" src="./dist/assets/main-B5CCLAht.js"></script>
  </body>
</html>
```

#### 4.2 本地开发启动

运行以下命令启动本地开发服务器：

```bash
pnpm dev
```

#### 4.3 查看浏览器控制台

打开 Chrome 控制台，输入 `String.prototype.trimEnd`，发现它已经被替换成 pollyfill 的 `trimEnd` 方法。

```
> String.prototype.trimEnd
< ƒ (){return r(this)}
```

## 四.测试 2 - 箭头函数, async/await

### 1. 修改 `main.ts`

修改 main.ts 文件，添加以下代码：

```ts
const fn = () => {
  console.log(`Hello World`);
};
console.log(fn.length);
fn();

const asyncFn = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("done");
    }, 1000);
  });
};

asyncFn().then((res) => {
  console.log(res);
});
```

### 2.打包

运行以下命令打包项目：

```bash
pnpm run build
```

你会看到类似如下的输出：

```
> vue-tsc -b && vite build

vite v6.0.5 building for production...
✓ 137 modules transformed.
dist/assets/main-DbF_Kl-a.js  35.76 kB │ gzip: 13.88 kB
✓ built in 1.71s
```

### 3. 分析打包结果

打开 `dist/assets/main-DbF_Kl-a.js` 文件，发现已经找不到 `async` 的相关代码了。

### 4. 测试结果

打开浏览器控制台, 代码正常执行, 并且 `window.Promise` 已经被替换成 `Babel` 的 `Promise` 方法。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + Vue + TS</title>
  </head>
  <body>
    <div id="app"></div>
    <script>
      delete window.Promise;
    </script>
    <script type="module" src="./dist/assets/main-DbF_Kl-a.js"></script>
  </body>
</html>
```

```
> window.Promise // 控制台输入
< ƒ (P){R(this,_),s(P),a(Or,this);var j=W(this);try{P(ur(qr,j),ur(cr,j))}catch(N){cr(j,N)}}
```

## 五.使用不同方式加载 polyfill 包的大小

### 1. 不用 babel 插件, 直接导入 `core-js` 里的 `trimEnd` 方法

1.修改 `main.ts` 文件:

```ts
import "core-js/modules/es.string.trim-end";

const str = "123".trimEnd();
console.log(str);
```

2.移除 `vite.config.ts` 文件中的 `babel` 插件:

```ts
import { defineConfig } from "vite";
import babel from "@rollup/plugin-babel";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // 入口文件
        main: "src/main.ts"
      }
    }
  }
});
```

### 2. 打包

运行以下命令打包项目：

```bash
pnpm run build
```

你会看到类似如下的输出：

```
> vue-tsc -b && vite build

vite v6.0.5 building for production...
✓ 86 modules transformed.
dist/assets/main-CmKR8JeS.js  15.24 kB │ gzip: 6.19 kB
✓ built in 430ms
```

### 3. 分析打包结果

- 打包的文件大小和之前使用 `babel` 插件的文件大小一样。
- 打包出来的代码和之前基本一样，唯一的区别是 `const` 没有转换成 `var`。

`main-CmKR8JeS.js` 对比之前的 `main-B5CCLAht.js`:

```js
// main-CmKR8JeS.js
// ... pollyfill code
const Cn = "123".trimEnd();
console.log(Cn);
```

``` js
// main-B5CCLAht.js
// ... pollyfill code
var Cn = "123".trimEnd();
console.log(Cn);
```

### 2.直接下载对应的 polyfill 包

在 Vite 的官网的 [Building for Production](https://vite.dev/guide/build.html#browser-compatibility) 章节, 找到一个可以下载 polyfill 包的网站如下:

<https://cdnjs.cloudflare.com/polyfill/>

打开网址, 在 `Filter Polyfills` 输入框输入 `trimEnd`，然后选中下面的复选框 `String.prototype.trimEnd`，最后复制上面生成的网址：

<https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?version=4.8.0&features=String.prototype.trimEnd>

:::tip 注意

这个地址在支持 `String.prototype.trimEnd` 的 Chrome 浏览器是看不到代码的。

:::

得使用 `IE Tab` Chrome 插件设置好 IE11, 打开这个地址, 就可以下载代码了。

你会发现这个代码整体只有 `3kb`, 而之前使用 Babel 打包的文件有 `11kb`, 小了很多，具体代码如下:

```js
// prettier-ignore

/*
 * Polyfill service v4.8.0
 * Disable minification (remove `.min` from URL path) for more info
 */
(function(self, undefined) {function Call(t,l){var n=arguments.length>2?arguments[2]:[];if(!1===IsCallable(t))throw new TypeError(Object.prototype.toString.call(t)+"is not a function.");return t.apply(l,n)}function CreateMethodProperty(e,r,t){var a={value:t,writable:!0,enumerable:!1,configurable:!0};Object.defineProperty(e,r,a)}function Get(n,t){return n[t]}function IsCallable(n){return"function"==typeof n}function RequireObjectCoercible(e){if(null===e||void 0===e)throw TypeError(Object.prototype.toString.call(e)+" is not coercible to Object.");return e}function ToObject(r){if(null===r||void 0===r)throw TypeError();return Object(r)}function GetV(t,e){return ToObject(t)[e]}function GetMethod(e,l){var t=GetV(e,l);if(null!==t&&void 0!==t){if(!1===IsCallable(t))throw new TypeError("Method not callable: "+l);return t}}function Type(e){switch(typeof e){case"undefined":return"undefined";case"boolean":return"boolean";case"number":return"number";case"string":return"string";case"symbol":return"symbol";default:return null===e?"null":"Symbol"in self&&(e instanceof self.Symbol||e.constructor===self.Symbol)?"symbol":"object"}}function OrdinaryToPrimitive(r,t){if("string"===t)var e=["toString","valueOf"];else e=["valueOf","toString"];for(var i=0;i<e.length;++i){var n=e[i],a=Get(r,n);if(IsCallable(a)){var o=Call(a,r);if("object"!==Type(o))return o}}throw new TypeError("Cannot convert to primitive.")}function ToPrimitive(e){var t=arguments.length>1?arguments[1]:void 0;if("object"===Type(e)){if(arguments.length<2)var i="default";else t===String?i="string":t===Number&&(i="number");var r="function"==typeof self.Symbol&&"symbol"==typeof self.Symbol.toPrimitive?GetMethod(e,self.Symbol.toPrimitive):void 0;if(void 0!==r){var o=Call(r,e,[i]);if("object"!==Type(o))return o;throw new TypeError("Cannot convert exotic object to primitive.")}return"default"===i&&(i="number"),OrdinaryToPrimitive(e,i)}return e}function ToString(t){switch(Type(t)){case"symbol":throw new TypeError("Cannot convert a Symbol value to a string");case"object":return ToString(ToPrimitive(t,String));default:return String(t)}}function TrimString(e,u){var r=RequireObjectCoercible(e),t=ToString(r),n=/[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+/.source;if("start"===u)var p=String.prototype.replace.call(t,new RegExp("^"+n,"g"),"");else p="end"===u?String.prototype.replace.call(t,new RegExp(n+"$","g"),""):String.prototype.replace.call(t,new RegExp("^"+n+"|"+n+"$","g"),"");return p}CreateMethodProperty(String.prototype,"trimEnd",function t(){"use strict";var r=this;return TrimString(r,"end")});})('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});
```
