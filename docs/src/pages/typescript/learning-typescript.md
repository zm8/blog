# 学习 Typescript

## 前言

1. 在线编辑地址: <https://www.typescriptlang.org/play>
2. 《Learning TypeScript》这本书不错, 而《深入理解 TypeScript》不行。

## TypeScript 简介

### 1. 基本类型

```ts
// number 类型
var list:number[] = [1, 2];
// 或者使用范型
var list:Array<number> = [1, 2]

// 也可以使用联合类型定义数组
var list:(number|string)[] = [1, '2'];

// enum 类型
enum Color { Red, Green, Blue}

// 会变编译成:
var Color;
(function (Color) {
    Color[Color["Red"] = 0] = "Red";
    Color[Color["Green"] = 1] = "Green";
    Color[Color["Blue"] = 2] = "Blue";
})(Color || (Color = {}));
// 相当于
var Color = {
 0: "Red"
 1: "Green"
 2: "Blue"
 Blue: 2
 Green: 1
 Red: 0
}
```

### 2. 联合类型

```js
var path: string | number[];
path = "1";
path = [1, 2];
```

### 3. 类型守护

```ts
var str = "";
if (typeof str === "string") {
  str.join; // 报错, 因为 string 没有 join 方法
}
```

### 4. 类型别名

利用 type 关键字声明类型别名,
类型别名实质上与原来的类型一样，它们仅仅是一个替代的名字。

```ts
type PArr = Array<string | number>;
var arr: PArr = ["1", 2];

// 错误: Type '() => void' is not assignable to type 'Callback'. Type 'void' is not assignable to type '{}'.
// fn 必须有返回
type Callback = () => {};
var fn: Callback = function () {
  console.log(1);
};

// 正确
type Callback = () => {};
var fn: Callback = function () {
  console.log(1);
  return 1;
};
```

### 5. 环境声明

环境声明允许在 TypeScript 代码中创建一个不会被编译到 JavaScript 中的变量。

```ts
// 创建一个接口 interface
interface ICustomConsole {
  log(...arg: number[]): void;
}
// declare 操作符创建一个环境声明
declare var cConsole: ICustomConsole;
cConsole.log(2, 3);
```

### 6. 函数

函数声明

```ts
function sum(x: number, y: number): number {
  return x + y;
}
```

函数表达式

```ts
const sum: (x: number, y: number) => number = function (x: number, y: number): number {
  return x + y;
};
```

用接口定义函数的形状

```ts
interface ISum {
  (x: number, y: number): number;
}
const sum: ISum = function (x: number, y: number): number {
  return x + y;
};
```

可选参数后面不允许再出现必需参数了：

```ts
// 报错
function sum(x?: number, y: number): number {
  return x + y;
}
```

若给函数的参数添加默认值, 则不受可选参数的限制:

```ts
function sum(x?: number, y: number = 1): number {
  return x || 2 + y;
}
```

剩余参数

```ts
function f(arr: any[], ...items: any[]) {
  items.forEach((item) => {
    arr.push(item);
  });
}
f([], 1, 2, 3);
```

参数 str 用一个 '?', 代表这个参数可传可不传。

```ts
function greet(str?: string): string {
  if (str) {
    return "Hi" + str;
  }
  return "Hi";
}
greet();
greet("2");

// 也可以写成 匿名函数
var greet = function (str?: string): string {
  if (str) {
    return "Hi" + str;
  }
  return "Hi";
};
```

箭头函数

```ts
var greet = (str?: string): string => {
  if (str) {
    return "Hi" + str;
  }
  return "Hi";
};
```

添加匿名函数的类型

```ts
var greet: (name: string) => string = function (name: string): string {
  if (name) {
    return "Hi" + name;
  }
  return name;
};
// 等价于
var greet: (name: string) => string;
greet = function (name: string): string {
  if (name) {
    return "Hi" + name;
  }
  return name;
};
```

### 6. 定义类

```ts
class Char {
  num: number;
  constructor() {
    this.num = 2;
  }
}
var q = new Char();
```

### 7. 接口

可以使用接口 来确保类拥有指定的结构。
Typescript 也允许接口来约束对象，尤其写对象字面量的时候。
接口可以定义多次, 进行扩展

```ts
interface Person{
    a: 1
}
interface Person{
    b: 1
}
const p:Person{
    a: 1,
    b: 2
}
```

