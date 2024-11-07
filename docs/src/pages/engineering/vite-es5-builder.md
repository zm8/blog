# Vite 打包 ES5 库

## 背景

目前 Vue3 已经放弃对 IE11 的支持，vite 打包最低支持到 ES6，所以通常研究打包 ES5 库没太大必要，当然要适配比较低端的手机可能还有点用。

由于 vite 开发环境使用 esbuild 打包, 而生产环境使用 rollup 打包，所以相关配置需要去 rollup 官网找。

<https://rollupjs.org/tools/#babel>

## 实现

### 1.安装依赖

```bash
pnpm i @babel/core @babel/preset-env @rollup/plugin-babel
```

### 2.配置 vite.config.ts

```ts
import { defineConfig } from "vite";
import babel from "@rollup/plugin-babel";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // 测试的入口的文件
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

### 3.根目录新建 `.babelrc.json`

`useBuiltIns: usage` 会根据代码中使用到的 API 按需引入 `polyfill`，`corejs` 设置 3 表示使用 `corejs v3` 的版本。

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

## 测试 1 - 字符串扩展方法 `trimEnd`

### 1. 新建 `main.ts`

```ts
const str = "123".trimEnd();
console.log(str);
```

### 2. 打包

```bash
pnpm run build
```

```
> vue-tsc && vite build

vite v5.4.10 building for production...
✓ 158 modules transformed.
dist/assets/main-bq_doUVv.js  11.30 kB │ gzip: 5.18 kB
✓ built in 1.83s
```

### 3. 分析打包结果

打开 `dist/assets/main-bq_doUVv.js` 文件，搜索 `trimEnd`，可以看到 `core-js` 已经注入。

### 4. 查看页面的 html

首先使用 js 代码`delete String.prototype.trimEnd`, 删除原生的 `trimEnd`，然后打开浏览器控制台, 发现代码正常执行, 并且 `trimEnd` 已经被替换成 pollyfill 的 `trimEnd` 方法。

```
> String.prototype.trimEnd // 控制台输入
< ƒ (){return To(this)}
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vite</title>
  </head>
  <body>
    <script>
      delete String.prototype.trimEnd;
    </script>
    <script type="module" src="./dist/assets/main-bq_doUVv.js"></script>
  </body>
</html>
```

## 测试 2 - 箭头函数, async/await

### 1. 修改 `main.ts`

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

```bash
pnpm run build
```

```
> vue-tsc && vite build

vite v5.4.10 building for production...
✓ 158 modules transformed.
dist/assets/main-bq_doUVv.js  11.30 kB │ gzip: 5.18 kB
✓ built in 1.62s
```

### 3. 分析打包结果

打开 `dist/assets/main-CtzkN2r_.js` 文件，发现已经找不到 `async` 的相关代码了。

### 4. 查看页面 html

打开浏览器控制台, 代码正常执行, 并且 `window.Promise` 已经被替换成 babel 的 `Promise` 方法。

```
> window.Promise // 控制台输入
< ƒ (e){ts(this,Nr),rs(e),nr(_r,this);var t=Te(this);try{e(rr(Fe,t),rr(er,t))}catch(n){er(t,n)}}
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vite</title>
  </head>
  <body>
    <script>
      delete window.Promise;
    </script>
    <script type="module" src="./dist/assets/main-CtzkN2r_.js"></script>
  </body>
</html>
```

## 使用不同方式加载 polyfill 包的大小

### 1. 不用 babel 插件, 直接导入 `core-js` 里的 `trimEnd` 方法

1.修改 `main.ts` 文件:

```ts
import "core-js/modules/es.string.trim-end";

