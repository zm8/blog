# Typescript 写法小结

### 定义一个数组, 为空数组 或者 值是对象

```js
type Arr =
  | undefined
  | {
      a: number
    }
const arr: Arr[] = []
console.log(arr[0]?.a)
```

### 联合类型(|)

可以为多种类型的一种:

```js
var q: string | numer
q = '2'
q = 3
```

### 交叉类型(&)

相当于把多种类型叠加到一起, 成为一种类型:

```js
interface Obj1 {
  a: number;
}

interface Obj2 {
  b: number;
}
const obj: Obj1 & Obj2 = { a: 1, b: 2 }

// error
const obj: Obj1 & Obj2 = { a: 1 }
const obj: Obj1 & Obj2 = { b: 1 }
```

### 传递对象给函数, 返回这个对象 key 的方法

```ts
type Para<T> = {
  [P in keyof T]: () => void
}

function fn<T>(para: T): Para<T> {
  const obj = {} as Para<T>
  for (const key in para) {
    obj[key] = () => {
      console
    }
  }
  return obj
}

const res = fn({
  a: () => {},
  b: () => {}
})

res.a()
```

### 返回 void 不报错的原因

#https://github.com/microsoft/TypeScript/issues/38758

> A return type of void does not mean the function returns nothing. It means the functions return type should not be used for anything meaningful.

```ts
// 不报错
let func1: (data: string) => void
func1 = (data: string) => {
  return data
}

const res = func1('1')
```

```ts
// 但是如果使用 res 做一些其他操作, 则会报错
res.split('')
```

需要改上面的代码:

```ts
let func1: (data: string) => string
```
