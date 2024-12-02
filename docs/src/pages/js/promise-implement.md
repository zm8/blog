# Promise 的实现

下面的代码是参考 [Promise/A+ 规范](https://promisesaplus.com/) 实现的。

- 构造函数中 `resolve` 的值还可以是 `MyPromise` 实例。
- `then` 方法中 `onResolved` 和 `onRejected` 的返回值还可以是 `MyPromise` 实例。
- `then` 的函数的执行是一个微任务。

```ts
type Status = "pending" | "resolved" | "rejected";

type ResolveCallback<T> = (value: T) => void;
type RejectCallback = (value: unknown) => void;

type ResolvedCallback<T, K> = (value: T) => K | MyPromise<K> | Thenable<T, K> | Function;
type RejectedCallback<K> = (reason: unknown) => K;

type ExecutorCallback<T> = (resolve: ResolveCallback<T>, reject: RejectCallback) => void;

const scheduleMicroTask = (fn: (...args: any[]) => void) => {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
  } else {
    setTimeout(fn, 0);
  }
};

// T is the value resolved by the constructor, and K is the value resolved by the new Promise.
type ResolvedValue<T, K> = K | MyPromise<K> | Thenable<T, K> | Function;

type Thenable<T, K> = {
  then?: (
    onResolved: ResolvedCallback<T, K> | ((value: T) => void),
    onRejected: RejectedCallback<K> | ((reason: unknown) => void)
  ) => MyPromise<K>;
};

const isPromiseLike = (value: any) => {
  return value !== null && (typeof value === "object" || typeof value === "function");
};

const resolvePromise = <T, K>(
  promise2: MyPromise<K>,
  resolvedValue: ResolvedValue<T, K>,
  resolve: ResolveCallback<K>,
  reject: RejectCallback
) => {
  if (promise2 === resolvedValue) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }

  // Handle MyPromise resolution
  if (resolvedValue instanceof MyPromise) {
    if (resolvedValue.status === "pending") {
      resolvedValue.then((y) => resolvePromise(promise2, y, resolve, reject), reject);
    } else {
      resolvedValue.then(resolve, reject);
    }
    return;
  }

  // Handle Thenable or Function resolution
  if (isPromiseLike(resolvedValue)) {
    // The then method is user-defined, so it is necessary to check whether it has already been called.
    let called = false;
    try {
      const then = (resolvedValue as Thenable<T, K>).then;
      if (typeof then === "function") {
        then.call(
          resolvedValue,
          (y) => {
            if (called) return;
            called = true;
            return resolvePromise(promise2, y as unknown as K, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            return reject(r);
          }
        );
      } else {
        resolve(resolvedValue as K);
      }
    } catch (e) {
      if (called) return;
      called = true;
      return reject(e);
    }
  } else {
    resolve(resolvedValue as K);
  }
};

class MyPromise<T> {
  status: Status = "pending";
  #onResolvedCallbacks: ((value: T) => void)[] = [];
  #onRejectedCallbacks: ((reason: unknown) => void)[] = [];
  #data: T | MyPromise<T> | unknown;
  constructor(executor: ExecutorCallback<T>) {
    const resolve: ResolveCallback<T> = (value) => {
      if (value instanceof MyPromise) {
        value.then(resolve, reject);
        return;
      }
      scheduleMicroTask(() => {
        if (this.status === "pending") {
          this.status = "resolved";
          this.#data = value;
          this.#onResolvedCallbacks.forEach((fn) => fn(value));
        }
      });
    };
    const reject: RejectCallback = (value) => {
      scheduleMicroTask(() => {
        if (this.status === "pending") {
          this.status = "rejected";
          this.#data = value;
          this.#onRejectedCallbacks.forEach((fn) => fn(value));
        }
      });
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  then<K>(
    onResolved?: ResolvedCallback<T, K> | null,
    onRejected?: RejectedCallback<K> | null
  ): MyPromise<K> {
    onResolved = typeof onResolved === "function" ? onResolved : (v: T) => v as unknown as K;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (r: unknown) => {
            throw r;
          };

    let promise2: MyPromise<K>;
    if (this.status === "resolved") {
      return (promise2 = new MyPromise<K>((resolve, reject) => {
        scheduleMicroTask(() => {
          try {
            const resolvedValue = onResolved(this.#data as T);
            resolvePromise(promise2, resolvedValue, resolve, reject);
          } catch (reason) {
            reject(reason);
          }
        });
      }));
    }

    if (this.status === "rejected") {
      return (promise2 = new MyPromise<K>((resolve, reject) => {
        scheduleMicroTask(() => {
          try {
            const resolvedValue = onRejected(this.#data);
            resolvePromise(promise2, resolvedValue, resolve, reject);
          } catch (reason) {
            reject(reason);
          }
        });
      }));
    }

    if (this.status === "pending") {
      return (promise2 = new MyPromise<K>((resolve, reject) => {
        this.#onResolvedCallbacks.push((value) => {
          try {
            const resolvedValue = onResolved(value);
            resolvePromise(promise2, resolvedValue, resolve, reject);
          } catch (reason) {
            reject(reason);
          }
        });
        this.#onRejectedCallbacks.push((reason) => {
          try {
            const resolvedValue = onRejected(reason);
            resolvePromise(promise2, resolvedValue, resolve, reject);
          } catch (reason) {
            reject(reason);
          }
        });
      }));
    }
    throw new Error("Unkown status");
  }

  static deferred() {
    type Deferred = {
      promise: MyPromise<unknown>;
      resolve: ResolveCallback<unknown>;
      reject: RejectCallback;
    };
    const dfd: Partial<Deferred> = {};
    dfd.promise = new MyPromise((resolve, reject) => {
      dfd.resolve = resolve;
      dfd.reject = reject;
    });
    return dfd;
  }
}

export default MyPromise;
```

## 测试代码

1. 安装

```bash
pnpm i promises-aplus-tests -D
```

2. `package.json` 中添加

```json
"scripts": {
  "test": "promises-aplus-tests ./src/MyPromise.cjs"
}
```

3. 代码转换成 `ES5`, 并且添加 `module.exports`, 保存到文件 `MyPromise.cjs`。

4. 执行测试

```bash
pnpm test
```

```js
var __classPrivateFieldSet =
  (this && this.__classPrivateFieldSet) ||
  function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
      throw new TypeError(
        "Cannot write private member to an object whose class did not declare it"
      );
    return (
      kind === "a" ? f.call(receiver, value) : f ? (f.value = value) : state.set(receiver, value),
      value
    );
  };
var __classPrivateFieldGet =
  (this && this.__classPrivateFieldGet) ||
  function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
      throw new TypeError(
        "Cannot read private member from an object whose class did not declare it"
      );
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  };
var _MyPromise_onResolvedCallbacks, _MyPromise_onRejectedCallbacks, _MyPromise_data;
const scheduleMicroTask = (fn) => {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
  } else {
    setTimeout(fn, 0);
  }
};
const isPromiseLike = (value) => {
  return value !== null && (typeof value === "object" || typeof value === "function");
};
const resolvePromise = (promise2, resolvedValue, resolve, reject) => {
  if (promise2 === resolvedValue) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }
  // Handle MyPromise resolution
  if (resolvedValue instanceof MyPromise) {
    if (resolvedValue.status === "pending") {
      resolvedValue.then((y) => resolvePromise(promise2, y, resolve, reject), reject);
    } else {
      resolvedValue.then(resolve, reject);
    }
    return;
  }
  // Handle Thenable or Function resolution
  if (isPromiseLike(resolvedValue)) {
    // The then method is user-defined, so it is necessary to check whether it has already been called.
    let called = false;
    try {
      const then = resolvedValue.then;
      if (typeof then === "function") {
        then.call(
          resolvedValue,
          (y) => {
            if (called) return;
            called = true;
            return resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            return reject(r);
          }
        );
      } else {
        resolve(resolvedValue);
      }
    } catch (e) {
      if (called) return;
      called = true;
      return reject(e);
    }
  } else {
    resolve(resolvedValue);
  }
};
class MyPromise {
  constructor(executor) {
    Object.defineProperty(this, "status", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "pending"
    });
    _MyPromise_onResolvedCallbacks.set(this, []);
    _MyPromise_onRejectedCallbacks.set(this, []);
    _MyPromise_data.set(this, void 0);
    const resolve = (value) => {
      if (value instanceof MyPromise) {
        value.then(resolve, reject);
        return;
      }
      scheduleMicroTask(() => {
        if (this.status === "pending") {
          this.status = "resolved";
          __classPrivateFieldSet(this, _MyPromise_data, value, "f");
          __classPrivateFieldGet(this, _MyPromise_onResolvedCallbacks, "f").forEach((fn) =>
            fn(value)
          );
        }
      });
    };
    const reject = (value) => {
      scheduleMicroTask(() => {
        if (this.status === "pending") {
          this.status = "rejected";
          __classPrivateFieldSet(this, _MyPromise_data, value, "f");
          __classPrivateFieldGet(this, _MyPromise_onRejectedCallbacks, "f").forEach((fn) =>
            fn(value)
          );
        }
      });
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  then(onResolved, onRejected) {
    onResolved = typeof onResolved === "function" ? onResolved : (v) => v;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (r) => {
            throw r;
          };
    let promise2;
    if (this.status === "resolved") {
      return (promise2 = new MyPromise((resolve, reject) => {
        scheduleMicroTask(() => {
          try {
            const resolvedValue = onResolved(__classPrivateFieldGet(this, _MyPromise_data, "f"));
            resolvePromise(promise2, resolvedValue, resolve, reject);
          } catch (reason) {
            reject(reason);
          }
        });
      }));
    }
    if (this.status === "rejected") {
      return (promise2 = new MyPromise((resolve, reject) => {
        scheduleMicroTask(() => {
          try {
            const resolvedValue = onRejected(__classPrivateFieldGet(this, _MyPromise_data, "f"));
            resolvePromise(promise2, resolvedValue, resolve, reject);
          } catch (reason) {
            reject(reason);
          }
        });
      }));
    }
    if (this.status === "pending") {
      return (promise2 = new MyPromise((resolve, reject) => {
        __classPrivateFieldGet(this, _MyPromise_onResolvedCallbacks, "f").push((value) => {
          try {
            const resolvedValue = onResolved(value);
            resolvePromise(promise2, resolvedValue, resolve, reject);
          } catch (reason) {
            reject(reason);
          }
        });
        __classPrivateFieldGet(this, _MyPromise_onRejectedCallbacks, "f").push((reason) => {
          try {
            const resolvedValue = onRejected(reason);
            resolvePromise(promise2, resolvedValue, resolve, reject);
          } catch (reason) {
            reject(reason);
          }
        });
      }));
    }
    throw new Error("Unkown status");
  }
  static deferred() {
    const dfd = {};
    dfd.promise = new MyPromise((resolve, reject) => {
      dfd.resolve = resolve;
      dfd.reject = reject;
    });
    return dfd;
  }
}
(_MyPromise_onResolvedCallbacks = new WeakMap()),
  (_MyPromise_onRejectedCallbacks = new WeakMap()),
  (_MyPromise_data = new WeakMap());

try {
  module.exports = MyPromise;
} catch (e) {}
```

:::tip 参考地址
<https://www.promisejs.org/implementing/>

<https://github.com/then/promise/>

<https://www.promisejs.org/polyfills/promise-6.1.0.js>

<https://github.com/xieranmaya/blog/issues/3>
:::
