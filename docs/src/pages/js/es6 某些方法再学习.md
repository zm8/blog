# es6 某些方法再学习

### Map 使用 forEach 进行循环

```js
var map = new Map([
  ['a', (index) => console.log(index)],
  ['b', (index) => console.log(index)]
])
map.forEach((item, index) => {
  item(index)
})
```

### 查看 Map 实例上面有哪些方法

```js
const map = new Map()
Reflect.ownKeys(map.__proto__)
或
Reflect.ownKeys(Map.prototype)
/*
[
    "constructor",
    "get",
    "set",
    "has",
    "delete",
    "clear",
    "entries",
    "forEach",
    "keys",
    "size",
    "values",
    null,
    null
]
*/
```

### 对象转 Map

```js
const obj = { a: 1, b: 2 }
const map = new Map(Object.entries(obj))
/*
  等价于
  const map = new Map([
    ['a',1],
    ['b',2]
  ]);
*/
console.log(map) // Map(2) { 'a' => 1, 'b' => 2 }
```

### Map 转对象

```js
const map = new Map([
  ['a', 1],
  ['b', 2]
])
console.log(Object.fromEntries(map))

/*** 或者 ***/
const obj = {}
for (let [key, value] of map) {
  obj[key] = value
}
console.log(obj)
```

### Set 主要用来去重

```js
var arr = [1, 1, 2, 3]
var arr2 = [...new Set(arr)]
console.log(arr2)

// 数组转 Set
var arr = [1, 2]
new Set(arr)

// Set 转数组
var set = new Set([1, 2, 3])
var arr = [...set]
```

### Reflect 的一些方法

```js
const nobj = { a: 1 }
nobj.hasOwnProperty('a')
Object.hasOwn(nobj, 'a')

// 判断是否存在某个属性
Reflect.has(nobj, 'a')

// 添加属性值
Reflect.defineProperty(nobj, 'b', { value: 2, enumerable: true })

// 删除属性值
Reflect.deleteProperty(nobj, 'b')

const fn = function (...args) {
  console.log(this, args)
}

// 函数执行
Reflect.apply(fn, window, [1, 2])

// 获取所有的key
console.log(Object.keys(nobj)) // 只拿到可以枚举的属性, 即 enumerable 为 true
console.log(Reflect.ownKeys(nobj))
```