const str = "123".trimEnd();
console.log(str);
```

2.移除 `vite.config.ts` 文件中的 `babel` 插件

```ts
import { defineConfig } from "vite";
import babel from "@rollup/plugin-babel";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // 测试的入口的文件
        main: "src/main.ts"
      }
    }
  }
});
```

### 2. 打包

```bash
pnpm run build
```

```
vite v5.4.10 building for production...
✓ 158 modules transformed.
dist/assets/main-D8Fto_NP.js  11.30 kB │ gzip: 5.18 kB
✓ built in 831ms
```

### 3. 分析打包结果

- 打包的文件大小和之前使用 `babel` 插件的文件大小`一样`。
- 打包出来的代码和之前`一样`，唯一的区别是 `const` 没有转换成 `var`。

### 2.直接下载对应的 polyfill 包

在 vite 的官网的 [Building for Production](https://vite.dev/guide/build.html#browser-compatibility) 章节, 找到了一个可以下载 polyfill 包的网站。

<https://cdnjs.cloudflare.com/polyfill/>

打开网址, 在 `Filter Polyfills` 输入框输入 `trimEnd`，然后选中下面的复选框 `String.prototype.trimEnd`，最后复制上面的网址:

<https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?version=4.8.0&features=String.prototype.trimEnd>

::::tip 注意
这个地址在支持 `trimEnd` 的 Chrome 浏览器是看不到代码的。
:::

得使用 `IE Tab` Chrome 插件设置好 IE11, 打开这个地址, 就可以下载代码了。

发现这个代码整体只有 `3kb`, 而之前的 babel 打包的文件有 `11kb`, 小了很多, 所以以后推荐使用这种方式。

```js
// prettier-ignore

/*
 * Polyfill service v4.8.0
 * Disable minification (remove `.min` from URL path) for more info
 */
(function(self, undefined) {function Call(t,l){var n=arguments.length>2?arguments[2]:[];if(!1===IsCallable(t))throw new TypeError(Object.prototype.toString.call(t)+"is not a function.");return t.apply(l,n)}function CreateMethodProperty(e,r,t){var a={value:t,writable:!0,enumerable:!1,configurable:!0};Object.defineProperty(e,r,a)}function Get(n,t){return n[t]}function IsCallable(n){return"function"==typeof n}function RequireObjectCoercible(e){if(null===e||void 0===e)throw TypeError(Object.prototype.toString.call(e)+" is not coercible to Object.");return e}function ToObject(r){if(null===r||void 0===r)throw TypeError();return Object(r)}function GetV(t,e){return ToObject(t)[e]}function GetMethod(e,l){var t=GetV(e,l);if(null!==t&&void 0!==t){if(!1===IsCallable(t))throw new TypeError("Method not callable: "+l);return t}}function Type(e){switch(typeof e){case"undefined":return"undefined";case"boolean":return"boolean";case"number":return"number";case"string":return"string";case"symbol":return"symbol";default:return null===e?"null":"Symbol"in self&&(e instanceof self.Symbol||e.constructor===self.Symbol)?"symbol":"object"}}function OrdinaryToPrimitive(r,t){if("string"===t)var e=["toString","valueOf"];else e=["valueOf","toString"];for(var i=0;i<e.length;++i){var n=e[i],a=Get(r,n);if(IsCallable(a)){var o=Call(a,r);if("object"!==Type(o))return o}}throw new TypeError("Cannot convert to primitive.")}function ToPrimitive(e){var t=arguments.length>1?arguments[1]:void 0;if("object"===Type(e)){if(arguments.length<2)var i="default";else t===String?i="string":t===Number&&(i="number");var r="function"==typeof self.Symbol&&"symbol"==typeof self.Symbol.toPrimitive?GetMethod(e,self.Symbol.toPrimitive):void 0;if(void 0!==r){var o=Call(r,e,[i]);if("object"!==Type(o))return o;throw new TypeError("Cannot convert exotic object to primitive.")}return"default"===i&&(i="number"),OrdinaryToPrimitive(e,i)}return e}function ToString(t){switch(Type(t)){case"symbol":throw new TypeError("Cannot convert a Symbol value to a string");case"object":return ToString(ToPrimitive(t,String));default:return String(t)}}function TrimString(e,u){var r=RequireObjectCoercible(e),t=ToString(r),n=/[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+/.source;if("start"===u)var p=String.prototype.replace.call(t,new RegExp("^"+n,"g"),"");else p="end"===u?String.prototype.replace.call(t,new RegExp(n+"$","g"),""):String.prototype.replace.call(t,new RegExp("^"+n+"|"+n+"$","g"),"");return p}CreateMethodProperty(String.prototype,"trimEnd",function t(){"use strict";var r=this;return TrimString(r,"end")});})('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});
```
