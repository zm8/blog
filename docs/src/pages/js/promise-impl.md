# Promise 实现

## 代码说明

- `reject` 不要单单理解成是错误, 要理解成是只是一种状态, 当然错误的时候也会触发 `reject`。
- `promise` 里的 `resolve` 和 `reject` 只能执行 `1` 次, 通过 `doResolve` 函数里设置一个变量 `done` 来控制执行 1 次。
- 如果马上执行 `resolve/reject` 了, 或者延迟执行 `resolve`, 如何保证 `done(f1, f2)` 里的 `f1` 和 `f2` 会执行, 通过 `handle` 函数里创建 `handlers` 变量来存函数。
- `then` 里返回一个新的 `promise`, 怎么和上一个 `promise` 相关联, 通过上一个 `promise` 的 `done` 方法。
- 可以 `resolve` 一个 `promise。`

```js
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;

function doResolve(fn, resolve, reject) {
  var done = false;
  try {
    fn(
      function (value) {
        if (done) {
          return;
        }
        done = true;
        resolve(value);
      },
      function (value) {
        if (done) {
          return;
        }
        done = true;
        reject(value);
      }
    );
  } catch (e) {
    done = true;
    reject(e);
  }
}

function Promise(fn) {
  var state = PENDING;
  var handlers = [];
  var value = null;

  function fulfill(result) {
    state = FULFILLED;
    value = result;
    handlers.forEach(handle);
    handlers = null;
  }

  function reject(error) {
    state = REJECTED;
    value = error;
    handlers.forEach(handle);
    handlers = null;
  }

  function resolve(result) {
    try {
      // result 是一个 Promise 对象
      if (result && result.then) {
        // 如下方法也是可以的, 目前看不出什么区别
        result.then(fulfill, reject);
        // doResolve(result.then.bind(result), resolve, reject);
        return;
      }
      fulfill(result);
    } catch (e) {
      reject(e);
    }
  }

  // 这里写成同步的也没有影响, 但是为了 promise 是异步的, 所以写一个 setTimeout
  this.done = function (onFulfilled, onRejected) {
    setTimeout(() => {
      handle({
        onFulfilled,
        onRejected
      });
    }, 0);
  };

  function handle(handler) {
    if (state === PENDING) {
      handlers.push(handler);
    } else {
      if (state === FULFILLED && handler && typeof handler.onFulfilled === "function") {
        handler.onFulfilled(value);
      } else if (state === REJECTED && handler && typeof handler.onRejected === "function") {
        handler.onRejected(value);
      }
    }
  }

  this.then = function (onFulfilled, onRejected) {
    var self = this;
    return new Promise(function (resolve, reject) {
      return self.done(
        function (result) {
          if (typeof onFulfilled === "function") {
            try {
              // 当前函数的执行的返回结果, 当中下一个then的数据
              resolve(onFulfilled(result));
            } catch (ex) {
              reject(ex);
            }
          } else {
            resolve(result);
          }
        },
        function (result) {
          if (typeof onRejected === "function") {
            try {
              // 当前函数的执行的返回结果, 当中下一个then的数据
              resolve(onRejected(result));
            } catch (ex) {
              reject(ex);
            }
          } else {
            reject(result);
          }
        }
      );
    });
  };

  doResolve(fn, resolve, reject);
}
```

## 关于 then 的异步实现

promise 的 pollyfills 里面的 对于 then 的实现，会调用 asap 方法, asap 里面会依次判断 process.nextTick，setImmediate，MessageChannel，setTimeout

```js
if (typeof process !== "undefined" && process.nextTick) {
  isNodeJS = true;
  requestFlush = function () {
    process.nextTick(flush);
  };
} else if (typeof setImmediate === "function") {
  if (typeof window !== "undefined") {
    requestFlush = setImmediate.bind(window, flush);
  } else {
    requestFlush = function () {
      setImmediate(flush);
    };
  }
} else if (typeof MessageChannel !== "undefined") {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  requestFlush = function () {
    channel.port2.postMessage(0);
  };
} else {
  requestFlush = function () {
    setTimeout(flush, 0);
  };
}
```

::: tip 参考链接
https://www.promisejs.org/implementing/

https://github.com/then/promise/

https://www.promisejs.org/polyfills/promise-6.1.0.js
:::
