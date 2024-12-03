# Promise 的实现

## 1.如何实现

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

## 2.分析实现

### 2.1 当 resolve 或者 reject 的值是 MyPromise 实例

```ts
new MyPromise((resolve) => {
  resolve(MyPromise.resolve("success"));
  // 或者
  // resolve(MyPromise.reject("error"));
}).then((res) => {
  console.log(res);
});
```

它会走到构造函数里的 `resolve` 方法里:

```ts
constructor(executor: ExecutorCallback<T>) {
  const resolve: ResolveCallback<T> = (value) => {
    if (value instanceof MyPromise) {
      value.then(resolve, reject);
      return;
    }
    // ...
  };
}
```

### 2.2 当 then 的返回值是 Promise 本身

会抛出 `Promise` 的链式循环错误。

```ts
let promise2: MyPromise<void>;

promise2 = new MyPromise<void>((resolve) => {
  resolve();
}).then(() => promise2);

promise2.catch((res: any) => console.error(res));
```

它会走到 `resolvePromise` 里的:

```ts
const resolvePromise = (promise2, resolvedValue, resolve, reject) => {
  // ...
  if (promise2 === resolvedValue) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }
  // ...
};
```

### 2.3 当 then 的返回值是 Promise 对象

它会等到 Promise 对象 resolve 后，再执行 `then` 的回调函数。

```ts
new MyPromise<void>((resolve) => {
  resolve();
}).then(() => MyPromise.resolve(2));
```

它会走到 `resolvePromise` 里的:

```ts
const resolvePromise = (promise2, resolvedValue, resolve, reject) => {
  // ...
  if (resolvedValue instanceof MyPromise) {
    if (resolvedValue.status === "pending") {
      resolvedValue.then((y) => resolvePromise(promise2, y, resolve, reject), reject);
    } else {
      resolvedValue.then(resolve, reject);
    }
    return;
  }
  // ...
};
```

### 2.4 当 then 的返回值是 Thenable 对象

它会等到 Thenable 对象 resolve 后，再执行 `then` 的回调函数。

```ts
const obj = {
  then: (onResolved: (value: string) => void) => {
    setTimeout(() => {
      onResolved("success");
    }, 1000);
  }
};
new MyPromise<void>((resolve) => {
  resolve();
})
  .then(() => obj)
  .then((res) => console.log(res));
```

或者

```ts
interface Fn {
  (...args: any[]): void;
  then: (onResolved: (value: string) => void) => void;
}
const fn: Fn = () => {};
fn.then = (onResolved) => {
  setTimeout(() => {
    onResolved("success");
  }, 2000);
};

new MyPromise<void>((resolve) => {
  resolve();
})
  .then(() => fn)
  .then((res) => console.log(res));
```

它会走到 `resolvePromise` 里的:

```ts
const resolvePromise = (promise2, resolvedValue, resolve, reject) => {
  // ...
  if (isPromiseLike<K>(resolutionValue)) {
    let called = false;
    try {
      const then = resolutionValue.then;
      if (typeof then === "function") {
        // 会走到这里
      }
    } catch (e) {
      // ...
    }
  }
};
```

