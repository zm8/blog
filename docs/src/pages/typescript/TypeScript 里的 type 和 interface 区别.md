# TypeScript 里的 type 和 interface 区别

### 1. 语法不同

```ts
interface Point {
  x: number
  y: number
}
type Point = {
  x: number
  y: number
}

interface setPoint {
  (x: number, y: number): void
}
type setPoint2 = (x: number, y: number) => void
```

### 2. interface 可以定义多次，并将被视为单个接口

```ts
interface Point {
  x: number
}
interface Point {
  y: number
}
var p: Point = {
  x: 1,
  y: 2
}
```

而 type 重复定义会报错

```ts
type Point = {
  x: number
}

type Point = {
  y: number
}
```

### 3. extends 写法不同, 但是可以互相扩展

1. interface extends interface

```ts
interface PointX {
  pointX: 0
}
interface PointY extends PointX {
  pointY: 0
}
const p: PointY = {
  pointX: 0,
  pointY: 0
}
```

2. type extends type

```ts
type PointX = {
  pointX: 0
}
type PointY = PointX & {
  pointY: 0
}
const p: PointY = {
  pointX: 0,
  pointY: 0
}
```

3. Interface extends type

```ts
type PointX = {
  pointX: 0
}
interface PointY extends PointX {
  pointY: 0
}
const p: PointY = {
  pointX: 0,
  pointY: 0
}
```

4. type extends interface

```ts
interface PointX {
  pointX: 0
}
type PointY = PointX & {
  pointY: 0
}
const p: PointY = {
  pointX: 0,
  pointY: 0
}
```

### 4. Type 可以用于更多的类型

```ts
// primitive
type N = string

// object
type ObjA = { a: number }
type ObjB = { b: number }

// union
type UnionObj = ObjA | ObjB

// tuple
type Arr = [number, string]

// dom
var div = document.creatElement('div')
type Div = div
```

### 5.Type 可以计算属性，生成映射类型

```ts
type Keys = 'a' | 'b'

type Obj = {
  [key in Keys]: number
}

var obj: Obj = {
  a: 1,
  b: 2
}

// error
interface Obj2 {
  [key in Keys]: number
}
```

::: 参考地址
https://www.jianshu.com/p/555e6998af36
:::
