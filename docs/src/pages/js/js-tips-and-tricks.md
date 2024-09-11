# JavaScript 技巧和示例

## 判断一个元素是否能在数组里找到

使用 `_.some` 而不是 `_.find`,
因为 \_.find 找到的元素有可能是 `0` 或者 `false` 或则 `''`, 从而造成 bug

```javascript
var arr = [0, 1, 2];
if (_.find(arr, (item) => item === 0)) {
  // 返回0, 所以找不到
  console.log("找到了");
}

// 改成
if (_.some(arr, (item) => item === 0)) {
  console.log("找到了");
}
```

## react 根据条件渲染元素的时候

不要用 `_.size`, 因为当元素为空时, 就会渲染出 0;
使用 `_.isEmpty` 去判断;

```javascript
// react
render(){
    const arr = [];
    return {_.size(arr) && <div>title</div>} // 渲染出0
}

// react
render(){
    const arr = [];
    return {!_.isEmpty(arr) && <div>title</div>}
}
```

## lodash 对于 string 没有 `_.indexOf` 方法

使用`_.includes`, 而`_.indexOf` 是数组的方法

```js
_.chain("11ab22").includes("ab").value(); // 返回 true
```

另外 `_.startsWith`, 可以判断是否以某个字符串开头;

```js
_.startsWith("abc", "a"); // true
_.startsWith("abc", "b"); // false
```

## `_.truncate`

可用来添加省略号。

```js
// 返回 h....
_.truncate("hello", {
  length: 4
});
```

## 字母转为大小写

转换大写, 使用 `_.toUpper` 而不是 `_.upperCase`,
转换小写, 使用 `_.toLower` 而不是 `_.lowerCase`

```js
_.toUpper("--foo-bar--");
// => '--FOO-BAR--'

_.upperCase("--foo-bar");
// => 'FOO BAR'

_.toLower("--Foo-Bar--");
// => '--foo-bar--'

_.lowerCase("--Foo-Bar--");
// => 'foo bar'
```

## 模版字符串

如果使用标记的模板字符串，则第一个参数的值始终是字符串值的数组。 其余参数获取传递到模板字符串中的表达式的值！

```javascript
function getPersonInfo(one, two, three) {
  console.log(one); // ["", " is ", " years old", raw: ["", " is ", " years old"] ]
  console.log(two); // Lydia
  console.log(three); // 21
}

var person = "Lydia";
var age = 21;
getPersonInfo`${person} is ${age} years old`;
```

## 字符串当作对象的属性

```javascript
const a = {};
const b = { key: "b" };
const c = { key: "c" };

a[b] = 123;
a[c] = 456;

console.log(a[b]); // 输出 456
```

试图将一个对象设置为对象的键值, 那么 这个 key 会转换成 `"[object Object]"`,
所以上面的代码 `a[b]` 就相当于 `a["[object Object]"]`,
`a[c]` 相当于 `a["[object Object]"]`, `a[c]`会覆盖 `a[b]`

## JS 哪些值是假值?

- undefined
- null
- NaN
- 0
- '' (empty string)
- false

## JavaScript 中的所有内容都是?

原始或对象

原始数据类型和基本数据类型一个意思；

JavaScript 中共有 6 种基本数据类型：`Undefined、Null、Boolean、Number、String、Symbol`

对象类型有: `Object 类型、Array 类型、Date 类型、RegExp 类型、Function 类型`

## `[..."Lydia"]` 返回什么?

返回 `["L", "y", "d", "i", "a"]`

## 解构

多次解构, 就可以拿到 part 的值。

```js
const obj = {
  part: {
    name: "David",
    age: 37
  }
};

const {
  part: { name, age },
  part
} = obj;
```

## 数字分隔符

数字分隔符是在 `ECMAScript 2021（ES12）`, `Chrome 75` 版本就开始支持了。

```js
const myMoney = 1_000_000_000_000;
// 等价于
const myMoney = 1000000000000;
```

## 生成随机字符串

`Math.random()` 生成随机数 `0.6142088877102427`, `toString(36)`转换成 36 进制 `0.m40j2pdqw8o`, `substr(2,10)` 进行字符串截取。

```js
const str = Math.random().toString(36).substr(2, 10);
console.log(str); // 'm40j2pdqw8'
```

## 使用 while 简写循环

下面的代码输出 `1, 2, 3`

```js
var i = 0;
while (i++ < 3) {
  console.log(i);
}

// 相当于
var i = 0;
while (i < 3) {
  i++;
  console.log(i);
}
```

## Array.includes 判断多个 if 条件

```js
//Longhand
if (x === "abc" || x === "def" || x === "ghi" || x === "jkl") {
  //logic
}

//Shorthand
if (["abc", "def", "ghi", "jkl"].includes(x)) {
  //logic
}
```