所以要定义全局变量:

```ts
interface Window {
  a: number;
}
window.a = 2;
```

```ts
interface Ifoo {
  log(arg: number): string;
}

class Foo implements Ifoo {
  log(num: number) {
    return String(num);
  }
}

interface Iobj {
  num: number;
  str: string;
}
var o: Iobj = {
  num: 1,
  str: "2"
};
```

### 8. 命名空间

```ts
namespace np {
  export const a = 1;
  export function foo() {}
}

// 会被编译成
("use strict");
var np;
(function (np) {
  np.a = 1;
  function foo() {}
  np.foo = foo;
})(np || (np = {}));
np.foo;
```

### 9. 综合应用

```ts
namespace Geo {
  export interface Vec {
    length(): number;
    nomarlize(): void;
    toArray(callback: (num: number[]) => void): void;
  }
  export class Vec2d implements Vec {
    private _x: number;
    private _y: number;
    constructor(x: number, y: number) {
      this._x = x;
      this._y = y;
    }
    length(): number {
      return 1;
    }
    nomarlize(): void {}
    toArray(callback: (num: number[]) => void) {
      callback([this._x, this._y]);
    }
  }
}

var vector: Geo.Vec = new Geo.Vec2d(2, 3);
vector.nomarlize();
vector.toArray(function (num: number[]) {
  alert(num);
});
```

### 10 类型断言

为了访问联合类型的共有属性和方法, 使用类型断言

```ts
interface Cat {
  name: string;
  run(): void;
}
interface Fish {
  name: string;
  swim(): void;
}

// error
function isFish(animal: Cat | Fish) {
  if (typeof animal.swim === "function") {
    return true;
  }
  return false;
}

// correct
function isFish(animal: Cat | Fish) {
  if (typeof (animal as Fish).swim === "function") {
    return true;
  }
  return false;
}

function isFish(animal: Cat | Fish) {
  if (typeof (animal as Fish).swim === "function") {
    return (animal as Fish).swim();
  }
  return false;
}
```

类型断言只能够「欺骗」TypeScript 编译器，无法避免运行时的错误;

```ts
interface Cat {
  name: string;
  run(): void;
}
interface Fish {
  name: string;
  swim(): void;
}

function swim(animal: Cat | Fish) {
  (animal as Fish).swim();
}

const tom: Cat = {
  name: "Tom",
  run() {
    console.log("run");
  }
};
swim(tom);
```

编译成了, 我们断言了 animal 为 Fish, 所以导致运行时报错;

```js
function swim(animal) {
  animal.swim();
}
const tom = {
  name: "Tom",
  run() {
    console.log("run");
  }
};
swim(tom);
```

将一个父类断言为更加具体的子类,
下面的代码 error 断言成子类 ApiError;

```ts
class ApiError extends Error {
  code: number = 0;
}
function isApiError(error: Error) {
  if (typeof (error as ApiError).code === "number") {
    return 1;
  }
  return false;
}
```

将任何一个类型断言为 any;

```ts
(window as any).foo = 1;
```

但是有时这样不太好;
比如下面代码编译报错,

```ts
let foo;
foo.a = 1;
```

改成如下, 但是运行时就会报错了

```ts
let foo;
(foo as any).a = 1;
```

将 any 断言为一个具体的类型:

```ts
function getCacheData(key: string): any {
  return (window as any).cache[key];
}

interface Cat {
  name: string;
  run(): void;
}

const tom = getCacheData("tom") as Cat;
tom.run();
```

要使得 A 能够被断言为 B，只需要 A 兼容 B 或 B 兼容 A 即可

```ts
interface Animal {
  name: string;
}
interface Cat {
  name: string;
  run(): void;
}

function testAnimal(animal: Animal) {
  return animal as Cat;
}

function testCat(cat: Cat) {
  return cat as Animal;
}
```

允许 animal as Cat 是因为「父类可以被断言为子类」
允许 cat as Animal 是因为既然子类拥有父类的属性和方法，那么被断言为父类，获取父类的属性、调用父类的方法，就不会有任何问题，故「子类可以被断言为父类」

### 双重断言

除非迫不得已，千万别用双重断言。

```ts
interface Cat {
  run(): void;
}
interface Fish {
  swim(): void;
}

function testCat(cat: Cat) {
  return cat as any as Fish;
}
```

