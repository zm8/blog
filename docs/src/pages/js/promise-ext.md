# Promise 衍生方法(catch, all, race, deferred)的实现

```ts
Promise.resolve = function <T>(value?: T | PromiseLike<T>): Promise<Awaited<T>> | Promise<void> {
  return new Promise<Awaited<T>>((resolve) => resolve(value as Awaited<T>));
};

Promise.reject = function (reason: unknown) {
  return new Promise<never>((_, reject) => reject(reason));
};

Promise.prototype.catch = function <T>(onRejected: (reason: unknown) => T) {
  return this.then(null, onRejected);
};

Promise.prototype.finally = function (onFinally: () => void) {
  return this.then(
    (value) => {
      onFinally();
      return value;
    },
    (reason) => {
      onFinally();
      throw reason;
    }
  );
};

Promise.race = function <T>(promises: Promise<T>[]) {
  return new Promise<T>((resolve, reject) => {
    promises.forEach((promise) => {
      promise.then(resolve, reject);
    });
  });
};

Promise.all = function <T>(promises: Promise<T>[]) {
  return new Promise<T[]>((resolve, reject) => {
    let resolvedCount = 0;
    const result: T[] = [];
    promises.forEach((promise, index) => {
      promise.then((value) => {
        result[index] = value;
        resolvedCount += 1;
        if (resolvedCount === promises.length) {
          resolve(result);
        }
      }, reject);
    });
  });
};
```
