# js 模拟中间件写法

## 面向对象的实现方式

```js
class middleWare {
  constructor() {
    this.arr = [];
  }
  use(fn) {
    const fff = () => {
      fn.call(null, this.obj, this.next.bind(this));
    };
    this.arr.push(fff);
  }
  next() {
    var fn = this.arr.shift();
    if (fn) {
      fn();
    }
  }
  go(obj) {
    this.obj = obj;
    this.next();
  }
}

var o = new middleWare();
o.use(function (ctx, next) {
  console.log(1);
  ctx.name = "Lucy";
  setTimeout(() => {
    next();
  }, 2000);
});
o.use(function (ctx, next) {
  console.log(2);
  ctx.age = 12;
  next();
});
o.use(function (ctx, next) {
  console.log(ctx);
  next();
});
o.go({});
```

## 使用 reduce 进行简写

可以这样思考, 需要实现这样的效果:

```js
f1(ctx, f2);
f2(ctx, f3);
f3(ctx, done);
```

由于 f2, f3 执行需要传入参数 ctx 和 next, 所以需要再包装一层函数:

```js
f1(ctx, () => 代码2);
f2(ctx, () => 代码1);
f3(ctx, () => done);
```

最后相当于执行:

```js
[f1, f2, f3].reduceRight(
  (next, f) => () => f(ctx, next),
  () => {}
);
```

完整代码如下:

```js
const app = {
  done(ctx) {
    console.log("done", ctx);
  },
  use(fn) {
    app.middleware = app.middleware || [];
    app.middleware.push(fn);
  },
  go(ctx) {
    app.middleware = app.middleware || [];
    app.middleware.reduceRight(
      (p, c) => () => c(ctx, p),
      () => app.done(ctx)
    )();
  }
};

app.use(function f1(ctx, next) {
  console.log(1);
  ctx.name = "Lucy";
  setTimeout(() => {
    next();
  }, 2000);
});
app.use(function f2(ctx, next) {
  console.log(2);
  ctx.age = 12;
  next();
});
app.use(function f3(ctx, next) {
  console.log(ctx);
  next();
});
let ctx = {};
app.go(ctx);
```
