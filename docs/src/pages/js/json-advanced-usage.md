# JSON.parse 和 JSON.stringify 的高级用法

## 1. JSON.parse

普通的用法大家都知道，用来解析一个 JSON 字符串。

```javascript
JSON.parse('{"a": 1}'); // 返回 {“a”: 1}
```

若传入第 2 个参数, 这个参数是个函数, key 和 val 都是对应 obj 的属性名和属性值,
注意遍历到最后的 key 和 val 的值。

```javascript
var obj = { a: 1, b: 2, c: 3 };
JSON.parse(JSON.stringify(obj), (key, val) => {
	console.log(key, val);
});
// 'a' '1'
// 'b' '2'
// 'c' '3'
// '' {}      注意最后一个是 空字符串 和 空对象
```

下面的代码如何把属性值转换为字符串

```javascript
var obj = { a: 1, b: 2, c: 3 };
var objNew = JSON.parse(JSON.stringify(obj), (key, val) => {
	if (key === "") return val; // 如果遍历到了最顶层，则直接返回属性值
	return val + "";
});
console.log(objNew);
```

## 2. JSON.stringify

### 1. 普通用法就是把 JSON 转换成字符串形式

```javascript
JSON.stringify({ a: 1 }); // '{"a": 1}'
```

### 2. 第 2 个参数可以是个函数, 数组或者 null

1)若为函数, 可以用来遍历 key 和 val，类似 array.map
但是如果不 return val, 则如下代码只能返回 一个空对象 和 本身的函数

```javascript
var obj = { a: 1, b: 2, c: 3 };
JSON.stringify(obj, (key, val) => {
	console.log(key, val);
});
// '' {a: 1, b: 2, c: 3}
```

```javascript
var obj = { a: 1, b: 2, c: 3 };
JSON.stringify(obj, (key, val) => {
	console.log(key, val);
	return val;
});

// '' {a: 1, b: 2, c: 3}
// ‘a’ 1
// 'b' 2
// 'c' 3
```

```javascript
var obj = { a: 1, b: 2, c: 3 };
JSON.stringify(obj, (key, val) => {
	if (key === "") return val;
	return val + 1;
});
// 返回 '{"a":2,"b":3,"c":4}'
```

2)第 2 个参数为数组, 则只格式化 数组里面的属性的值

```javascript
JSON.stringify({ a: 1, b: 2 }, ["a"]); //  '{"a":1}'
```

3)若为 null, 则正常的格式化数组

### 3. 第 3 个参数为可用来美化输出结果

若为数字则输出的空白, 最大不超过 10

```javascript
var obj = { a: 1, b: 2, c: 3 };
JSON.stringify(obj, null, 2);
/*
'{
  "a": 1,
  "b": 2,
  "c": 3
}'
*/
```

若非数字, 则添加到每个 属性名的前面

```javascript
var obj = { a: 1, b: 2, c: 3 };
JSON.stringify(obj, null, "...");
/*
'{
..."a": 1,
..."b": 2,
..."c": 3
}'
*/
```
