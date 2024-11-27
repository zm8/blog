# ES6 小技巧

## find

```js
const arr = [1, 2, 3, 4, 5];
const res = arr.find((item) => item === 3);
console.log(res); // 3
```

## 扁平化数组

```js
const deps = [
  [1, 2, 3],
  [5, 8, 12],
  [5, 14, 79],
  [3, 64, 105]
];
let member = deps.flat(Infinity);
```

## 输入框非空的判断

```js
if (value !== null && value !== undefined && value !== "") {
  //...
}
```

可以改成:

```js
if ((value ?? "") !== "") {
  //...
}
```
