# ES6 变量的解构赋值

## 导言

本章要注意, 对象的默认值解构的写法，是用**等号**:

```js
var { x: y = 3 } = {}; // y = 3
var { x: y = 3 } = { x: 5 }; // y = 5
```

函数的默认值解构**最优**写法如下:

```js
function f({ a: c = 1, b: d = 2 } = {}) {
  console.log(c, d);
}
// 或者
function f2({ a = 1, b = 2 } = {}) {
  console.log(a, b);
}

f(); // 1, 2
f({}); // 1, 2
f({ a: 10 }); // 10, 2
f({ b: 10 }); // 1, 10
f({ a: 10, b: 10 }); // 10, 10
```

## 1. 数组的解构赋值

1.情况 1

```js
// x='a', y 为undefined, z 为[]
let [x, y, ...z] = ["a"];
```

2.情况 2

结构不成功为 undefined

```js
let [foo] = [];
```

3.下面的例子会报错, 结构不成功

```js
let [foo] = 1;
let [foo] = false;
let [foo] = NaN;
let [foo] = undefined;
let [foo] = null;
let [foo] = {};
```

4.解构 Set 结构

```js
let [x, y, z] = new Set(["a", "b", "c"]);
x; // 'a'
y; // 'b'
z; // 'c'
```

5.解构 Iterator 接口

```js
function* fibs() {
  let a = 0;
  while (true) {
    yield a;
    a++;
  }
}
let [first, second, third] = fibs();
first; // 0
second; // 1
third; // 2
```

相当于:

```js
const g = fibs();
g.next(); // {value: 0, done: false}
g.next(); // {value: 1, done: false}
g.next(); // {value: 2, done: false}
```

### 2.默认值

1.默认值结构

```js
let [foo = true] = []; // foo = true;
let [x, y = "b"] = ["a", undefined]; // x='a', y='b'
let [x, y = "b"] = ["a", null]; // x='a' y=null
```

2.惰性求值

foo 函数不会执行

```js
function foo() {
  console.log("foo");
}
const [x = foo()] = [1];
```

上面的代码等价于:

```js
let x;
if ([1][0] === undefined) {
  x = foo();
} else {
  x = [1][0];
}
```

3.默认值可以引用解构赋值的其他变量，但该变量必须已经声明。

```js
let [x = 1, y = x] = []; // x=1; y=1
let [x = y, y = 1] = []; // 报错, y还没有声明
```

但是下面这种写法不会报错, 可以用惰性求值来理解, x 执行不到 `x=y` 这个语句

```js
let [x = y, y = 1] = [5, 6]; // x=5; y=6
```

可以等价于:

```js
let x;
if ([5, 6][0] === undefined) {
  x = y;
} else {
  x = [5, 6][0];
}

if ([5, 6][1] === undefined) {
  y = 1;
} else {
  y = [5, 6][1];
}
```

## 2. 对象的解构赋值

1.简写的形式

对象的解构赋值是下面形式的简写:

```js
let { foo: foo, bar: bar } = { foo: "aaa", bar: "bbb" };
```

2.机制

对象的解构赋值的内部机制，是先找到同名属性，然后再赋给对应的变量。

```js
let { foo: baz } = { foo: "aaa", bar: "bbb" };
bar; // 'aaa'
foo; // error: foo is not undefined
```

对于嵌套结构的对象:

```js
let obj = {
  p: ["Hello", { y: "World" }]
};
let {
  p: [x, { y }]
} = obj;
x; // 'Hello'
y; // 'World'
```

这个时候 p 是模式, 不是变量, 如果要把 p 作为变量赋值, 可以写成:

```js
let {
  p,
  p: [x, { y }]
} = obj;
```

另外一个例子:

```js
const node = {
  loc: {
    start: {
      line: 1,
      column: 5
    }
  }
};
const {
  loc,
  loc: { start },
  loc: {
    start: { line }
  }
} = node;
```

3.嵌套赋值

注意必须整个表达式用括号括起来

```js
let obj = {};
let arr = [];
({ a: obj.p, b: arr[0] } = { a: 1, b: 2 });
```

不能再写成 let 的形式:

```js
let obj = {};
let arr = [];
let {a:obj.p, b: arr[0]} = {a:1, b: 2};
// Uncaught SyntaxError: Identifier 'obj' has already been declared
```