## 三元运算符实现短函数调用

```js
// Longhand
function test1() {
  console.log("test1");
}
function test2() {
  console.log("test2");
}
var test3 = 1;
if (test3 == 1) {
  test1();
} else {
  test2();
}

// Shorthand
(test3 === 1 ? test1 : test2)();
```

## 比较大小使用 a - b > 0 的方式更好，用 a > b 有时候会出现错误

```js
// 错误用法
"20" > "100"; // true

// 预期结果
"20" - "100" > 0; // false
```

## for...of 和 for... in

`for...of` 遍历[可迭代对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols), 比如 String, Array, Map, Set; 返回这些对象的值;

`for...in` 遍历普通对象, 遍历的时候还会返回 原型上的属性, 需要通过 hasOwnProperty 进行判断;

## switch 语句优化成用字典的形式

```js
let notificationPtrn;
switch (notification.type) {
  case "citation":
    notificationPtrn = "You received a citation from {{actingUser}}.";
    break;
  case "follow":
    notificationPtrn = "{{actingUser}} started following your work";
    break;
  case "mention":
    notificationPtrn = "{{actingUser}} mentioned you in a post.";
    break;
  default:
  // Well, this should never happen
}
```

优化成:

```js
const textOptions = {
  citation: "You received a citation from {{actingUser}}.",
  follow: "{{actingUser}} started following your work",
  mention: "{{actingUser}} mentioned you in a post."
};
function getNotificationPtrn(textOptions, n) {
  return textOptions[n.type];
}
const notificationPtrn = getNotificationPtrn(textOptions, notification);
```

## 链式取值 a[0].b 不存在的 undefined 问题

```js
var obj = {
  a: {
    b: [1, 2, 3, 4]
  },
  a1: 121,
  a2: "name"
};
let { b: result = "default" } = obj; // result: 'default'
```

## string 强制转换为数字

可以用\*1;
使用`Number.isNaN`来判断是否为 NaN,
或者使用 `a !== a` 来判断是否为 NaN

```js
"32" * 1; // 32
"ds" * 1; // NaN
null * 1; // 0
undefined * 1; // NaN
1 * { valueOf: () => "3" }; // 3
```

常用：也可以使用+来转化字符串为数字

```js
+"123" + // 123
  "ds" + // NaN
  "" + // 0
  null + // 0
  undefined + // NaN
  { valueOf: () => "3" }; // 3
```

## 使用 filter 过滤数组中的所有假值

```js
const compact = (arr) => arr.filter(Boolean);
compact([0, 1, false, 2, "", 3, "a", "e" * 23, NaN, "s", 34]);
```

## 取整 | 0

```js
1.3 |
  (0 - // 1
    1.9) |
  0; // -1
```

## 判断奇偶数 & 1

```js
const num = 3;
!!(num & 1); // true
!!(num % 2); // true
```

## 强制参数,缺失报错

```js
logError = () => {
  throw new Error("Missing parameter!");
};
foo = (bar = logError()) => {
  // 这里如果不传入参数，就会执行logError 函数报出错误(此处也可以添加日志打印等操作)
  return bar;
};
```

## 比较时间先后顺序可以使用字符串

```js
var a = "2014-08-08";
var b = "2014-09-09";

console.log(a > b, a < b); // false true
console.log("21:00" < "09:10"); // false
console.log("21:00" < "9:10"); // true   时间形式注意补0
```

## 各种进制

8 进制: 0o
16 进制: 0x
2 进制: 0b

```js
29; // 10进制
035; // 8进制29      原来的方式
0o35; // 8进制29      ES6的方式
0x1d; // 16进制29
0b11101; // 2进制29
```

## 数组的对象解构

```
var {1: aaa} = [8,9,10];
aaa; // 9
```

## 使用解构删除对象某个属性

```
let {_internal, tooBig, ...cleanObject} = {el1: '1', _internal:"secret", tooBig:{}, el2: '2', el3: '3'};

console.log(cleanObject);    // {el1: '1', el2: '2', el3: '3'}
```

## 解构嵌套对象属性

```js
var oo = { a: { b: { c: 1 } } };

var ff = ({ a }) => {
  console.log(a);
};
ff(oo); // {b: {c: 1}}

var ff = ({ a: { b } }) => {
  console.log(b);
};
ff(oo); // {c: 1}

var ff = ({
  a: {
    b: { c }
  }
}) => {
  console.log(c);
};
ff(oo); // 1
```

相当于:

```
var oo = {a: {b: {c: 1}}};
var {a} = oo; // {b: {c: 1}}

var {a: {b}} = oo; // {c: 1}

var {a: {b: {c}}} = oo; // 1

```
