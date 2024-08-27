# JS 常见问题

## 1. try catch

try catch 功能里的 try 里的代码如果是异步的话，在 catch 里捕获不到。

```javascript
try {
	throw new Error("sss");
} catch (e) {
	console.log(11111); // 能执行
}
```

```javascript
try {
	setTimeout(() => {
		throw new Error("sss");
	}, 0);
} catch (e) {
	console.log(11111); // 不能执行
}
```

所以造成 promise 里面的异步回调函数的报错 在 catch 监听不到

```javascript
promise = new Promise((resolve, reject) => {
	setTimeout(() => {
		throw Error("This is an error");
	});
});

promise.catch((error) => {
	console.log(1111); // 不会执行
});
```

## 2. 正则表达式 test exec match 里的问题

正则使用 test 和 exec 多次会返回值不一样的情况，match 不会有问题，原因是 RegExp 有一个 lastIndex 属性来保存索引开始位置，第 1 次调用的 lastIndex 值为 0，第 2 次调用 lastIndex 为 1。
解决方案是:

1. 去掉 g，关闭全局匹配。(但是通常不会关掉)
2. 每次匹配之前将 lastIndex 的值设置为 0。

```javascript
var reg = /1/g;
reg.test("1"); // true
reg.test("1"); // false
reg.exec("1"); // ["1", index: 0, input: "1", groups: undefined]
reg.exec("1"); // null
"1".match(reg); // ["1"]
"1".match(reg); // ["1"]

// 解决方式
reg.lastIndex = 0;
reg.test("1"); // true
reg.lastIndex = 0;
reg.test("1"); // true
```

## 3. String

公司的项目发现 String 下面赋值就报错。

```javascript
// Uncaught TypeError: Cannot assign to read only property '0' of object '[object String]'
Object.assign("a", "b");
```

实际上 string 是 immutable，不能被改变值的。

```javascript
var str = "ab";
str[0] = "1111"; // 虽然赋值不会报错
console.log(str); // 'ab'
```

若要改变可以用, `str.replace`

```javascript
var str = "ab";
var str2 = str.replace("a", "1");
console.log(str2); // '1b'
```

或者 `Object.assign`赋值一个空字符串

```javascript
var str = Object.assign("", ""); // String {""}
str[0] = "1"; // String {"", 0: "1"}
console.log(str[0]); // 1
```

或者 用`Object.defineProperty`

```javascript
// 注意这里不能用  var obj = '',
// 否则会报错 Uncaught TypeError: Object.defineProperty called on non-object
var obj = new String();
Object.defineProperty(obj, "a", {
	writable: true,
	value: "1",
});
console.log(obj.a); // 1
obj.a = "2";
console.log(obj.a); // 2
```
