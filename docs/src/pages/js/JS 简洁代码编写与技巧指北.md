# JS 简洁代码编写与技巧指北

### Array.includes 判断多个 if 条件

```js
//Longhand
if (x === 'abc' || x === 'def' || x === 'ghi' || x === 'jkl') {
  //logic
}

//Shorthand
if (['abc', 'def', 'ghi', 'jkl'].includes(x)) {
  //logic
}
```

### 三元运算符实现短函数调用

```js
// Longhand
function test1() {
  console.log('test1')
}
function test2() {
  console.log('test2')
}
var test3 = 1
if (test3 == 1) {
  test1()
} else {
  test2()
}

// Shorthand
;(test3 === 1 ? test1 : test2)()
```

### 比较大小使用 a - b > 0 的方式更好，用 a > b 有时候会出现错误

```js
// 错误用法
'20' > '100' // true

// 预期结果
'20' - '100' > 0 // false
```

### for...of 和 for... in

`for...of` 遍历[可迭代对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols), 比如 String, Array, Map, Set; 返回这些对象的值;

`for...in` 遍历普通对象, 遍历的时候还会返回 原型上的属性, 需要通过 hasOwnProperty 进行判断;

### switch 语句 优化成用字典的形式

```js
let notificationPtrn
switch (notification.type) {
  case 'citation':
    notificationPtrn = 'You received a citation from {{actingUser}}.'
    break
  case 'follow':
    notificationPtrn = '{{actingUser}} started following your work'
    break
  case 'mention':
    notificationPtrn = '{{actingUser}} mentioned you in a post.'
    break
  default:
  // Well, this should never happen
}
```

优化成:

```js
const textOptions = {
  citation: 'You received a citation from {{actingUser}}.',
  follow: '{{actingUser}} started following your work',
  mention: '{{actingUser}} mentioned you in a post.'
}
function getNotificationPtrn(textOptions, n) {
  return textOptions[n.type]
}
const notificationPtrn = getNotificationPtrn(textOptions, notification)
```

### 链式取值 a[0].b 不存在的 undefined 问题

```js
var obj = {
  a: {
    b: [1, 2, 3, 4]
  },
  a1: 121,
  a2: 'name'
}
let { b: result = 'default' } = obj // result: 'default'
```

### string 强制转换为数字

可以用\*1;
使用`Number.isNaN`来判断是否为 NaN,
或者使用 `a !== a` 来判断是否为 NaN

```js
'32' * 1 // 32
'ds' * 1 // NaN
null * 1 // 0
undefined * 1 // NaN
1 * { valueOf: () => '3' } // 3
```

常用：也可以使用+来转化字符串为数字

```js
;+'123' + // 123
  'ds' + // NaN
  '' + // 0
  null + // 0
  undefined + // NaN
  { valueOf: () => '3' } // 3
```

### 使用 filter 过滤数组中的所有假值

```js
const compact = (arr) => arr.filter(Boolean)
compact([0, 1, false, 2, '', 3, 'a', 'e' * 23, NaN, 's', 34])
```

### 取整 | 0

```js
;1.3 |
  (0 - // 1
    1.9) |
  0 // -1
```

### 判断奇偶数 & 1

```js
const num = 3
!!(num & 1) // true
!!(num % 2) // true
```

### 强制参数,缺失报错

```js
logError = () => {
  throw new Error('Missing parameter!')
}
foo = (bar = logError()) => {
  // 这里如果不传入参数，就会执行logError 函数报出错误(此处也可以添加日志打印等操作)
  return bar
}
```

### 比较时间先后顺序可以使用字符串

```js
var a = '2014-08-08'
var b = '2014-09-09'

console.log(a > b, a < b) // false true
console.log('21:00' < '09:10') // false
console.log('21:00' < '9:10') // true   时间形式注意补0
```

### 各种进制

8 进制: 0o
16 进制: 0x
2 进制: 0b

```js
29 // 10进制
035 // 8进制29      原来的方式
0o35 // 8进制29      ES6的方式
0x1d // 16进制29
0b11101 // 2进制29
```

### 数组的对象解构

```
var {1: aaa} = [8,9,10];
aaa; // 9
```

### 使用解构删除对象某个属性

```
let {_internal, tooBig, ...cleanObject} = {el1: '1', _internal:"secret", tooBig:{}, el2: '2', el3: '3'};

console.log(cleanObject);    // {el1: '1', el2: '2', el3: '3'}
```

### 解构嵌套对象属性

```js
var oo = { a: { b: { c: 1 } } }

var ff = ({ a }) => {
  console.log(a)
}
ff(oo) // {b: {c: 1}}

var ff = ({ a: { b } }) => {
  console.log(b)
}
ff(oo) // {c: 1}

var ff = ({
  a: {
    b: { c }
  }
}) => {
  console.log(c)
}
ff(oo) // 1
```

相当于:

```
var oo = {a: {b: {c: 1}}};
var {a} = oo; // {b: {c: 1}}

var {a: {b}} = oo; // {c: 1}

var {a: {b: {c}}} = oo; // 1

```
