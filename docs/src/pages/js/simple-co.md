# 简易版 co 实现

- 支持 `promise` 和 `thunk` 函数
- `it.throw` 会自动执行下 1 个 next

::: tip
co 里的 `yield fn`, fn 必须 `function`, `promise`, `generator`, `array`, `object`
:::

```javascript
function f1() {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			reject("f1");
		}, 1000);
	});
}
function f2() {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve("f2");
		}, 1000);
	});
}

// thunk 函数
function f3(callback) {
	setTimeout(() => {
		callback(null, "thunk f3"); // thunk 函数
	}, 1000);
}

function f4() {
	return "f4";
}

function* main() {
	try {
		console.log(yield f1());
	} catch (e) {
		console.log("error", e);
	}
	console.log(yield f2());
	try {
		console.log(yield f3);
	} catch (e) {
		console.log("error", e);
	}
	console.log(yield f4());
	yield console.log("done");
}

function runGenerator(ge) {
	let it = ge();
	next(); // 启动

	function next(err, val) {
		let res;
		if (!err) {
			res = it.next(val);
		} else {
			res = it.throw(err);
		}
		if (!res.done) {
			nextWithVal(res.value, next);
		}
	}

	function nextWithVal(value, next) {
		if (value && value.then) {
			// Promise
			value.then((val) => next(null, val)).catch((err) => next(err));
		} else if (typeof value === "function") {
			// thunk 函数
			value((err, data) => {
				if (err) {
					next(err);
					return;
				}
				next(null, data);
			});
		} else {
			next(null, value);
		}
	}
}
runGenerator(main);

/*
    error f1
    f2
    thunk f3
    f4
    done
*/
```
