# http 缓存

### 前言

浏览器访问一个页面, 这页面的请求头是由浏览器自身决定，网站协议如果是 http1.1, 则它们的请求头都是 http1.1 的请求头, 若是 http2.0, 它们的请求头都是 http2.0 的请求头。除非用了 XMLHttpRequest 请求才可以自定义请求头。

所以打开淘宝首页 和 打开 QQ 邮箱, 他们都是 http2.0 协议, 请求的字段都是一样的。

![image](https://user-images.githubusercontent.com/32337542/81781085-29c28380-952a-11ea-877c-0f8c042d6089.png)

## 1. chrome 访问页面

### 1. 在 URI 输入栏中输入然后回车

服务器会返回 2 种状态, 200 或 `from disk cache` 或 `from memory cache`。

### 2. F5(mac: command + R)/点击工具栏中的刷新按钮/右键菜单重新加载

请求头会带 `Cache-Control: max-age=0`, 它的意思是必须向服务端验证，所以服务端要么返回 200, 要么是 304, 永远不会 `from disk cache` 或 `from memory cache`。

### 3. 强制刷新(mac: command + shift + R, window: ctrl + F5)

请求头会带 `Pragma: no-cache` 和 `Cache-Control: no-cache`, 则服务端只能返回 200, 并且会更新缓存。

## 2. 首次访问首页验证 - node

代码如下:

```javascript
"use strict";

const fs = require("fs");

const html = `
<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Test</title>
    </head>
    <body>
      <h1>Test</h1>
    </body>
</html>`;

var options = {
  key: fs.readFileSync("./cert/local.key"),
  cert: fs.readFileSync("./cert/local.crt")
};

const https = require("https");
https
  .createServer(options)
  .on("request", (req, res) => {
    const { url } = req;

    if (url === "/") {
      let d = new Date();
      d.setSeconds(d.getSeconds() + 10);
      res.writeHead(200, {
        expires: d.toUTCString(),
        // 'cache-control': 'max-age=10',
        "content-type": " text/html; charset=utf-8"
      });
      res.end(html);
      return;
    }
    res.statusCode = 404;
    res.end("");
  })
  .listen(9990, () => {
    console.log("打开 https://localhost.meetsocial.cn:9990");
  });
```

1. 首次打开首页
   页面显示文字 `Test`, 这个时候返回头 Expires 代表 10s 后才过期。

2. 新开 Tab 再打开首页
   这个时候 `from disk cache`。

3. 点击浏览器刷新按钮 或 command + R
   **由于 Chrome 浏览器请求头自带 `Cache-Control: max-age=0`**, 所以返回 200

4. 过了 10 秒, 再新开 Tab
   返回 200

## 3. 访问资源验证 - node

代码如下:

```javascript
...
    if (url === '/') {
      ...
      return;
    }
    if (url === '/test.js') {
      let d = new Date();
      d.setSeconds(d.getSeconds() + 10);
      res.writeHead(200, {
        expires: d.toUTCString(),
        // 'cache-control': 'max-age=10',
        'content-type': 'application/javascript; charset=utf-8',
      });
      res.end('console.log(1)');
      return;
    }
...
```

1. 首次打开首页
   控制台输出 `1`, 这个时候返回头 Expires 代表 10s 后才过期。

2. 新开 Tab 再打开首页
   这个时候 `from disk cache`。

3. 点击浏览器刷新按钮 或 command + R
   **注意这里和浏览器打开首页不一样**, 还是 `from disk cache`。

4. 过了 10 秒, 再新开 Tab
   返回 200

## 总结

cache-control 的值影响返回 200 或 304。

1. 服务端返回请求头 `cache-control: max-age: 10`(或 `expires`) 和 Etag, 10s 内再请求, 就会返回 **`from disk cache`**, 10s 后再请求，会把该资源的 Etag 发送服务器校验, 服务器返回**304**或**200**，并**更新本地缓存**。

2. 服务端返回请求头 `cache-control: no-cache` 或 `cache-control: max-age=0`, 意思是**不走强缓存**, **但是资源还是会缓存到本地**, 但再次请求的时候**不会使用本地缓存**, 所以不会返回 **`from disk cache`**, 但会把当前资源的 Etag 发送给服务器校验, 服务器返回**304**或**200**，并**更新本地缓存**。

3. 服务端返回请求头 `cache-control: no-store`, 则**不会把资源存在本地**。

4. 客户端请求头`cache-control: max-age=0`, 那么会先从本地缓存查看是否有这个资源, 若有, 则拿这资源的 Etag, 并且发送给服务器, 服务器校验后返回**200**或**304**，并**更新本地缓存**。

5. 客户端请求头`cache-control: no-cache`, 那么不会查看本地缓存, 直接请求服务器, 服务器只能返回 **200**，并**更新本地缓存**。

6. **特殊情况, 针对 Chrome 浏览器**, 若服务端不返回 cache-control, 但是只设置 Last-Modified, 则新打开的 tab 页面 返回`from disk cache` 或 304; 若只设置 etag, 则新打开的 tab 只会返回 304; 若同时设置了 Last-Modified 和 eTag, 则新打开的 tab 页面 返回`from disk cache` 或 304。

7. post 请求是不能走本地缓存的。所以不会 `from disk cache`。[参考地址](https://stackoverflow.com/questions/626057/is-it-possible-to-cache-post-methods-in-http)
   只有 get 请求会 `from disk cache` 或 返回 `304` 或 `200`

## 使用 Express 进行验证

### 验证 1

代码:

```javascript
const express = require("express");
const app = express();

var options = {
  lastModified: false,
  setHeaders: (res, path, stat) => {
    res.set({
      "Cache-Control": "max-age=10"
    });
  }
};
app.use(express.static(__dirname + "/public", options));
app.listen(3000);
```

截图:
![image](https://user-images.githubusercontent.com/32337542/84221126-1560af00-ab07-11ea-80db-ab75288b349d.png)

结论:

- 首次访问 document 和 test.js 都返回 **200**
- 刷新页面, document 返回 **304**(因为 Chrome 会自带请求头 `Cache-Control: max-age=0`), test.js 返回 **from memory cache**
- 10s 内再次打开页面, document 和 test.js 都返回 **from disk cache**
- 10s 后打开页面, document 返回 **304**, test.js 返回 **304**

### 验证 2

服务端返回 `no-cache`, 不是不缓存，而是不走强缓存(`from disk cache`)的意思。
代码:

```javascript
...
    res.set({
      'Cache-Control': 'no-cache',
    });
...

// 等价于
...
    res.set({
      'Cache-Control': 'max-age=0',
    });
...
```

截图:
![image](https://user-images.githubusercontent.com/32337542/84224449-27dee680-ab0f-11ea-9f26-c8ef7d6475b3.png)

结论:

- 首次访问 document 和 test.js 都返回 **200**
- 刷新页面, document 和 test.js 都返回 **304**
- 再次打开页面, document 和 test.js 都返回 **304**
- 若修改 test.js 内容 再刷新页面, 则 test.js 返回 **200**

### 验证 3

代码:

```
...
    res.set({
      'Cache-Control': 'no-store',
    });
...
```

截图:
![image](https://user-images.githubusercontent.com/32337542/84224926-60cb8b00-ab10-11ea-8894-464801455f51.png)
结论:

- 首次打开, 刷新, 再次打开 document 和 test.js 都返回 **200**, 并且不保存到本地。

### 验证 4

打开页面`http://test-sso.meetsocial.cn/`

页面已经首次加载了 `umi.8d0a67d0.js`, 并且返回头有 `Cache-Control: max-age=604800`

![image](https://user-images.githubusercontent.com/32337542/84235249-1e15ad00-ab28-11ea-8e07-e111007f4843.png)

打开控制台, 执行下面代码:

```javascript
fetch("/umi.8d0a67d0.js", {
  cache: "no-cache"
}).then((res) => res.text());

// 等价于
fetch("/umi.8d0a67d0.js", {
  headers: {
    "Cache-Control": "max-age=0"
  }
}).then((res) => res.text());
```

截图:
![image](https://user-images.githubusercontent.com/32337542/85374339-342f5e80-b567-11ea-8642-530968814bbd.png)

结论:

- 服务端返回 304(文件没改动过, 否则 200)

### 验证 5

注意和`验证4`的区别
代码:

```javascript
fetch("/umi.8d0a67d0.js", {
  headers: {
    "Cache-Control": "no-cache"
  }
}).then((res) => res.text());

// 或
fetch("/umi.8d0a67d0.js", {
  headers: {
    Pragma: "no-cache"
  }
}).then((res) => res.text());

// 或, reload 会同时添加 Pragma 和 Cache-Control
fetch("/umi.8d0a67d0.js", {
  cache: "reload"
}).then((res) => res.text());
```

截图(reload):
![image](https://user-images.githubusercontent.com/32337542/84244281-00e7db00-ab36-11ea-88a5-32bee9fce928.png)
结论:

- 服务端返回 200, 并且**更新本地缓存**。

### 验证 6

代码:

```javascript
fetch("/umi.8d0a67d0.js", {
  cache: "no-store"
}).then((res) => res.text());
```

结论:

- 服务端返回 200, 注意**不会更新本地缓存**。

### 验证 7

代码如下:

```javascript
fetch("/umi.8d0a67d0.js", {
  headers: {
    "Cache-Control": "max-age=1"
  }
}).then((res) => res.text());

// 等价于
fetch("/umi.8d0a67d0.js", {
  headers: {
    "Cache-Control": "max-age=999999999"
  }
}).then((res) => res.text());

// 等价于, 什么都没设置
fetch("/umi.8d0a67d0.js").then((res) => res.text());
```

结论:

- 服务端返回 `from disk cache`。说明如果 max-age 不等于 0, 则设置其它任意值无效。

## 缓存设置总结

1. 数据缓存之后，尽量减少服务器的请求
   所以服务端尽量不要返回 304, 并且服务端返回头时间设置比较久, 比如一年 `Cache-Control: max-age=31536000`

2. 如果资源更新的话，必须使得客户端的资源一起更新。
   在资源文件后面加上表示，如 config.f1ec3.js、config.v1.js 之类的

3. Expires 是相对服务器上的时间, 如果客户端上的时间跟服务器上的时间不一致（特别是用户修改了自己电脑的系统时间），那缓存时间可能就没啥意义了。

4. Chrome 浏览器有时应该返回 304 的时候, 却返回 200。

## 附件: Cache-Control 返回值

`Cache-Control` 常见的取值有 private、public、no-cache、max-age，no-store，默认为 private。
若`Cache-Control` 仅指定了 `max-age=100`，由于默认是 private, 则相当于 ` Cache-Control: max-age=100; private`。客户端缓存 100s。

- private: 客户端可以缓存
- public: 客户端和代理服务器都可缓存（前端的同学，可以认为 public 和 private 是一样的）
- max-age=xxx: 缓存的内容将在 xxx 秒后失效
- no-cache: 客户端请求不会走强制缓存, 但是会把资源的 Etag 发给服务端, 服务端返回 **304** 或 **200**
- no-store: 所有内容都不会缓存。

## 图

![image](https://user-images.githubusercontent.com/32337542/82033232-0258eb80-96cf-11ea-83c9-844e731d9561.png)

:::tip 参考地址
https://zhuanlan.zhihu.com/p/55623075
https://mp.weixin.qq.com/s/aY2JaX9q1VABNMLRdMw3EA
https://www.cnblogs.com/chenqf/p/6386163.html
https://developer.mozilla.org/zh-CN/docs/Web/API/Request/cache
https://imweb.io/topic/5795dcb6fb312541492eda8c
https://www.v2ex.com/t/356353
:::
