# Pxory 学习

## 1. 前言

通常它可以读取和修改对象的属性时候进行拦截

- 读取属性时, 可以预先做一些事情
- 读取属性时, 可以返回任意值
- 修改属性时, 可以不让修改
- 修改属性时, 可以修改成任意值
- 根据特定情况, 可以抛出错误

1. 读取属性时可以预先做一些事情(比如 `console.log`)

```javascript
var obj = { a: 1 };
var objProxy = new Proxy(obj, {
  get(target, key, receiver) {
    console.log("get"); // 读取前做点事情
    return "lalalala"; // 改变最终返回值
  }
});
objProxy.a;
// get
// lalalala
```

## 2. 抛出错误

```javascript
var obj = { a: 1, b: 2 };
var objProxy = new Proxy(obj, {
  get(target, key, receiver) {
    if (key === "b") throw "err b";
    return target[key]; // 返回真正的值
  }
});
objProxy.a; // 1
objProxy.b; // 抛出错误 'Uncaught err b'
```

## 3. 返回真正的值

```javascript
var obj = { a: 1 };
var objProxy = new Proxy(obj, {
  get(target, key, receiver) {
    console.log(objProxy === receiver);
    return target[key]; // 返回真正的值
  }
});
objProxy.a;
// true
// 1
```

## 4. Proxy 的第 2 个参数必须有, 可以是个空对象

```javascript
new Proxy({}); // error
new Proxy({}, {});
```

## 2.get

1.触发时机

```javascript
var obj = {a: 1, b: 2};
var objProxy = new Proxy(obj, {
    get(target, key, receiver){
        console.log('get');
    }
    set(target, key, value, receiver){
        console.log('set');
    }
});
objProxy.a; // 只触发 get
objProxy.b = 2; // 只触发 set
++objProxy.a; // 触发 get 和 set, 相当于objProxy.a = objProxy.a + 1;
```

2.拦截对象深层属性

下面的代码只能拦截 obj.a 和 obj.b, 但是对于属性 c 的访问, 拦截不了

```javascript
const obj = { a: 1, b: { c: 2 } };
const handler = {
  get(target, key) {
    console.log(key);
    return target[key];
  }
};
const objP = new Proxy(obj, handler);
objP.a; // 'a'
objP.b.c; // 'b'
```

修改代码如下, 让 get 返回一个新的 Proxy 对象

```javascript
const obj = { a: 1, b: { c: 2 } };
const handler = {
  get(target, key) {
    console.log(key);
    return typeof target[key] === "object" ? new Proxy(target[key], handler) : target[key];
  }
};
const objP = new Proxy(obj, handler);
objP.a; // a
objP.b.c; // b c
```

3.链式操作

```javascript
var pipe = function (initVal) {
  const arrFn = [];
  const proxy = new Proxy(
    {},
    {
      get(target, key) {
        if (key === "get") {
          return arrFn.reduce((val, next) => next(val), initVal);
        }
        arrFn.push(window[key]);
        return proxy;
      }
    }
  );
  return proxy;
};

var double = (n) => n * 2;
var pow = (n) => n * n;
pipe(3).double.pow.get; // 63
```

1. 生成各种 DOM 节点的通用函数 dom

```javascript
const dom = new Proxy(
  {},
  {
    get(target, key) {
      return (attrs, ...children) => {
        const dom = document.createElement(key);
        for (const i in attrs) {
          dom.setAttribute(i, attrs[i]);
        }
        for (const el of children) {
          if (typeof el === "string") {
            dom.appendChild(document.createTextNode(el));
          } else {
            dom.appendChild(el);
          }
        }
        return dom;
      };
    }
  }
);

const el = dom.div(
  { a: 1 },
  "Hello, my name is ",
  dom.a({ href: "//example.com" }, "Mark"),
  ". I like:",
  dom.ul({}, dom.li({}, "The web"), dom.li({}, "Food"), dom.li({}, "…actually that's it"))
);

document.body.appendChild(el);
```

## 3.set

:::tip

严格模式下，set 函数必须返回 true，否则代码直接报错，执行不下去

:::

1. 防止这些内部属性被外部读写

```javascript
"use strict";

const obj = { a: 1, _b: 2 };
const objP = new Proxy(obj, {
  set(target, key, val) {
    if (key[0] === "_") throw "不允许访问私有属性";
    target[key] = val;
    return true;
  }
});

objP.a = 3;
console.log(obj.a, objP.a); // 3, 3
objP._b = 222; // Uncaught 不允许访问私有属性
```

## 5.deleteProperty

严格模式下, 必须返回 true, 否则会报错；
非严格模式, 不返回 true, 其实可以正常删除。

```javascript
"use strict";
const obj = { a: 1 };
const objP = new Proxy(obj, {
  deleteProperty(target, key) {
    delete target[key];
    return true;
  }
});
delete objP.a;
console.log("obj.a", obj.a); // undefined
console.log("objP.a", objP.a); // undefined
```

## 6.apply

拦截函数的执行

1. 基本用法

```javascript
const fn = (a, b) => console.log(a, b);
const fnP = new Proxy(fn, {
  apply(target, ctx, args) {
    console.log(target); // fn
    console.log(ctx); // window
    console.log(args); // [1, 2]
  }
});

fnP.call(window, 1, 2); // 或  fnP.apply(window, [1, 2]);
```

2. 让返回的结果 2 倍

```javascript
const fn = (a, b) => a + b;
const fnP = new Proxy(fn, {
  apply(target, ctx, args) {
    return target.apply(ctx, args) * 2; // 或 return Reflect.apply(...arguments) * 2;
  }
});
fn(1, 2); // 3;
fnP(1, 2); // 6;
```

## 7.Proxy.revocable()

返回一个可取消的 proxy 实例, 一旦取消, 就不能访问这个实例了。

```javascript
const { proxy, revoke } = Proxy.revocable({}, {});
proxy.a = 2;
proxy.a; // 2
revoke();
proxy.a; // error
```

## 8.this 问题

对象函数里的 this 等于了 Proxy 的实例

```javascript
const obj = {
  fn() {
    console.log(this === p);
  }
};
const p = new Proxy(obj, {});

obj.fn(); // false
p.fn(); // true
```

访问原生对象的一些函数方法的时候就会报错:

```javascript
const d = new Date();
console.log(d.getTime()); // 正常

const p = new Proxy(d, {});
console.log(p.getTime()); // error
```

解决方式 是使用 bind

```javascript
const d = new Date();
console.log(d.getTime()); // 正常

const p2 = new Proxy(d, {
  get(target, key) {
    return target[key].bind(target);
  }
});

console.log(p2.getTime()); // 正常
```

另外拦截器 handler 内部的 this, 等于自身

```javascript
const o = {};
const handler = {
  get() {
    console.log(this === handler); // true
  }
};
const proxy = new Proxy(o, handler);
proxy.a;
```

## 9.实例：Web 服务的客户端

```javascript
const httpGet = (url) => {
  return new Promise((resolve) =>
    resolve({
      code: 0,
      url
    })
  );
};

const createWebService = (baseUrl) => {
  return new Proxy(
    {},
    {
      get(target, key) {
        return () => httpGet(baseUrl + "/" + key);
      }
    }
  );
};
const service = createWebService("http://example.com/");

service.employees().then((data) => {
  console.log(data);
});

service.department().then((data) => {
  console.log(data);
});
```
