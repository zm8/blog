# 函数柯里化

假如要实现以下功能:

```js
sum(1)(2) // 3
sum(2)(3) // 4
```

第一个想法是:

```js
const sum = (a) => (b) => a + b
```

## 柯里化

### 简化版的柯里化

```js
const sum = (a, b) => a + b
const curry =
  (fn) =>
  (...args) =>
    fn.apply(null, args)
const curriedSum = curry(sum)
curriedSum(1, 2)
```

### 复杂版的柯里化

```js
const sum = (a, b, c) => a + b + c

const curriedSum = curry(sum)
curriedSum(1, 2, 3)
curriedSum(1)(2)(3)
curriedSum(1, 2)(3)
```

最终 curry 的实现方式如下:

```js
const curry =
  (fn) =>
  (...args) => {
    if (args.length >= fn.length) {
      return fn.apply(null, args)
    } else {
      return (...args2) => curry(fn).apply(null, args.concat(args2))
    }
  }
```
