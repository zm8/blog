# Vite 记录

## `tsconfig.json` 的 target, module, lib 的作用

### 1. 配置 lib

```json
{
  "compilerOptions": {
    "lib": ["ES2021", "DOM", "DOM.Iterable"]
  }
}
```

上面的配置会让下面的 `.ts` 文件报红, 并且编译不过, 因为 `Object.hasOwn` 是 `ES2022` 的语法

```ts
if (Object.hasOwn({ foo: 1 }, "foo")) {
  console.log("has property foo");
}
```

### 2. 配置 module

```json
{
  "compilerOptions": {
    "module": "ES2021"
  }
}
```

上面的配置会让下面的 `.ts` 文件报红, 并且编译不过。

```ts
async function fn() {
  return 1;
}
await fn(); // 仅当 “module” 选项设置为 “es2022”、“esnext”、“system”、“node16” 或 “nodenext”，且 “target” 选项设置为 “es2017” 或更高版本时，才允许使用顶级 “await” 表达式。ts(1378)
```

### 3. 配置 target

```json
{
  "compilerOptions": {
    "target": "ES2016",
    "module": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
```

上面的配置会让下面的 `.ts` 文件报红, 并且编译不通过。

```ts
async function fn() {
  return 1;
}
await fn(); // 仅当 “module” 选项设置为 “es2022”、“esnext”、“system”、“node16” 或 “nodenext”，且 “target” 选项设置为 “es2017” 或更高版本时，才允许使用顶级 “await” 表达式。ts(1378)
```

所以**最终的完美**的配置如下，如果当前项目只支持 `ES2022`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
```

`vite.config.ts` 配置如下:

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
  plugins: [vue()],
  build: {
    target: "es2022"
  }
});
```

## vite 项目打包最终转换

`tsconfig.json` 下面的配置`target, lib`并不能转换代码到 `es2021`。
它的作用只是做 `ts` 类型检查

```
{
	"compilerOptions": {
		"target": "es2021",
		"lib": ["es2021", "DOM", "DOM.Iterable"],
	}
}
```

而只能通过 `vite.config.ts` 里面的 `build.target` 才能生效:

```
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
	plugins: [vue()],
	build: {
		target: "es2021",
	},
});
```

### 测试

通过是否支持顶层 `await` 来测试，下面的代码在 `es2022` 下面才支持

```js
function fn() {
  return Promise.resolve();
}
await fn();
```

那么当设置 `vite.config.ts` 的 `build.target: es2021`，编译会报错:

```
error during build:
Error: Transform failed with 1 error:
assets/index-!~{001}~.js:5579:0: ERROR: Top-level await is not available in the configured target environment ("es2021" + 3 overrides)
```

当设置为 `build.target: es2022`, 则不会报错。

## 打包输出的目录为非根目录

1. Vue3 修改 `vite.config.js`:

```js
import { defineConfig } from "vite";

export default defineConfig({
  base: "/test/", // 设置基础路径
  build: {
    outDir: "dist/test"
  }
});
```

2. Vue2 修改 vue.config.js

```js
module.exports = {
  outputDir: "dist/test", // 指定打包输出目录
  publicPath: process.env.NODE_ENV === "production" ? "/test/" : "/"
};
```

## Vite 报错: ?url is not supported with css modules

正常 vite 是内部就支持 css modules 的, 而出现这个问题的原因竟然是下面的一行代码导致,
(PS: 这行代码的意思是获取动态的图片地址, 由于 vite 不支持 require 的形式获取图片地址)

```ts
const getDynamicImgSrc = (src: string, prefix = "assets") =>
  new URL(`/src/${prefix}/${src}`, import.meta.url).href;
```

只要改成如下就不会报错了, `prefix` 不要动态的传入:

```ts
const getDynamicImgSrc = (src: string) => new URL(`/src/assets/${src}`, import.meta.url).href;
```