### 类型断言 vs 类型转换

类型断言只会影响 TypeScript 编译时的类型，类型断言语句在编译结果中会被删除：

```ts
function toBoolean(something: any): boolean {
  return something as boolean;
}

toBoolean(1);
```

编译后会变成:

```ts
function toBoolean(something) {
  return something;
}

toBoolean(1);
// 返回值为 1
```

### 类型断言 vs 类型声明 vs 泛型

类型断言

```ts
function getCacheData(key: string): any {
  return (window as any).cache[key];
}

interface Cat {
  name: string;
  run(): void;
}

const tom = getCacheData("tom") as Cat;
tom.run();
```

类型声明

```ts
function getCacheData(key: string): any {
  return (window as any).cache[key];
}

interface Cat {
  name: string;
  run(): void;
}

const tom: Cat = getCacheData("tom");
tom.run();
```

泛型

```ts
function getCacheData<T>(key: string): T {
  return (window as any).cache[key];
}

interface Cat {
  name: string;
  run(): void;
}

const tom = getCacheData<Cat>("tom");
tom.run();
```

### 什么是声明语句

#### declare var 声明全局变量

`declare var` 并没有真正定义一个变量, 只是定义了一个全局变量 jQuery 的类型, 仅仅用于编译时的检查, 编译以后会删除;

```ts
declare var jQuery: (selector: string) => any;
```

### 什么是声明文件

声明文件必需以 .d.ts 为后缀。
一般来说，ts 会解析项目中所有的 \*.ts 文件，当然也包含以 .d.ts 结尾的文件

### 全局变量

使用`declare let` 与使用 `declare var` 没有什么区别 ，
当我们使用 `declare const`，则不允许去修改它的值,
所以全局变量通常是使用 const

```ts
declare const jQuery: (selector: string) => any;
// error
jQuery = function (selector) {
  return document.querySelector(selector);
};
```

### declare function§

declare function 用来定义全局函数的类型。jQuery 其实就是一个函数，所以也可以用 function 来定义

```ts
declare function jQuery(selector: string): any;
```

在函数类型的声明语句中，函数重载也是支持的

```ts
declare function jQuery(selector: string): any;
declare function jQuery(domReadyCallback: () => any): any;
```

### declare namespace

namespace 被淘汰了，但是在声明文件中，declare namespace 还是比较常用的，它用来表示全局变量是一个对象，包含很多子属性

```ts
declare namespace jQuery {
  function ajax(url: string, settings?: any): void;
}

jQuery.ajax("a");
```

### interface 和 type

在**类型声明文件**中，我们可以直接使用 interface 或 type 来声明一个全局的接口或类型

```ts
// src/jQuery.d.ts
interface AjaxSettings {
  method?: "GET" | "POST";
  data?: any;
}

// src/index.ts
let settings: AjaxSettings = {
  method: "POST",
  data: {
    name: "foo"
  }
};
```

// 防止命名冲突
暴露在最外层的 interface 或 type 会作为全局类型作用于整个项目中，我们应该尽可能的减少全局变量或全局类型的数量。故最好将他们放到 namespace 下

```ts
// src/jQuery.d.ts
declare namespace jQuery {
  interface AjaxSettings {
    method?: "GET" | "POST";
    data?: any;
  }
  function ajax(url: string, settings?: AjaxSettings): void;
}

// src/index.ts
let settings: jQuery.AjaxSettings = {
  method: "POST",
  data: {
    name: "foo"
  }
};
```

### 声明合并

```ts
// src/jQuery.d.ts
declare function jQuery(selector: string): any;
declare namespace jQuery {
  function ajax(url: string, settings?: any): void;
}

// src/index.ts
jQuery("#foo");
jQuery.ajax("/api/get_something");
```

### 获取 enum 的 key

```ts
enum Gender {
  "M" = "男",
  "F" = "女",
  "U" = "未知"
}
type keyEnum = keyof typeof Gender;
const keyName: keyEnum = "M";
```

### 其它 API

1. Partial 作用是将传入的属性变为可选项.

```ts
interface Person {
  name: string;
  age: number;
}

type P = Partial<Person>;

type P2 = { [key in keyof Person]?: Person[key] | undefined };

var persion: P = {
  name: "1"
};

var persion: P2 = {
  name: "1"
};
```

:::tip 参考地址
<https://ts.xcatliu.com/>
:::
