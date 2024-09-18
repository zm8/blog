# ES6 之 Map, WeakMap, Set, WeakSet, Reflect

## Map Object Set Array 遍历方式

### 1. Map 的遍历

```js
const map = new Map([
  ["a", 1],
  ["b", 2]
]);
for (let [key, value] of map) {
  console.log(key, value);
}
// 'a', 1
// 'b', 2

/******或者*******/
map.forEach((value, key) => console.log(value, key));
// 1, 'a'
// 2, 'b'
```

### 2. Object 的遍历

```js
var obj = {
  a: 1,
  b: 2
};

for (let key in obj) {
  console.log(key, obj[key]);
}
// 'a', 1
// 'b', 2

// 或者 ---- 注意这里用 "of" 遍历数组
for (let key of Object.keys(obj)) {
  console.log(key, obj[key]);
}
```

### 3. Set 的遍历

```js
const set = new Set([1, 2]);
for (let value of set) {
  console.log(value);
}
// 1
// 2

set.forEach((val) => console.log(val));
// 1
// 2
```

### 4. Array 的遍历

```js
var arr = [1, 2];
for (let value of arr) {
  console.log(value);
}
// 1
// 2

arr.forEach((val) => console.log(val));
// 1
// 2
```

## Map

键值对的 Hash 结构，Object 对象是"字符串-值"对应，而 Map 结构是 "值-值" 对应。
初始化，接受一个数组作为参数，数组里面的每个成员是个数组，表示**键值对**。

Map 和 Set 区别是:

- 添加属性 Map 用 `map.set(key, value)`, 而 Set 用 `set.add(value)`
- Map 有 get 方法 `map.get(key)`, 而 Set 没有

```js
// 初始化
const map = new Map([
  ["name", "张三"],
  ["age", 22]
]);

// 或者
const map = new Map().set("name", "张三").set("age", 22);

map.size; // 2
map.has("name"); // true
map.get("name"); // 张三
map.delete("age"); // 删除
map.clear(); // 清空
```

### 遍历方法

`keys()`，`values()`，`entries()` 都是返回遍历器对象。

```js
map.keys(); // MapIterator {'name', 'age'}
map.values(); // MapIterator {'张三', 22}
map.entries(); // MapIterator {'name' => '张三', 'age' => 22}

for (let key of map.keys()) {
  console.log(key); // 'name', 'age'
}

for (let value of map.values()) {
  console.log(value); // '张三', 22
}

for (let item of map.entries()) {
  console.log(item); //  ['name', '张三'], ['age', 22]
}
```

如何遍历 map 同时获得 value 和 key?

```js
//  '张三'      'name'
//  22            'age'
for (let [key, value] of map) {
  console.log(key, value);
}

// 或者
for (let [key, value] of map.entries()) {
  console.log(key, value);
}

// 或者
map.forEach((value, key) => console.log(value, key));
```

### 查看 Map 实例上面有哪些方法

```js
const map = new Map();
Reflect.ownKeys(map.__proto__);
// 或
Reflect.ownKeys(Map.prototype);
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
    Symbol(Symbol.toStringTag),
    Symbol(Symbol.iterator)
]
*/
```

### Map 于其它数据结构转换

#### 1. Map 转数组

```js
const map = new Map([
  [1, "a"],
  [2, "b"]
]);
[...map];
```

#### 2. 数组转 Map

```js
const arr = [
  [1, "a"],
  [2, "b"]
];
new Map(arr);
```

#### 3. Map 转对象

Map 的键最好都是字符串，否则会自动让它转为字符串

```js
const mapToObj = (map) => {
  const obj = {};
  for (let [key, value] of map) {
    obj[key] = value;
  }
  return obj;
};
// 或者
const mapToObj = (map) => Object.fromEntries(map);
```

#### 4. 对象转 Map

```js
const objToMap = (obj) => {
  const arr = Object.entries(obj);
  return new Map(arr);
};
// 或者
const objToMap = (obj) => {
  const map = new Map();
  for (let key in obj) {
    map.set(key, obj[key]);
  }
  return map;
};
```

#### 5. Map 转 JSON

如果 Map 的键值都是 string

```js
JSON.stringify(mapToObj(map));
```

如果 Map 的键值非字符串的, 则直接让它转数组

```js
JSON.stringify([...map]);
```

#### 6. JSON 转 Map

如果 JSON 的键名是 字符串:

```js
objToMap(JSON.parse(jsonStr));
```