4.解构报错

因为这时 c 为 undefined, 所以这个时候取 b 就会报错

```js
let {
  c: { b }
} = { a: { b: 1 } };
```

5.对象的解构赋值可以取到继承的属性

```js
const obj1 = {};
const obj2 = { foo: "bar" };
Object.setPrototypeOf(obj1, obj2); // 相当于 obj1.__proto__ = obj2;

const { foo } = obj1; // foo: 'bar'
```

另外一个例子:

```js
var { push } = [];
push; // 也是继承来的属性;
```

### 默认值

注意, **默认值**是用等号来表示的!!!

```js
var { x = 3 } = {};
var { x: y = 3 } = { x: 5 }; // y = 3
```

所以对于函数的参数的对象解构，可以这么理解:

```js
function f({ a = 3 }) {
  console.log(a);
}
f({});
f({ a: 1 });
```

默认值生效的条件是，对象的属性值严格等于 undefined。

### 注意点

如果要将一个已经声明的变量用于解构赋值，必须非常小心。
js 引擎会将 `{x}` 理解成一个代码块，从而发生语法错误，只有不将大括号放在行首，才可以解决；

```js
let x;
{x} = {x: 10};
// 正确写法
({x} = {x: 1});
```

解构赋值允许等号左边的模式之中，不放置任何变量名。

```js
({} = [true, false]);
({} = "abc");
({} = []);
```

数组是特殊的对象，也可以对数组进行解构;

```js
let arr = [1, 2, 3];
let { 0: first, [arr.length - 1]: last } = arr;
// first = 1, last = 3
```

## 3. 字符串的解构赋值

字符串被转换成了一个类似数组的对象

```js
const [a, b, c, d] = [1, 2, 3, 4];
// a =1; b = 2; c = 3; d = 4
```

解构赋值的注意点是, 只要等号右边的值不是对象或数组, 就先将他们转为对象。由于 undefined 和 null 无法转换为对象, 所以对它们进行解构会报错;

```js
let { p } = undefined;
let { q } = null;
```

## 4. 函数的参数解构赋值

1. 没有输入参数, 指定默认参数

```js
function f(para = 1) {
  console.log(para); // 1
}
f();
```

下面的例子有参数, 相当于对象的解构: `let {a = 10} = {a: 20};`

```js
function f({ a = 10 }) {
  console.log(a);
}
f({ a: 20 });
f(); // 参数啥都没传, 会报错
```

如何解决函数的参数啥都没传, 不会报错，并且可以默认值解构:

```js
function f({ a, b } = { a: 1, b: 2 }) {
  console.log(a, b); // 1, 2
}
f();
f({ a: 1 }); // 1 undefined
```

上面的例子，若要解决`f({a: 1});` 能输出默认值 `b=2`, 则写法如下:

```js
function f({ a = 1, b = 2 } = {}) {
  console.log(a, b); // 20, 2
}
f({ a: 20 });
```

如果 `a` 和 `b` 的名字我要改成 `c` 和 `d`, 那么应该这么写,
**最终实战的版本如下:**

```js
function f({ a: c = 1, b: d = 2 } = {}) {
  console.log(c, d);
}
f({ a: 20 });
```

`undefined` 会触发函数参数的默认值。

```js
[1, undefined, 3].map((x = "yes") => x);
```

## 用途

1.交换变量的值

```js
let x = 1;
let y = 2;

[x, y] = [y, x];
```

2.遍历 Map 结构

```js
const map = new Map();
map.set("first", "hello");
map.set("second", "world");

for (const [key, value] of map) {
  console.log(key + " is " + value);
}
```

注意, 如果 `for...of` 作用到数组, 那么解析的值是 item:

```js
var arr = [5, 6];
for (const item of arr) {
  console.log(item); // 5 6
}
```

如果只想获取键名，或者只想获取键值，可以写成下面这样。

```js
// 获取键名
for (let [key] of map) {
  // ...
}

// 获取键值
for (let [, value] of map) {
  // ...
}
```

3.输入模块的指定方法

```js
const { SourceMapConsumer, SourceNode } = require("source-map");
```

:::tip 参考地址
<https://es6.ruanyifeng.com/#docs/destructuring#%E5%9C%86%E6%8B%AC%E5%8F%B7%E9%97%AE%E9%A2%98>
:::
