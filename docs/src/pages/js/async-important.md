# async 函数重要知识点

## 1. await 下一行执行的时机

`await` 后面不管跟的是同步还是异步的代码, 它的下一行的代码一定是个微任务。

```ts
const init = async () => {
  console.log("async start");
  await "Any";
  console.log("async end"); // 一定是一个微任务
};
console.log("1");
init();
console.log("2");

// 输出
// 1
// async start
// 2
// async end
```

## 2. await 跟着的内容执行的时机

### 2.1 同步任务

`await` 如果跟着是同步任务, 则同步执行。

```ts
const init = async () => {
  console.log("async start");
  await console.log("同步任务"); // 比 2 先执行
  console.log("async end");
};
console.log("1");
init();
console.log("2");

// 输出
// 1
// async start
// 同步任务
// 2
// async end
```

### 2.2 异步任务

`await` 如果跟着是异步任务, 则异步执行。

```ts
const init = async () => {
  console.log("async start");
  await Promise.resolve().then(() => console.log("异步任务")); // 比 2 后执行
  console.log("async end");
};
console.log("1");
init();
console.log("2");

// 输出
// 1
// async start
// 2
// 异步任务
// async end
```
