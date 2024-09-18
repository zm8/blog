# VSCode debug js

当前 node 版本 v12.13.1

## 1. debug 当前目录的 js

1. 新建 `.vscode/launch.json`

```
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "启动程序",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${workspaceFolder}/start.js"
        }
    ]
}
```

2. 新建 start.js, 然后在第 1 行点个 小红点。

```javascript
var a = 1;
console.log(a);
```

3. F5 或 点击 `vscode debug` 启动程序。

## 2. chrome 浏览器进行 debug (1)

1. 不需要新建文件 `.vscode/launch.json`, 直接执行命令:

```bash
> node inspect start.js
```

2. 打开 chrome://inspect, 然后点击下面 2 处都可以进行断点

![image](https://user-images.githubusercontent.com/32337542/80201917-76b3e800-8657-11ea-8646-1aef95e8c3fe.png)

## 3. chrome 浏览器进行 debug (2)

1. 修改 `start.js` 如下:

```javascript
var http = require("http");
http
  .createServer()
  .on("request", (req, res) => {
    res.statusCode = 200;
    res.end("Hello World");
  })
  .listen(3000);
```

2. 控制台执行命令

```bash
> node --inspect  start.js
```

:::tip
`node --inspect-brk start.js` 和 `node --inspect  start.js` 的区别是, 它会在第 1 行打个断点。
:::

## 4. npm scripts 打断点 debug (1)

npm 里面的命令是 node 直接执行的。

### 1. 新建 launch.json

- 新增 `runtimeExecutable`
- `port` 是必须的, 它是 调试端口号
- `runtimeArgs`的第 2 个参数对应 package.json 的 script 的参数。
- 移除 `program`

```
{
    "version": "0.2.0",
    "configurations": [
        {
            ...
            "runtimeExecutable": "npm",
            "runtimeArgs": [
                "run-script",
                "start"
            ],
            "port": 5555
        }
    ]
}
```

### 2. 新建 start.js

```javascript
var a = 1;
console.log(a);
```

### 3. 新建 package.json

注意里面的端口号是 5555, 对应 launch.json 里的端口号。

```
{
    "scripts": {
      "start": "node --inspect-brk=5555 start.js"
    }
}
```

## 5. npm scripts 打断点 debug (2)

npm 里面的命令不是 node 执行。

### 1. package.json 配置如下

```json
{
    "scripts": {
        "test": "mocha --inspect-brk=5555 test.js"
        // 或者
        "test": "node --inspect-brk=5555 ./node_modules/.bin/mocha test.js"
    },
    "dependencies": {
        "mocha": "^7.1.1"
    }
}

```

### 2. 新建 test.js

```javascript
var assert = require("assert");
describe("test", function () {
  it("equal", function () {
    assert.equal(0, 0);
  });
});
```

### 3. 新建 launch.json

```json
{
    "configurations": [
        {
            ...
            "runtimeExecutable": "npm",
            "runtimeArgs": [
                "run-script",
                "test"
            ],
            "port": 5555
        }
    ]
}
```

## 6. npm scripts 打断点 debug (3)

### 1. 可以不写 `launch.json`

只要 `VSCode` 设置里面把 `Node: Auto Attach` 打开, 或者 `command+shift+p` 运行 `Debug: Toggle Auto Attach`

### 2. package.json 配置如下

下面几种方式都可以 `debug`, 注意必须添加 `inspect` 参数。

```json
{
  "scripts": {
    "start": "node inspect start.js",
    "test": "mocha  --inspect-brk test.js",
    "test2": "mocha  --inspect-brk=5555 test.js",
    "test3": "node --inspect-brk=5555 ./node_modules/.bin/mocha test.js"
  }
}
```

### 3. 运行命令

```bash
npm run start
npm run test
npm run test2
npm run test3
```

## 总结

- 1 和 6 是常用的。

:::tip 参考地址
<https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_auto-attach-feature>
:::
