# `__dirname`,`__filename`,`process.cwd()`,`path.resolve()`区别

## 1.背景

目录结构是 `test/a/b/foo.js`, `foo.js` 里面的代码是:

```javascript
const path = require("path");
console.log("__dirname:         " + __dirname);
console.log("__filename:        " + __filename);
console.log("process.cwd():     " + process.cwd());
console.log("path.resolve()     " + path.resolve());
console.log("path.resolve('')   " + path.resolve(""));
console.log("path.resolve('./') " + path.resolve("./"));
```

## 2.进入 test 目录

```bash
> cd ./test
> node ./a/b/foo.js
```

结果为:

- `__dirname`: /Users/zhengming/Desktop/test/a/b
- `__filename`: /Users/zhengming/Desktop/test/a/b/foo.js
- `process.cwd()`: /Users/zhengming/Desktop/test
- `path.resolve()`: /Users/zhengming/Desktop/test
- `path.resolve('')`: /Users/zhengming/Desktop/test
- `path.resolve('./')`: /Users/zhengming/Desktop/test

## 3.进入 test/a 目录执行命令

```bash
>cd ./test/a
>node ./b/foo.js
```

`__dirname`: /Users/zhengming/Desktop/test/a/b
`__filename`: /Users/zhengming/Desktop/test/a/b/1.js
`process.cwd()`: /Users/zhengming/Desktop/test/a
`path.resolve()`: /Users/zhengming/Desktop/test/a
`path.resolve('')`: /Users/zhengming/Desktop/test/a
`path.resolve('./')`: /Users/zhengming/Desktop/test/a

## 4.修改 foo.js, 让它创建一个新的文件夹

结果 `new-folder` 目录的创建是在 `**/test/`目录下, 并不是在 `/test/a/b` 目录下

```bash
> node ./a/b/foo.js
```

```js
// foo.js
const { access, mkdir } = require("fs").promises;

async function f() {
  const path = "./new-folder";
  try {
    await access(path);
  } catch (e) {
    await mkdir(path, { recursive: true });
  }
}
f();
```

## 5.总结

- `__dirname`: 返回被执行的 js 所在文件夹的绝对路径
- `__filename`: 返回被执行的 js 的绝对路径
- `process.cwd()`: 总是返回运行 node 命令时所在的文件夹的绝对路径
- `path.resolve()` 或 `path.resolve('')` 或 `path.resolve('./')`: 跟 `process.cwd()` 一样
