# redux-saga 模拟实现

## 1. channel 的概念

take 是注册一个函数, put 是执行注册的函数。

```javascript
function channel() {
	let taker;

	function take(cb) {
		taker = cb;
	}

	function put(input) {
		if (taker) {
			const tempTaker = taker;
			taker = null;
			tempTaker(input);
		}
	}

	return {
		put,
		take,
	};
}

const chan = channel();
chan.take((v) => {
	console.log(v); // 输出 'hello'
});

chan.put("hello");
```

## 2. 一个简单的 demo

```javascript
function channel() {
	let taker;

	function take(cb) {
		taker = cb;
	}

	function put(input) {
		if (taker) {
			const tempTaker = taker;
			taker = null;
			tempTaker(input);
		}
	}

	return {
		put,
		take,
	};
}

const chan = channel();

function take() {
	return {
		type: "take",
	};
}

function* mainSaga() {
	const action = yield take();
	console.log(action);
}

function runTakeEffect(effect, cb) {
	chan.take((input) => {
		cb(input);
	});
}

function task(iterator) {
	const iter = iterator();
	function next(args) {
		const result = iter.next(args);
		if (!result.done) {
			const effect = result.value;
			if (effect.type === "take") {
				runTakeEffect(result.value, next);
			}
		}
	}
	next();
}

task(mainSaga);

let i = 0;
$btn.addEventListener(
	"click",
	() => {
		const action = `action data${i++}`;
		chan.put(action);
	},
	false
);
```

由于 mainSaga 里的 yield 出来的 take 的 type 为 take, 所以会走到 runTakeEffect 里,
这样就相当于执行了:

```javascript
chan.take((input) => {
	next(input);
});
```

next 的迭代器为 mainSaga 里的代码:

```javascript
function* mainSaga() {
	const action = yield take();
	console.log(action);
}
```

## 3. 如何监听每一次的事件点击呢?

其实最简单的方式就是改变 mainSaga 为不断的循环, 代码如下:

```javascript
function* mainSaga() {
	while (true) {
		const action = yield take();
		console.log(action);
	}
}
```

## 4. saga 里面提供了 takeEvery, 其实最终和上面的效果是一样的

```javascript
const $btn = document.querySelector("#test");
const $result = document.querySelector("#result");

function channel() {
	let taker;

	function take(cb) {
		taker = cb;
	}

	function put(input) {
		if (taker) {
			const tempTaker = taker;
			taker = null;
			tempTaker(input);
		}
	}

	return {
		put,
		take,
	};
}

const chan = channel();

let i = 0;
$btn.addEventListener(
	"click",
	() => {
		chan.put(`action data${i++}`);
	},
	false
);

function take() {
	return {
		type: "take",
	};
}

function fork(cb) {
	return {
		type: "fork",
		fn: cb,
	};
}

function* takeEvery(worker) {
	yield fork(function* () {
		while (true) {
			const action = yield take();
			worker(action); // 5
		}
	});
}

function* mainSaga() {
	yield takeEvery((action) => {
		$result.innerHTML = action;
	});
}

function runTakeEffect(effect, cb) {
	// 5
	chan.take((input) => {
		cb(input);
	});
}

function runForkEffect(effect, cb) {
	task(effect.fn || effect); // 2
	cb();
}

function task(iterator) {
	const iter = typeof iterator === "function" ? iterator() : iterator;
	function next(args) {
		const result = iter.next(args); // 3
		if (!result.done) {
			const data = result.value;

			if (typeof data[Symbol.iterator] === "function") {
				runForkEffect(data, next); // 1
			} else if (data.type) {
				switch (data.type) {
					case "take":
						runTakeEffect(result.value, next);
						break;
					case "fork":
						runForkEffect(result.value, next); // 4
						break;
					default:
						break;
				}
			}
		}
	}
	next();
}

task(mainSaga);

/*
    1. task(mainSaga) 执行
    2. runForkEffect(data, next); -- 1
    3. 相当于执行 task(takeEvery);  -- 2
    4. result 的值为: -- 3
    {
        done: false,
        value: {
            type: 'fork',
            fn: function* () {
                    while(true) {
                    const action = yield take();
                    worker(action);
                }
            },
        }
    }

    5. 判断value.type 为 'fork' 走到 runForkEffect --- 4

    6. 相当于执行 take(function* () {
                    while(true) {
                        const action = yield take();
                        worker(action);
                    }
                );
    
    7. take函数里执行时, result 的值为 -- 3
    {
        done: false,
        value: {
            type: 'take'
        }
    }
    
    8. 由于type 为 'take', 执行 runTakeEffect, 相当于执行了 -- 5
        chan.take(input => {
            next(input);
        });
    
    8. 当点击按钮的时候执行  chan.put(`action data${i++}`),
    会执行
    chan.take(input => {
        next(`action data${i++}`);
    });

    9. next(`action data${i++}`) 的执行, 因为这个时候 iterator 为
    function* () {
        while(true) {
            const action = yield take();
            worker(action);
        }
    }
    所有相当于执行了 worker(action);
    work 为 action => {
        $result.innerHTML = action;
    }

    9. 由于是 while(true), 所有上面的 next 执行又到了 yield take();
     又执行了 runTakeEffect({type: 'take'}, next);
*/
```