如果键名有 非字符串:

```js
new Map(JSON.parse(jsonStr));
```

## WeakMap

WeakMap 只有四个方法可用：get()、set()、has()、delete()。
WeakMap 只接受对象（null 除外）和 Symbol 值作为键名。**不能有遍历的操作。**

## Set

Set 类似于数组，它里面的值都是没有重复的。
Set 接收一个数组(或者具有 iterable 接口的其他数据结构)作为初始化。

### 常见操作

```js
/* 初始化 Set */
var set = new Set([1, 2, 3]);
// 或者
var set = new Set().add(1).add(2).add(3);

var set = new Set(document.querySelectorAll("div"));

/* 长度 */
set.size; // 长度: 3

/* 操作方法 */
set.add(4); // 添加
set.delete(4); // 移除
set.has(3); // true
set.clear(); // 清空
set.size; // 0

/* 遍历方法 */
for (let value of set) console.log(value); // 1 2 3

// 注意: value 和 key 相等, 第3个参数就是 set 本身
set.forEach((value, key, set) => console.log(value, key));
// 1 1
// 2 2
// 3 3
```

### 注意点

1. keys()，values()，entries() 都是返回遍历器对象

```js
var set = new Set(["a", "b", "c"]);
var it = set.keys(); // SetIterator {'a', 'b', 'c'}
it.next(); // {value: 'a', done: false}
it.next(); // {value: 'b', done: false}
it.next(); // {value: 'c', done: false}
it.next(); // {value: undefined, done: true}

var it = set.values(); // SetIterator {'a', 'b', 'c'}
it.next(); // {value: 'a', done: false}
it.next(); // {value: 'b', done: false}
it.next(); // {value: 'c', done: false}
it.next(); // {value: undefined, done: true}

//  [ˈentri]
var it = set.entries(); //  {'a' => 'a', 'b' => 'b', 'c' => 'c'}
it.next(); // {value: ['a', 'a'], done: false}
it.next(); // {value: ['b', 'b'], done: false}
it.next(); // {value: ['c', 'c'], done: false}
it.next(); // {value: undefined, done: true}
```

9. Set 结构的键名和键值是同一个值。

```js
let set = new Set(["a", "b", "c"]);
for (let item of set.keys()) {
  console.log(item);
}
// 输出: a, b, c

for (let item of set.values()) {
  console.log(items);
}
// 输出: a, b, c
```

### 应用

1. Set 和 Array 的相互转换?

```js
// Array 转 Set
const arr = [1, 2, 3];
const set = new Set(arr);

// Set 转 Array
const arr2 = [...set];
const arr3 = Array.from(set);
```

2. 数组如何去重?

```js
const removeDuplicate = (arr) => [...new Set(arr)];
removeDuplicate([1, 2, 1]);
```

4. Set 实现并集（Union）、交集（Intersect）和差集（Difference）

```js
let a = new Set([1, 2, 3]);
let b = new Set([4, 3, 2]);

// 并集
let c = new Set([...a, ...b]);

// 交集
let c = new Set([...a].filter((val) => b.has(val)));

// 差集
let c = new Set([...a].filter((val) => !b.has(val)));
```

## WeakSet

成员只能是 **Symbol** 和 **对象**。
成员都是**弱引用**，随时可能消失，垃圾回收不考虑 WeakSet 对该对象的引用。

```js
const ws = new WeakSet();
ws.add(Symbol());
ws.add({});

// 报错
ws.add(1);
```

WeakSet 只有 add, delete, has 方法，不能遍历。

```js
var ws = new WeakSet();
ws.add(Symbol());
ws.add({});

// 报错  VM2136:1 Uncaught TypeError: ws is not iterable
for (let item of ws) {
  console.log(item);
}
```

## Reflect

```js
const nobj = { a: 1 };
nobj.hasOwnProperty("a");
Object.hasOwn(nobj, "a");

// 判断是否存在某个属性
Reflect.has(nobj, "a");

// 添加属性值
Reflect.defineProperty(nobj, "b", { value: 2, enumerable: true });

// 删除属性值
Reflect.deleteProperty(nobj, "b");

const fn = function (...args) {
  console.log(this, args);
};

// 函数执行
Reflect.apply(fn, window, [1, 2]);

// 获取所有的key
console.log(Object.keys(nobj)); // 只拿到可以枚举的属性, 即 enumerable 为 true
console.log(Reflect.ownKeys(nobj));
```
