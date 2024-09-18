# Typescript 进阶指南

## void

func1 与 func2 的返回值类型都会被隐式推导为 void，只有显式返回了 undefined 值的 func3 其返回值类型才被推导为了 undefined。

```js
function func1() {}
function func2() {
  return;
}
function func3() {
  return undefined;
}
```

## 枚举

我们定义常量经常这么写:
A 文件:

```js
export const PageUrl = {
  Home_Page_Url: "url1",
  Setting_Page_Url: "url2",
  Share_Page_Url: "url3"
};
```

B 文件:

```js
import { PageUrl } from "./test";

const homeUrl = PageUrl.Home_Page_Url;

console.log(homeUrl);
```

![image](https://github.com/user-attachments/assets/2564e290-3720-4db6-8df0-f2839fe922f4)

### 使用枚举

会有比较好的类型提示:

![image](https://github.com/user-attachments/assets/22a30df9-9052-4a5d-9664-3cda467e33a5)

A 文件:

```js
export enum PageUrl {
	Home_Page_Url = 'url1',
	Setting_Page_Url = 'url2',
	Share_Page_Url = 'url3',
}
```

B 文件:

```js
import { PageUrl } from "./test";

const homeUrl = PageUrl.Home_Page_Url;
```

## 函数

函数的类型就是描述了 函数的**入参类型**和**返回值类型**

```js
function foo(name: string): number {
  return name.length;
}

// 函数表达式（Function Expression）
const foo2 = function (name: string): number {
  return name.length;
};

// 箭头函数
const foo3 = (name: string): number => name.length;
```

不常用的方式, 函数类型声明混合箭头函数声明:

```js
type FooFunc = (name: string) => number;
// 或者
interface FooFunc2 {
  (name: string): number;
}

const foo3: FooFunc = (name) => name.length;
```

### 可选参数

```js
function foo(name: string, age?: number): number {
  return name.length + (age || 18);
}
```

默认参数:

```js
function foo(name: string, age: number = 18): number {
  return name.length + age;
}
```

rest 参数:

```js
function foo(name: string, ...rest: any[]) {}

function foo2(name: string, ...rest: [string, number]) {}
```

## 重载

函数多组入参类型 和 返回值类型，要实现入参关联的返回值类型，则使用函数重载。

```js
function func(foo: number, bar: true): string;
function func(foo: number, bar?: false): string;
function func(foo: number, bar?: boolean): string | number {
	if (bar) {
		return String(foo);
	} else {
		return foo * 100;
	}
}

const res1 = func(599); // number
const res2 = func(599, true); // string
const res3 = func(599, false); // number
```

## unknown

假设一个定义好的 unknow 类型变量 **foo**，可以把各种不同的类型的值赋给 **foo**，但是 **foo** 只能赋值给 any 和 unknown 类型。

```js
let foo: unknown = "aa";

foo = false;
foo = 123;

let foo2: unknown = foo;
let foo3: any = foo;

// error
let foo4: string = foo;
```

## 异步函数、Generator 函数等类型签名

```js
async function foo(): Promise<void> {}

async function foo2(): Promise<number> {
  return 1;
}

const foo3 = async (num: number): Promise<string> => String(num);

// 如果没有声明 async，则必须返回一个Promise
const foo4 = (num: number): Promise<string> => Promise.resolve(String(num));
```

Generator 函数:

```js
function* foo(): Iterable<void> {}
```

## 虚无的 never 类型

never 类型不携带任何信息的类型，它被称为 Botttom Type，是整个类型系统中最底层的类型。

不能将任何类型分配给 never，只能将 never 类型赋值给 never。

如下会报错:

- 不能将类型 number 分配给 never
- 不能将类型 void 分配给 never
- 不能将类型 any 分配给 never

```js
declare let v1: never;

declare let v2:number;

declare let v3: void;

declare let v4: any;

v1 = v2; // error

v1 = v3; // error

v1 = v4; // error
```

但是 never 类型可以赋值给其它类型:

```js
v2 = v1;
v3 = v1;
v4 = v1;
```

一个负责抛出错误的函数，可以设置为 never:

```js
function foo(): never {
  throw new Error("wrong");
}
```

显示的指定 never 类型，则后面的代码 ts 会置灰:
![image](https://github.com/user-attachments/assets/2393edb4-660f-4917-8037-32bb78dc0f2e)

否则不会置灰:
![image](https://github.com/user-attachments/assets/3034da00-3700-4dd4-82e8-8328543533c1)

我们可以巧妙的使用 任何类型不能赋值给 never 类型，来处理一种函数分支的情况。

```js
function foo(str: number | string) {
  if (typeof str === "number") {
  } else if (typeof str === "string") {
  } else {
    throw new Error("wrong");
  }
}
```

假设其它同事增加了一个参数类型为 boolean，但是没有添加 `if...else` 判断，则 foo 不会提示错误。

```js
function foo(str: number | string | boolean) {
  if (typeof str === "number") {
  } else if (typeof str === "string") {
  } else {
    throw new Error("wrong");
  }
}
```

这个时候可以巧妙的使用 boolean 类型不能赋值给 never 类型,
ts 会报错: **不能将类型“boolean”分配给类型“never”。**

```js
function foo(str: number | string | boolean) {
  if (typeof str === "number") {
  } else if (typeof str === "string") {
  } else {
    const _exhaustiveCheck: never = str;
    throw new Error("wrong" + _exhaustiveCheck);
  }
}
```

## 类型断言

如下代码会报错: `类型“{}”上不存在属性“name”。`

```js
interface IFoo {
	name: string;
}

declare const obj: {
	foo: IFoo;
};

const { foo = {} } = obj;

console.log(foo.name);
```

那么可以使用类型断言:

```ts
const { foo = {} as IFoo } = obj;
```

或者在定义 foo 的时候使用 Partial:

```ts
declare const obj: {
  foo: Partial<IFoo>;
};
```

## 非空断言

使用 **!** 语法：
下面的例子一个是在 `func!().`，一个是在`prop!.`

```ts
declare const foo: {
  func?: () => {
    prop?: number | null;
  };
};

foo.func!().prop!.toFixed();

// 等价于可选链
foo.func?.().prop?.toFixed();
```

非空断言的常见场景还有 `document.querySelector`、`Array.find` 方法等：

```js
const element = document.querySelector("#id")!;
const target = [1,2,3].find(item=>item===3)!;
```

## 联合类型 和 交叉类型

交叉类型是用 **&** 按位与，联合类型是用 **|**，代表按位或。
对于对象类型，相当于它们的合并:

```ts
interface Age {
  age: number;
}

interface Name {
  name: string;
}

type Person = Age & Name;

const person: Person = {
  age: 11,
  name: "David"
};
```

## 索引签名类型

快速的声明一个 键值 **类型一致**的类型结构:

```js
interface AllStringTypes {
  [key: string]: string;
}
```

注意和声明函数的接口不一样的地方，是用大括号的形式 `(key:string)`

```ts
interface Foo {
  (key: number): string;
}
const foo: Foo = (num) => String(num);
```

## 索引类型查询

对象的所有键 转换成 联合类型。
注意下面不会讲数字类型键名 转换成 字符串的 "5555"

```ts
interface Foo {
  num: 1;
  5555: 2;
}

type foo = keyof Foo; // "num" | 5555
```

**小技巧**: 为了在 VSCode 方便查看 `keyof Foo` 的值，使用:

```ts
type foo = keyof Foo & {};
```

伪代码模拟:

```js
type foo = Object.keys(Foo).join(' | ');
```

注意 `keyof any` 返回的是一个联合类型，它是由 `string | number | Symbol` 组成。代表对象的 key 其实是有 3 种类型，虽然实际 js 处理 number 的 key 的时候，会自动转换成 string。

```js
var obj = { 111: 2 };
Object.keys(obj); //转换成了 string ==> ['111']
```

而 ts 里使用 keyof 之后, 转换的类型还是数字:

```js
interface Obj {
	111: 2;
}

type Foo = keyof Obj; // 111

const foo: Foo = 111; // 正确
```

另外 Symbol 类型可以作为 key 给 Object，只是 `for...in` 遍历不出来，只能使用 `Reflect.ownKeys` 或者 `Object.getOwnPropertySymbols` 来访问

```js
var obj = {
  [Symbol()]: 1
};
Object.keys(obj); // []

var arrS = Reflect.ownKeys(obj); // [Symbol()]
var arrS2 = Object.getOwnPropertySymbols(obj); // [Symbol()]
obj[arrSymbol[0]]; // 1
```

## 索引类型访问

可以使用 `obj[expression]` 的形式来访问。

```ts
interface Foo {
  [key: string]: number;
}

type Prop = Foo[string]; // number
```

通过字面量类型来访问:

```ts
interface Foo {
  propA: string;
  propB: number;
}

type PropAType = Foo["propA"]; // string
type PropBType = Foo["propB"]; // number
```

**重点**: 使用 keyof 一次性获得对象所有的键的字面量类型:

```ts
type Props = Foo[keyof Foo]; // string | number
```

## 映射类型：类型编程的第一步

基于键名映射到键值类型:

```ts
interface Foo {
  prop1: string;
  prop2: number;
  prop3: boolean;
  prop4: () => void;
}

type Stringfy<T> = {
  [K in keyof T]: string;
};

type FooString = Stringfy<Foo>;
// 等价于
interface StringifiedFoo {
  prop1: string;
  prop2: string;
  prop3: string;
  prop4: string;
}
```

注意上面不能使用 interface 定义 Stringfy，会**报错**:

```js
interface Stringfy<T> {
    [K in keyof T]: string;
}
```

等价于伪代码:

```js
const FooString = {};
for (const k of Object.keys(Foo)) {
  FooString[k] = string;
}
```

如何 clone 一个接口:

```ts
type Clone<T> = {
  [K in keyof T]: T[K];
};
```

## 类型查询操作符：熟悉又陌生的 typeof

ts 增加 typeof 用于类型查询。
注意 2 点:

- Str 的值是 "linbudu"，而不是像 js 使用 typeof 返回 "string"。
- Num 的值是 123，而不是像 js 使用 typeof 返回 "number"。
- `typeof func` 返回的是 `(input:string)=>boolean`

```ts
const str = "linbudu";

const num = 123;

const obj = { name: "linbudu" };

const nullVar = null;
const undefinedVar = undefined;

const func = (input: string) => {
  return input.length > 10;
};

type Str = typeof str; // "linbudu"
type Num = typeof num; // 123
type Obj = typeof obj; // { name: string; }
type Null = typeof nullVar; // null
type Undefined = typeof undefined; // undefined
type Func = typeof func; // (input: string) => boolean
```

`ReturnType` 返回函数的返回值类型:

```ts
const func = (input: string) => {
  return input.length > 10;
};
type FuncReturnType = ReturnType<typeof func>;
```

## 类型守卫

使用 typeof 进行类型守卫:

```ts
function foo(input: string | number) {
  if (typeof input === "string") {
    input.charAt(0);
  } else {
    input.toFixed(1);
  }
}
```

但是如果 typeof 的判断提取到一个函数中，那么 ts 就会报错:

```
类型“string | number”上不存在属性“charAt”。
  类型“number”上不存在属性“charAt”。ts(2339)
```

```ts
const isString = (input: unknown) => typeof input === "string";

function foo(input: string | number) {
  if (isString(input)) {
    input.charAt(0);
  } else {
    input.toFixed(1);
  }
}
```

因为 ts 做不到跨函数上下文来进行类型的信息收集，所以这个时候使用 **is 关键字**，
意思是: 如果函数返回 true，则 input 入参就是 string 类型。

```ts
const isString = (input: unknown): input is string => typeof input === "string";
```

但是这里 ts 其实是不检查函数里面的具体逻辑的，所以如果 isString 里面的逻辑改成 ` typeof input !== 'string';`，也能正常通过 ts 的类型检验，虽然编译后代码是错的。

## 基于 in 与 instanceof 的类型保护

通过 `key in object` 判断 key 是否在 object 或者原型链上。
js 的 in 的使用方式:

```js
var obj = { a: 1 };
"a" in obj; // true
"toString" in obj; // true
```

```ts
interface Foo {
  foo: string;
  fooOnly: boolean;
}

interface Bar {
  bar: string;
  barOnly: boolean;
}

function handle(input: Foo | Bar) {
  if ("foo" in input) {
    input.fooOnly;
  } else {
    input.barOnly;
  }
}
```

也可以通过共同属性的字面量类型判断:

```ts
interface Foo {
  kind: "foo";
  fooOnly: boolean;
}

interface Bar {
  kind: "bar";
  barOnly: boolean;
}

function handle(input: Foo | Bar) {
  if (input.kind === "foo") {
    input.fooOnly;
  } else {
    input.barOnly;
  }
}
```

注意不能使用 typeof 对 interface 不同属性的类别判断来区分:

```ts
interface Foo {
  kind: "foo";
  diffType: string;
  fooOnly: boolean;
}

interface Bar {
  kind: "bar";
  diffType: number;
  barOnly: boolean;
}

function handle2(input: Foo | Bar) {
  // 报错，并没有起到区分的作用，在两个代码块中都是 Foo | Bar
  if (typeof input.diffType === "string") {
    input.fooOnly;
  } else {
    input.barOnly;
  }
}
```

只能使用:

```ts
"fooOnly" in input;
// 或
input.kind === "foo";
```

### instanceof

先看 js 里面的 instanceof 用法:

```js
class FooBase {}
class Foo extends FooBase {}
var foo = new Foo();
foo instanceof Foo; // true
foo instanceof FooBase; // true
foo instanceof Object; // true
```

instanceof 判断是否位它的实例:

```js
class FooBase {}

class BarBase {}

class Foo extends FooBase {
  fooOnly() {}
}
class Bar extends BarBase {
  barOnly() {}
}

function hanlde(input: Foo | Bar) {
  if (input instanceof Foo) {
    input.fooOnly();
  } else {
    input.barOnly();
  }
}

const foo = new Foo();
hanlde(foo);
```

上面的代码 `input: Foo | Bar`，就是说明 input 只能为 Foo 或者 Bar 的实例。
相当于:

```ts
class Foo {}
const foo: Foo = new Foo();
```

## 接口的合并

如下代码相当于会把 A 进行合并。

```js
interface A {
  foo: string;
}

interface A {
  bar: number;
}

const a: A = {
  foo: "",
  bar: 1
};
```

## 类型别名中的泛型

条件类型，通过 `T extends Condition` 来筛选类型。

```ts
type isEqual<T> = T extends true ? 1 : 2;

type A = isEqual<true>; // 1
type B = isEqual<false>; // 2
type C = isEqual<"cccc">; // 2
```

## 泛型约束与默认值

```ts
type Factory<T = boolean> = T | number;

const foo: Factory = false;
```

相当于伪代码:

```
function Factory(arg=boolean){
    return [arg, number]
}
```

可以使用 **extends** 关键字来约束传入的泛型参数。
`A extends B` 则 A 是 B 的子类型。

如下代码对 ResCode 进行约束，必须是 number 类型。

```ts
type ResStatus<ResCode extends number> = ResCode extends 10000 | 10001 ? "success" : "failure";

type Res1 = ResStatus<10000>; // "success"
type Res2 = ResStatus<20000>; // "failure"

type Res3 = ResStatus<"10000">; // 类型“string”不满足约束“number”。
```

并且可以泛型定义一个默认值:

```ts
type ResStatus<ResCode extends number = 10000> = type ResStatus<ResCode extends number> = ResCode extends 10000 | 10001 ? 'success' : 'failure';
```

## 对象类型中的泛型

最常见的是数据接口请求的返回:

```ts
interface IRes<TData = unknown> {
  code: number;
  error?: string;
  data: TData;
}

interface IUserProfileRes {
  name: string;
  homepage: string;
  avatar: string;
}

function fetchUserProfile(): Promise<IRes<IUserProfileRes>> {}
```

## 函数中的泛型

在函数名的后面定义一个 `<T>`。

```ts
function handle<T>(input: T) {
  return input;
}

const handle2 = <T>(input: T) => input;
```

再看一个 swap 的例子:

```ts
const swap = <T, U>([start, end]: [T, U]): [U, T] => [end, start];

const swapped1 = swap(["linbudu", 599]); // [number, string]
const swapped2 = swap([null, 599]); // [number, null]
const swapped3 = swap([{ name: "linbudu" }, {}]); // [{}, {name: string}]
```

如果我们要限制传入的参数是 **数字元祖** 的情况:

```ts
const swap = <T extends number, U extends number>([start, end]: [T, U]): [U, T] => [end, start];
```
