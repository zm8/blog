# 函数防抖与节流

## 1. 防抖(debounce)

### 使用场景

1. 用户输入, search 搜索
2. 监听 resize, 不断的调整窗口大小

### 基础版

```js
const debounce = (fn, delay) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};
```

### 升级版

优点是:

1. 首次调用马上执行;
2. 防抖执行完之后, 下次的调用马上执行;
3. 支持取消功能;

主要是通过一个变量来判断, 支持传递 `isExec` 为 true

```js
const debounce = (fn, delay) => {
  let timer;
  let isExec = true;
  const debounceFn = function (...args) {
    if (isExec) {
      isExec = false;
      fn.apply(this, args);
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      isExec = true;
      timer = null;
    }, delay);
  };
  debounceFn.cancel = () => {
    clearTimeout(timer);
    isExec = true;
    timer = null;
  };
  return debounceFn;
};
```

### lodash 版本

默认 leading 是 false, trailing 是 true, 所以让 leading 为 true, 体验会更好。
PS: 如果 leading 和 trailing 都为 false, 则这个函数 1 次都不会执行。

```js
_.debounce(func, wait, {
  leading: true
});
```

## 2. 截流

### 1.使用场景

1. 监听滚动事件：实现触底加载更多功能
   为什么不要用防抖，因为如果用户滚动到底部, 还得再等 delay 时间, 体验相对不太好。
   而截流, 指定间隔时间一定会执行，虽然某个时间点可能和 防抖 执行的时间一样长。

2. 射击游戏的一直发送子弹, 控制发射速度。

### 2.基础版

```js
const throttle = (fn, delay) => {
  let timer = null;
  const throttleFn = function (...args) {
    if (timer) return;
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
  return throttleFn;
};
```

### 3.升级版

优点:

1. 首次会执行
2. 如果上次执行的时间过去很久了, 那么也会执行

```js
const throttle = (fn, delay) => {
  let timer = null;
  let lastTime = null;
  const throttleFn = function (...args) {
    const curTime = Date.now();
    // 首次执行 或者 上次最后执行的时间已经过去了很久
    if (!lastTime || curTime - lastTime > delay) {
      fn.apply(this, args);
      clearTimeout(timer);
      timer = null;
      lastTime = curTime;
      return;
    }
    if (timer) return;
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
      lastTime = curTime;
    }, delay);
  };
  throttleFn.cancel = () => {
    clearTimeout(timer);
    timer = null;
    lastTime = Date.now();
  };
  return throttleFn;
};
```

### 4.lodash 版本

默认 leading 和 trailing 都会 true, 所以只要像下面这样写。
PS: 如果 leading 和 trailing 都为 false, 则这个函数 1 次都不会执行。

```js
_.throttle(func, wait);
```
