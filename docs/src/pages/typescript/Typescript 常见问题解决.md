# Typescript 常见问题解决

## 提取 二维数组类型 到一维数组

```ts
type Matrix = string[][] // 二维数组
type Row = Matrix[number] // 提取变成一维数组
const arr: Row = ['1', '2']
```

## 判断类型中有 null 或者 undefined 则为 true, 否则为 false

```ts
type HasNullOrUndefined<T> = T & (null | undefined) extends never ? false : true

// 或者
type HasNullOrUndefined<T> = Extract<T, null | undefined> extends never
  ? false
  : true

// 或者
type HasNullOrUndefined<T> = (null | undefined) & T extends never ? false : true

// 或者   NonNullable 的作用是: Exclude null and undefined from T
type HasNullOrUndefined<T> = [T] extends [NonNullable<T>] ? false : true

// PS: NonNullable 相当于如下:
type NonNullable<T> = T extends null | undefined ? never : T

// 测试用例
type A = HasNullOrUndefined<number | undefined> // true
type B = HasNullOrUndefined<string | null> // true
type C = HasNullOrUndefined<undefined> // true
type D = HasNullOrUndefined<null> // true
type E = HasNullOrUndefined<number> // false
```

## TS 奇怪的地方

```ts
type HasNullOrUndefined<T> = T extends null | undefined ? true : false

// 使用例子
type A = HasNullOrUndefined<null> // true
type B = HasNullOrUndefined<undefined> // true
type C = HasNullOrUndefined<boolean> // false

type D = HasNullOrUndefined<boolean | null> // boolean
type E = HasNullOrUndefined<number | undefined> // boolean
```

D 和 E 竟然都是 boolean, 但是下面不用泛型传入的方式却为 false。
**chatgpt** 的解释如下, `HasNullOrUndefined<boolean | null>` 会分成 2 步来执行, 第一步是 `HasNullOrUndefined<boolean>`为 false, 第二步是 `HasNullOrUndefined<null>` 为 true, 所以最终结果就变成了 `boolean`。

## 判断 2 个类型是否一致

```ts
type IsSameType<T, U> = [T] extends [U]
  ? [U] extends [T]
    ? true
    : false
  : false

// 测试
type Test1 = IsSameType<string, string> // true
type Test2 = IsSameType<string, number> // false
type Test3 = IsSameType<{ a: number }, { a: number }> // true
type Test4 = IsSameType<{ a: number }, { b: number }> // false
```

## 对象赋值给另外一个对象报错

你遇到的错误是因为 TypeScript 不能确定 two[key] 和 one[key as keyof typeof one] 的类型是一致的。
如下报错:

```
Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ text: string; num: number; }'.
  No index signature with a parameter of type 'string' was found on type '{ text: string; num: number; }'.(7053)
```

```ts
const one = {
  text: 'a',
  num: 1
}

const two = {
  text: 'b',
  num: 2
}

for (const key of Object.keys(one)) {
  two[key] = one[key as keyof typeof one]
}
```

### 解决方案

### 1. 使用泛型和类型推断

```ts
const one = {
  text: 'a',
  num: 1
}

const two = {
  text: 'b',
  num: 2
}

function updateObject<T>(target: T, source: Partial<T>): void {
  for (const key of Object.keys(source) as (keyof T)[]) {
    target[key] = source[key] as T[keyof T]
  }
}

updateObject(two, one)
```

### 2. 使用非空断言

```ts
interface IObj {
  a: number
  b: number
}

const obj: Partial<IObj> = {
  a: 1
}

const obj2: IObj = {
  a: 1,
  b: 2
}

for (const key of Object.keys(obj) as (keyof IObj)[]) {
  obj2[key] = obj[key]!
}
```

### 3. 使用 Object.entries 遍历键值对

```ts
interface IObj {
  a: number
  b: number
}

const obj: Partial<IObj> = {
  a: 1
}

const obj2: IObj = {
  a: 1,
  b: 2
}

for (const [key, value] of Object.entries(obj) as [keyof IObj, number][]) {
  obj2[key] = value
}
```

### 4. 使用 as 类型断言

```ts
const one = {
  text: 'a',
  num: 1
}

const two = {
  text: 'b',
  num: 2
}

type ITwoValue = (typeof two)[keyof typeof two]

for (const key of Object.keys(one) as (keyof typeof one)[]) {
  ;(two[key] as ITwoValue) = one[key as keyof typeof one]
}
```

### 5.使用 Object.assign 进行合并

```ts
interface IObj {
  a: number
  b: number
}

const obj: Partial<IObj> = {
  a: 1
}

const obj2: IObj = {
  a: 1,
  b: 2
}

Object.assign(obj2, obj)
```

## for...in 遍历对象报错

报错如下:

```
Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ a: number; b: number; }'.
  No index signature with a parameter of type 'string' was found on type '{ a: number; b: number; }'.(7053)
```

```ts
const obj = {
  a: 1,
  b: 2
}
for (const key in obj) {
  console.log(obj[key])
}
```

### 解决方案:

### 1. for...in 使用类型断言

```ts
const obj = {
  a: 1,
  b: 2
}

for (const key in obj) {
  console.log(obj[key as keyof typeof obj])
}
```

### 2. 使用 for...of 循环遍历键值对

