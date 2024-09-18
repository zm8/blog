# Koa 简单模拟

## 1. koa 的请求像一个洋葱模型

![image](https://user-images.githubusercontent.com/32337542/81541634-fe169080-93a5-11ea-8b88-067bb0f8308d.png)

## 2. 实例代码

下面的代码输出：

```
1
2
3
end
4
5
```

```javascript
const Koa = require("koa");
const app = new Koa();
app.use(async (ctx, next) => {
  console.log(ctx);
  if (ctx.request.url === "/favicon.ico") {
    ctx.status = 404;
    return;
  }
  console.log("1");
  await next();
  console.log("5");
});

app.use(async (ctx, next) => {
  console.log("2");
  await next();
  console.log("4");
});

app.use((ctx) => {
  console.log("3");
  console.log("end");
  ctx.status = 200;
  ctx.body = `Hello from koa`;
});

app.listen(3002, () => console.log("Koa app listening on 3002"));
```

## 2. 如何模拟一个简单的 koa

不断的递归 next 函数来模拟

```javascript
const http = require("http");
class Koa {
  constructor() {
    this.middleware = [];
    this.server = http.createServer();
    this.ctx = {};
  }
  listen(...args) {
    this.server.on("request", this.request.bind(this)).listen(...args);
  }
  async request(req, res) {
    this.ctx.request = req;
    this.j = -1;
    await this.next();
    res.statusCode = this.ctx.status || 200;
    res.end(this.ctx.body || "OK");
  }
  async next() {
    this.j++;
    if (this.j > this.middleware.length - 1) {
      return;
    }
    await this.middleware[this.j](this.ctx, this.next.bind(this));
  }
  use(fn) {
    this.middleware.push(fn);
  }
}
```

## 3. 如何模拟一个简单的 koa

通过调用高阶函数 compose, 然后里面通过 Promise 来巧妙的递归。

```javascript
const http = require("http");
class Koa {
  constructor() {
    this.middleware = [];
    this.server = http.createServer();
  }
  listen(...args) {
    this.server.on("request", this.request.bind(this)).listen(...args);
  }
  async request(req, res) {
    const ctx = {
      request: req
    };
    const fn = this.compose(this.middleware);
    try {
      await fn(ctx);
      res.statusCode = ctx.status || 200;
      res.end(ctx.body || "OK");
    } catch (e) {
      res.statusCode = 200;
      res.end(e.message || "error message");
    }
  }
  compose(middleware) {
    return (ctx) => {
      let len = middleware.length;
      const dispatch = (i) => {
        if (i === len) return Promise.resolve();
        const fn = middleware[i];
        try {
          return Promise.resolve(
            fn(ctx, () => {
              return dispatch(i + 1);
            })
          );
        } catch (e) {
          return Promise.reject(e);
        }
      };
      return dispatch(0);
    };
  }
  use(fn) {
    this.middleware.push(fn);
  }
}
```

## 4. koa 如何监听报错

错误处理中间件在最顶端运行。

```javascript
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = 400;
    ctx.body = `Uh-oh: ${err.message}`;
    console.log("Error handler:", err.message);
  }
});
```

## 5. koa 计算 http 的请求时间

```javascript
app.use(async (ctx, next) => {
  const t = Date.now();
  await next();
  console.log(Date.now() - t);
});
```

::: 参考地址

<https://hijiangtao.github.io/2017/11/10/Mastering-Koa-Middleware/>
<https://github.com/0326/super-mini-koa/blob/master/super-mini-koa.js>

:::