## 3.测试代码

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
var _MyPromise_resolvedCallbacks, _MyPromise_rejectedCallbacks, _MyPromise_data;
const scheduleTask = (fn) => {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
  } else {
    setTimeout(fn, 0);
  }
};
/* 对象和函数上面都有可能有 then 方法 */
const isPromiseLike = (value) => {
  return value !== null && (typeof value === "object" || typeof value === "function");
};
const resolvePromise = (promise2, resolutionValue, resolve, reject) => {
  if (promise2 === resolutionValue) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }
  // Handle MyPromise resolution
  if (resolutionValue instanceof MyPromise) {
    if (resolutionValue.status === "pending") {
      resolutionValue.then((y) => resolvePromise(promise2, y, resolve, reject), reject);
    } else {
      resolutionValue.then(resolve, reject);
    }
    return;
  }
  // Handle Thenable or Function resolution
  if (isPromiseLike(resolutionValue)) {
    let called = false;
    try {
      // 2.3.3.1 因为x.then有可能是一个getter，这种情况下多次读取就有可能产生副作用
      // 所以只能读取一次, 后面使用 call 来调用它
      const then = resolutionValue.then;
      if (typeof then === "function") {
        then.call(
          resolutionValue,
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
        resolve(resolutionValue);
      }
    } catch (e) {
      if (called) return;
      called = true;
      return reject(e);
    }
  } else {
    resolve(resolutionValue);
  }
};
class MyPromise {
  constructor(executor) {
    this.status = "pending";
    _MyPromise_resolvedCallbacks.set(this, []);
    _MyPromise_rejectedCallbacks.set(this, []);
    _MyPromise_data.set(this, void 0);
    const resolve = (value) => {
      if (value instanceof MyPromise) {
        value.then(resolve, reject);
        return;
      }
      scheduleTask(() => {
        if (this.status === "pending") {
          this.status = "resolved";
          __classPrivateFieldSet(this, _MyPromise_data, value, "f");
          __classPrivateFieldGet(this, _MyPromise_resolvedCallbacks, "f").forEach((fn) =>
            fn(value)
          );
        }
      });
    };
    const reject = (value) => {
      scheduleTask(() => {
        if (this.status === "pending") {
          this.status = "rejected";
          __classPrivateFieldSet(this, _MyPromise_data, value, "f");
          __classPrivateFieldGet(this, _MyPromise_rejectedCallbacks, "f").forEach((fn) =>
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
        scheduleTask(() => {
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
        scheduleTask(() => {
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
        __classPrivateFieldGet(this, _MyPromise_resolvedCallbacks, "f").push((value) => {
          try {
            const resolvedValue = onResolved(value);
            resolvePromise(promise2, resolvedValue, resolve, reject);
          } catch (reason) {
            reject(reason);
          }
        });
        __classPrivateFieldGet(this, _MyPromise_rejectedCallbacks, "f").push((reason) => {
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
  static resolve(value) {
    if (value === undefined) {
      return new MyPromise((resolve) => resolve());
    }
    return new MyPromise((resolve) => resolve(value));
  }
  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }
  catch(onRejected) {
    return this.then(null, onRejected);
  }
}
(_MyPromise_resolvedCallbacks = new WeakMap()),
  (_MyPromise_rejectedCallbacks = new WeakMap()),
  (_MyPromise_data = new WeakMap());

try {
  module.exports = MyPromise;
} catch (e) {}
```

## 4. ts 版本如下

```ts
type Status = "pending" | "resolved" | "rejected";

interface ResolveCallback<T> {
  (value: T | MyPromise<T>): void;
}
interface RejectCallback {
  (value: unknown): void;
}
interface ExecutorCallback<T> {
  (resolve: ResolveCallback<T>, reject: RejectCallback): void;
}

type ResolvedCallback<T, K> = ((value: T) => K | MyPromise<K> | Thenable<K>) | null;
type RejectedCallback<K> = ((reason: unknown) => K) | null;

type Thenable<K> = {
  then?: (onResolved: (value: K) => void, onRejected: (reason: unknown) => void) => void;
};

type ResolutionValue<K> = K | MyPromise<K> | Thenable<K>;

const scheduleTask = (fn: (...args: any[]) => void) => {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
  } else {
    setTimeout(fn, 0);
  }
};

/* 对象和函数上面都有可能有 then 方法 */
const isPromiseLike = <K>(value: any): value is Thenable<K> => {
  return value !== null && (typeof value === "object" || typeof value === "function");
};

const resolvePromise = <K>(
  promise2: MyPromise<K>,
  resolutionValue: ResolutionValue<K>,
  resolve: ResolveCallback<K>,
  reject: RejectCallback
): void => {
  if (promise2 === resolutionValue) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }

  // Handle MyPromise resolution
  if (resolutionValue instanceof MyPromise) {
    if (resolutionValue.status === "pending") {
      resolutionValue.then((y) => resolvePromise(promise2, y, resolve, reject), reject);
    } else {
      resolutionValue.then(resolve, reject);
    }
    return;
  }

  // Handle Thenable or Function resolution
  if (isPromiseLike<K>(resolutionValue)) {
    let called = false;
    try {
      // 2.3.3.1 因为x.then有可能是一个getter，这种情况下多次读取就有可能产生副作用
      // 所以只能读取一次, 后面使用 call 来调用它
      const then = resolutionValue.then;
      if (typeof then === "function") {
        then.call(
          resolutionValue,
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
        resolve(resolutionValue as K);
      }
    } catch (e) {
      if (called) return;
      called = true;
      return reject(e);
    }
  } else {
    resolve(resolutionValue);
  }
};

class MyPromise<T> {
  status: Status = "pending";
  #resolvedCallbacks: ((value: T) => void)[] = [];
  #rejectedCallbacks: ((reason: unknown) => void)[] = [];
  #data: T | MyPromise<T> | unknown;
  constructor(executor: ExecutorCallback<T>) {
    const resolve: ResolveCallback<T> = (value) => {
      if (value instanceof MyPromise) {
        value.then(resolve, reject);
        return;
      }
      scheduleTask(() => {
        if (this.status === "pending") {
          this.status = "resolved";
          this.#data = value;
          this.#resolvedCallbacks.forEach((fn) => fn(value));
        }
      });
    };
    const reject: RejectCallback = (value) => {
      scheduleTask(() => {
        if (this.status === "pending") {
          this.status = "rejected";
          this.#data = value;
          this.#rejectedCallbacks.forEach((fn) => fn(value));
        }
      });
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  then<K>(onResolved?: ResolvedCallback<T, K>, onRejected?: RejectedCallback<K>): MyPromise<K> {
    onResolved = typeof onResolved === "function" ? onResolved : (v: T) => v as unknown as K;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (r) => {
            throw r;
          };

    let promise2: MyPromise<K>;
    if (this.status === "resolved") {
      return (promise2 = new MyPromise<K>((resolve, reject) => {
        scheduleTask(() => {
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
        scheduleTask(() => {
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
        this.#resolvedCallbacks.push((value) => {
          try {
            const resolvedValue = onResolved(value);
            resolvePromise(promise2, resolvedValue, resolve, reject);
          } catch (reason) {
            reject(reason);
          }
        });
        this.#rejectedCallbacks.push((reason) => {
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

  static resolve(): MyPromise<void>;
  static resolve<T>(value?: T) {
    if (value === undefined) {
      return new MyPromise<void>((resolve) => resolve());
    }
    return new MyPromise<T>((resolve) => resolve(value));
  }

  static reject(reason: unknown) {
    return new MyPromise<never>((_, reject) => reject(reason));
  }

  catch<T>(onRejected: RejectedCallback<T>) {
    return this.then(null, onRejected);
  }
}

export default MyPromise;
```

## 5.其他

Promise 构造函数还可以 resolve 一个 thenable 对象。这在上面的标准实现是没有的。

```ts
const obj = {
  then: (onResolved: (value: string) => void) => {
    setTimeout(() => {
      onResolved("success");
    }, 1000);
  }
};
new Promise((resolve) => {
  resolve(obj);
}).then((res) => console.log(res));
```

:::tip 参考地址
<https://www.promisejs.org/implementing/>

<https://github.com/then/promise/>

<https://www.promisejs.org/polyfills/promise-6.1.0.js>

<https://github.com/xieranmaya/blog/issues/3>
:::