```ts
const obj = {
  a: 1,
  b: 2
}

for (const key of Object.keys(obj)) {
  console.log(obj[key as keyof typeof obj])
}
```

### 3. 使用 for...of 搭配 Object.entries

```ts
const obj = {
  a: 1,
  b: 2
}

for (const [key, value] of Object.entries(obj)) {
  console.log(value)
}
```

## 空对象定义

```ts
type EmptyObject = Record<string, never>
```

`Record<string, never>` 和 `{}` 的区别:

- `Record<string, never>` 表示不能有任何属性的空对象，是**严格意义的空对象**。
- `{}` 表示一个可以具有任何属性的对象，没有具体的属性要求。

```ts
// Record<string, never>
const obj1: Record<string, never> = {}
obj1.someKey = 'someValue' // 错误：Type 'string' is not assignable to type 'never'.

// {}
const obj2: {} = {}
obj2.someKey = 'someValue' // 没有错误

const obj3: {} = [] // 正确
const obj4: {} = '1' // 正确
const obj5: {} = 1 // 正确
const obj6: {} = Symbol // 正确
```

## Paticial

将一个对象类型中的所有属性变为可选属性。

```ts
interface IObj {
  a: number
  b: number
}

const obj: Partial<IObj> = { a: 1 } // 正确
const obj2: Partial<IObj> = { b: 1 } // 正确
const obj3: Partial<IObj> = { a: 1, b: 1 } // 正确
```

## Pick

用于从一个类型中挑选出一部分属性，来构造成一个新的类型。

```ts
interface Todo {
  title: string
  description: string
  completed: boolean
}

type TodoPreview = Pick<Todo, 'title'>

const todo: TodoPreview = {
  title: 'Clean room'
} // 正确

const todo: TodoPreview = {
  completed: false
} // 错误
```

注意 Pick 返回的是一个新的 interface，注意下面的写法区别:

```ts
interface Todo {
  title: string
  description: string
  completed: boolean
}

type TodoPreview = Pick<Todo, 'title'> // 相当于 {title: string}

type Title = Todo['title'] // 相当于 string
```

## Omit

以一个类型为基础支持剔除某些属性，然后返回一个新类型。

```ts
interface Todo {
  title: string
  description: string
}

type TodoPreview = Omit<Todo, 'description'>

const todo: TodoPreview = {
  title: 'Clean room'
} // 正确

const todo2: TodoPreview = {
  title: 'Clean room',
  description: 'Kindergarten closes at 5pm'
} // 错误
```

## 分别获取对象的 key 和 value 的类型

```ts
const todo = {
  title: 'Clean room',
  completed: false,
  count: 10
}

type TodoKeys = keyof typeof todo // "title" | "completed" | "description";

type TodoValues = (typeof todo)[TodoKeys] // string | boolean | number
```

## 获取获取枚举的 key 和 value 的类型

```ts
enum ETodo {
  title = 'Clean room',
  description = 1
}

// 获取枚举键的类型
type EnumKeys = keyof typeof ETodo // "title" | "description"
const key1: EnumKeys = 'title' // true
const key2: EnumKeys = 'description' // true

// 获取枚举值当作类型
type EnumValues = (typeof ETodo)[EnumKeys] // ETodo.title | ETodo.description
// 更简单的写法: type EnumValues = ETodo;
// 不建议这样写: type EnumValues = `${ETodo}`;

const val: EnumValues = ETodo.title // true
const val2: EnumValues = ETodo.description // true

const val3: ETodo = 'Clean room' // 错误
const val4: ETodo = 1 // 正确, 不建议这么写，这是一个特例。数字枚举成员在某些情况下可以被视为常量，因此编译器不会报错。
```

## Object 赋值的时候情况

下面这种情况 ts 会报错, 因为经过 `Object.keys` 之后, `keyName` 这个时候是 string 类型。

```ts
interface IObj {
  a: number
  b: number
}
const obj: IObj = { a: 1, b: 2 }
const obj2: Partial<IObj> = {}
Object.keys(obj).forEach((keyName) => {
  obj2[keyName] = obj[keyName]
})
```

解决方法一：类型断言

```ts
interface IObj {
  a: number
  b: number
}
const obj: IObj = { a: 1, b: 2 }
const obj2: Partial<IObj> = {}
;(Object.keys(obj) as Array<keyof IObj>).forEach((keyName) => {
  obj2[keyName] = obj[keyName]
})
```

或者:

```ts
Object.keys(obj).forEach((keyName) => {
  obj2[keyName as keyof IObj] = obj[keyName as keyof IObj]
})
```

解决方法二：`for...of` 循环

```ts
for (const [keyName, value] of Object.entries(obj)) {
  obj2[keyName as keyof IObj] = value
}
```

解决方法三：`Object.entries` 和 `Object.fromEntries`

```ts
interface IObj {
  a: number
  b: number
}
const obj: IObj = { a: 1, b: 2 }
const obj2: Partial<IObj> = Object.fromEntries(Object.entries(obj))
```

不建议使用: `Object.assign(obj2, obj);`, 因为没有类型安全检查。

## TS 不会在运行时检查

```ts
let obj: {
  a: number
}
const fn = () => {
  obj = { a: 1 }
}
fn()

obj.a // error, Variable 'obj' is used before being assigned.
// 需改成
obj!.a
```
