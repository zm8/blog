# Promise 重要知识点

## 未捕获的错误

下面的代码中会抛出一个未捕获的 `Promise` **错误**, `promise.catch` 并没有捕获到这个错误。

原因是: 执行了这个代码 `promise.finally(() => {});`

```ts
let resolve: any;
let reject: any;

const promise = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});

promise.finally(() => {}); // 换成 promise.then 也一样

promise.catch(() => {});

reject("error");
```
