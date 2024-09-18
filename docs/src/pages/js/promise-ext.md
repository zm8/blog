# Promise 衍生方法(catch, all, race, deferred)的实现

```js
Promise.resolve = function (value) {
  return new Promise((resolve, reject) => {
    resolve(value);
  });
};

Promise.reject = function (reason) {
  return new Promise((resolve, reject) => {
    reject(reason);
  });
};

Promise.prototype.catch = function (fn) {
  return this.then(null, fn);
};

Promise.prototype.finally = function (fn) {
  // return v 和 throw v 为了透传
  return this.then(
    (v) => {
      fn();
      return v;
    },
    (v) => {
      fn();
      throw v;
    }
  );
};

Promise.all = function (promises) {
  return new Promise((resolve, reject) => {
    let arr = [];
    let j = 0;
    let len = promises.length;
    for (let i = 0; i < len; i++) {
      Promise.resolve(promises[i]).then(
        (data) => {
          arr[i] = data;
          j++;
          if (j == len) {
            resolve(arr);
          }
        },
        (reason) => {
          reject(reason);
        }
      );
    }
  });
};

Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
    let len = promises.length;
    for (let i = 0; i < len; i++) {
      Promise.resolve(promises[i])
        .then((data) => {
          resolve(data);
        })
        .catch((v) => {
          reject(v);
        });
    }
  });
};

Promise.deferred = function () {
  var dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};

// Promise.deferred 的使用
let dtd = Promise.deferred();
async function f() {
  const res = await dtd.promise;
  console.log(res);
}
f();
setTimeout(() => {
  dtd.resolve("done");
}, 2000);
```
