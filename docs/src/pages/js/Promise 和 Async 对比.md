# Promise 和 Async 对比

## await 总结

- await 同一行后面的内容对应 Promise 主体内容，即同步执行的 await
- 下一行的内容对应 then()里面的内容，是异步执行的
- await 同一行后面应该跟着一个 Promise 对象，如果不是，需要转换（如果是常量会自动转换）
- async 函数的返回值还是一个 Promise 对象

## Promise 和 async 区别

1. async 是 ES7, Promise 是 ES6
2. async 函数返回的是一个 Promise
3. async 本质上是 yield, 而不是 promise
4. 捕获错误 async 得用 try...catch, 而 promise 使用 catch

## Promise

ES6 提供的。
写法上:

1. `new Promise(fn)` 里的 fn 执行是同步的
2. `.then()` 执行完，返回的**还是一个 promise**，所以可以链式调用 `.then(xxx).then(xxx).then(xxx)`。
3. `.then(fn)` 里面的函数 fn 执行的是一个**微任务**，如果函数 fn 执行返回的是一个 Promise，则会等待这个 Promise resolve。

```js
const delay = (time) => new Promise((r) => setTimeout(r, time))
Promise.resolve()
  .then(() => delay(2000))
  .then(() => console.log('ok'))
```

### 原理上:

1. 控制反转
   比如我异步获取到一个数据，数据可以先存起来，但是什么时候消费这个数据，是由我的 then 控制的，
2. 只能 resolve 1 次
   防止被第 3 方连续调用我们的回调函数。

### 执行顺序

下面代码打印:

```
promise-1
promise-2
1
2
3
4
```

```js
new Promise((resolve) => {
  console.log('promise-1')
  resolve()
})
  .then((d) => {
    console.log('1')
  })
  .then(() => {
    console.log('3')
  })

new Promise((resolve) => {
  console.log('promise-2')
  resolve()
})
  .then(function () {
    console.log('2')
  })
  .then(function () {
    console.log('4')
  })
```

分析原因，promise-1 的所有的 then 不会一起放在微任务里，
因为如果 then 后面又返回了一个 promise，则后续的 then 是需要等待的。

所以执行顺序如下:

1. 执行 'promise-1'，把 `()=>console.log('1');` 放在微任务里
2. 执行 'promise-2'，把 `()=>console.log('2');` 放在微任务里
3. 执行 `console.log('1')`，把 `()=>console.log('3')` 放在微任务里。
4. 执行 `console.log('2')`，把 `()=>console.log('4')` 放在微任务里。
5. 执行 `()=>console.log('3')` 和 `()=>console.log('4')`

## async 的执行顺序

1. await 后面执行的代码并不是异步的
   如下代码输出: 1, 2, 3

```js
console.log(1)
async function fn1() {
  await fn2()
}
async function fn2() {
  console.log(2)
}
fn1()
console.log(3)
```

3. 但是在 await 之后执行的代码是一个微任务
   下面代码 `console.log(4);` 是一个微任务
   如下代码输出: 1 2 3 4

```js
console.log(1)
async function fn1() {
  await fn2()
  console.log(4)
}

async function fn2() {
  console.log(2)
}
fn1()
console.log(3)
```

如果这个时候修改 fn2 函数如下，这个时候 `console.log(2);` 是一个微任务，所以执行顺序为: 1, 3, 2, 4

```js
async function fn2() {
  await ''
  console.log(2)
}
```

### async 和 Promise 混搭

执行顺序为: 1,2,3,4,5,6

```js
console.log(1)

async function fn1() {
  await fn2()
  console.log(5)
}

async function fn2() {
  console.log(2)
}

fn1()

new Promise((resolve) => {
  console.log(3)
  resolve()
}).then(() => {
  console.log(6)
})

console.log(4)
```
