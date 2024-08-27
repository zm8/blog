# JavaScript 中的异步模式

## Callback

当一个函数传入另外一个函数当作参数时，把传入的当作参数的函数叫做 **Callback 函数**，另外一个函数叫 **Hight order function 高阶函数**。

Callback 存在 2 个问题:

- 控制反转（inversion of control）
  控制反转的意思是, Callback 函数 不能保证按照预期肯定会被执行。
- 难以理解

## 回调地狱

经常被人误解

```javascript
setTimeout(function () {
	output("one");
	setTimeout(function () {
		output("two");
		setTimeout(function () {
			output("three");
		}, 1000);
	}, 1000);
}, 1000);
```

可以改成下面没有嵌套，容易理解的

```js
function output(msg) {
	console.log(msg);
}

function one(cb) {
	output("one");
	setTimeout(cb, 1000);
}

function two(cb) {
	output("two");
	setTimeout(cb, 1000);
}

function three() {
	output("three");
}

function start(cb) {
	setTimeout(cb, 1000);
}

start(function () {
	one(function () {
		two(three);
	});
});
```

说明回调地狱的问题不在于嵌套，问题在**复杂的例子**不太好写。

## 实战

假设我们有三个不同的文件 file1,file2,file3，我们希望并行请求这些文件，并按照顺序依次展示出文件内容。

普通的实现方式:

```js
const arr = ["file1", "file2", "file3"];
const time = {
	file1: 3000,
	file2: 2000,
	file3: 1000,
};
const objFiles = {
	// file1: 'file1_content',
	// file2: 'file2_content',
	// file3: 'file3_content',
};

function fakeAjax(file, callback) {
	setTimeout(() => {
		callback(file + "_content");
	}, time[file]);
}

function getFile(file) {
	fakeAjax(file, function (text) {
		fileReceived(file, text);
	});
}

function fileReceived(file, text) {
	objFiles[file] = text;
	for (let i = 0; i < arr.length; i++) {
		const item = arr[i];
		const text = objFiles[item];
		if (text) {
			console.log(text);
		} else {
			// 保证按顺序输出, 如果第一项内容没有值, 则直接 return
			return;
		}
	}
	console.log("done");
}

getFile(arr[0]);
getFile(arr[1]);
getFile(arr[2]);
```

## thunk

什么是 thunk? 只要调用 thunk 函数，返回一个固定的值。

### 同步 thunk

直接调用就能返回你需要的值。

```javascript
const add = (a, b) => {
	return a + b;
};

const thunk = () => {
	return add(1, 2);
};

thunk();
```

### 异步 thunk

需要传入一个回调函数, 回调函数的参数就是返回值。

```js
const add = (a, b, cb) =>
	setTimeout(() => {
		cb(a + b);
	}, 1000);
const thunk = (cb) => add(1, 2, cb);
thunk((num) => console.log(num));
```

利用 thunk 来重写上面的例子:

```javascript
const arr = ["file1", "file2", "file3"];

function fakeAjax(file, callback) {
	const time = {
		file1: 1000,
		file2: 2000,
		file3: 3000,
	};
	setTimeout(() => {
		callback(file + "_content");
	}, time[file]);
}

function getFile(file) {
	var cnt;
	fakeAjax(file, function (text) {
		if (cnt) {
			// 如果提前执行了下面的 cnt = callback, 则直接执行回调函数
			cnt(text);
		} else {
			// 否则赋值给 cnt
			cnt = text;
		}
	});

	return function (callback) {
		if (cnt) {
			// 如果 fakeAjax 是同步执行, 已经赋值给了 cnt = text, 则直接执行回调
			callback(cnt);
		} else {
			// 否则把 cnt 赋值给 callback (PS: 通常是走到这里)
			cnt = callback;
		}
	};
}

var gF1 = getFile(arr[0]);
var gF2 = getFile(arr[1]);
var gF3 = getFile(arr[2]);
const outPut = (text) => console.log(text);

gF1((text) => {
	outPut(text);
	gF2((text) => {
		outPut(text);
		gF3((text) => {
			outPut(text);
			outPut("done");
		});
	});
});
```

thunk 的优点是代码已经好理解来, 缺点是:

- 回调函数是受外界控制，会不会被调用不知道。
- 会被调用几次也是不知道的，而 Promise 如果 resolve 多次的话，只有最开始的 1 次是有效的。

## Promise

重写上面的例子

```javascript
const arr = ["file1", "file2", "file3"];

function fakeAjax(file, callback) {
	const time = {
		file1: 1000,
		file2: 2000,
		file3: 3000,
	};
	setTimeout(() => {
		callback(file + "_content");
	}, time[file]);
}

function getFile(file) {
	return new Promise((resolve, reject) => {
		fakeAjax(file, (text) => {
			resolve(text);
		});
	});
}

var getFile1 = getFile(arr[0]);
var getFile2 = getFile(arr[1]);
var getFile3 = getFile(arr[2]);

const output = (text) => console.log(text);

getFile1.then((text) => {
	output(text);
	getFile2.then((text) => {
		output(text);
		getFile3.then((text) => {
			output(text);
			output("done");
		});
	});
});

// 这里其实用下面的写法更好理解
gF1
	.then(output)
	.then(() => gF2)
	.then(output)
	.then(() => gF3)
	.then(output)
	.then(() => console.log("done"));

// 或者用函数式编程的方法
["file1", "file2", "file3"]
	.map((item) => getFile(item))
	.reduce((a, b) => {
		return a.then(() => b).then(output);
	}, Promise.resolve());
```

Promise 核心在于 then 后面的注册函数只会被调用 1 次，要么成功要么失败，控制权在自己手里。
缺点:

- 一旦开始执行就不能中止
- catch 里面的错误没办法捕获, 除非 catch 后面再写个 catch, 这样就变成无限循环了。

## Generator

generator 函数特点:

- 函数可暂停和继续
- 可以返回值给外部
- 也可以传入值进来

若用 Generator 重写上面的例子:

```javascript
function runGenerator(ge) {
	let it = ge();
	const loop = (val) => {
		let res = it.next(val);
		if (res.done) {
			return;
		}
		if (res.value.then) {
			res.value.then(loop);
		} else {
			loop(res.value);
		}
	};
	loop();
}

function* main() {
	let f1 = getFile("file1");
	let f2 = getFile("file2");
	let f3 = getFile("file3");
	output(yield f1);
	output(yield f2);
	output(yield f3);
	console.log("done");
}

runGenerator(main);
```

上述代码中，我们用 Promise + generator 模拟了 async 函数。

## Async await 函数

缺点

- await 后面只能跟一个 Promise 或者 一个纯 js 基本类型(数组, 对象之类的)
- 无法在外界取消一个正在运行中的 async 函数

```javascript
async function main() {
	let f1 = getFile("file1");
	let f2 = getFile("file2");
	let f3 = getFile("file3");
	output(await f1);
	output(await f2);
	output(await f3);
	console.log("done");
}

main();
```
