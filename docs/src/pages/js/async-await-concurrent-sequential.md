# async await 异步的并发执行和按顺序的写法

## 1. 前置

代码:

```js
const delay = (time) => new Promise((r) => window.setTimeout(r, time * 1000))
const arr = [1, 1, 1]
```

## 2. 并发

### 1. forEach

```js
arr.forEach(async (item) => {
  await delay(item)
  console.log('done')
})
```

可以这么理解, forEach 内部的每个函数的执行, 并没有进行 `await`, 相当于下面的代码:

```js
Array.prototype.forEach2 = function (fn) {
  for (let i = 0; i < this.length; i++) {
    fn(this[i], i, this)
  }
}
```

假设 forEach 内部的代码是下面的实现, 才是按顺序的:

```js
Array.prototype.forEach2 = async function (fn) {
  for (let i = 0; i < this.length; i++) {
    await fn(this[i], i, this)
  }
}
```

## 3. 顺序

### 1. for 遍历循环

```js
async function fn() {
  for (let i = 0; i < arr.length; i++) {
    await delay(arr[i])
    console.log('done')
  }
}
fn()
```

### 2. for...of 循环

```js
async function fn() {
  for (const item of arr) {
    await delay(item)
    console.log('done')
  }
}
fn()
```

### 3. for...in 循环

这个用来遍历对象, 数组也是对象, 也可以遍历

```js
async function fn() {
  for (const i in arr) {
    await delay(arr[i])
    console.log('done')
  }
}
fn()
```

## 4. 并发调用, 按顺序执行

```js
const arrP = arr.map((item) => delay(item))
async function fn() {
  for (const item of arrP) {
    await item
    console.log('done')
  }
}
fn()
```
