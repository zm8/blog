# redux-saga 学习

## 导读

Sagas 都用 Generator 函数实现。Sagas 里面的 yield 函数后面的东东叫 Effect, 它是一个简单的对象。
redux 里的 action 的 type 相当于 put 参数的 pattern, payload 相当于 put 里的 args;

## 1. effect 介绍

#### 1. take

'take' 会阻塞! next 等待 channel put 后才会执行。
runTakeEffect 源码大概如下, 它执行了 channel.take, 需要等待 channel.put 会触发它的 next。

```javascript
function runTakeEffect({ pattern }, next) {
	channel.take({
		pattern,
		cb: (args) => next(null, args),
	});
}
```

### 2. call

`call` 不会阻塞! 等待异步操作成功之后执行 next;
但是通常是个异步的操作, 比如 Promise, 需要等待 resolve 后会继续执行 next。

```javascript
function runCallEffect({ fn, args }, next) {
	/* 通常情况fn返回promise */
	fn.call(null, args)
		.then((success) => next(null, success))
		.catch((error) => next(error));
}
```

call 不仅可以用来调用 返回的是 Promise 的函数，也可以用来调用 其它 Generator 函数。

```javascript
function fn(num) {
	return new Promise((resolve) => {
		setTimeout(() => resolve(num), 3000);
	});
}

function* saga() {
	const data = yield call(fn, 1);
	console.log(data); // 等于1
}

// --------或者---------
function* fn(num) {
	yield delay(3000);
	return num;
}

function* saga() {
	const data = yield call(fn, 1);
	console.log(data); // 等于1
}
```

### 3. put

`put` 不会阻塞! 立即执行 next;
主要是为了配置 redux 使用; 会先调用 redux 的 dispatch 方法; 然后执行 channel.put(type, payload); 最后执行 next()

```javascript
function runPutEffect({ action }, next, store) {
	const { dispatch } = store;
	dispatch(action);
	next();
}
```

### 4. fork

`fork` 不会阻塞! 立即执行 next;
fork 的参数是个 saga, 也就是 Generator, 里面会走另外一个线程, 它和主线程可以通过 put 来进行交流。

```javascript
function runForkEffect({ saga }, next, store) {
	const child = saga();
	producer.call(store, child);
	next(null); // 继续执行下一个
}
```

### 5. takeEvery

`takeEvery` 不会阻塞! 立即执行 next;
它也是走子进程, 内部通过调用 take 和 fork , 并进行一个无限的循环;

```javascript
function runTakeEveryEffect({ pattern, saga }, next, store) {
	function* takeEvery() {
		while (true) {
			yield take(pattern);
			yield fork(saga);
		}
	}

	runForkEffect({ saga: takeEvery }, next, store);
}
```

## 2. 取消任务的传播

1. **正常的 cancel task**
   会先 cancel 最底层的, 然后一层一层往上冒

```javascript
function f3() {
	let t;
	var p = new Promise((resolve) => {
		t = setTimeout(() => resolve("f3333333"), 3000);
	});
	p[CANCEL] = function () {
		clearTimeout(t);
		console.log("cancel f3");
	};
	return p;
}

function* f2() {
	let v;
	try {
		v = yield call(f3);
	} finally {
		if (yield cancelled()) {
			console.log("cancel f2");
		}
	}
	return v;
}

function* f1() {
	let v;
	try {
		v = yield call(f2);
	} finally {
		if (yield cancelled()) {
			console.log("cancel f1");
		}
	}
	console.log(v);
}

function* testSaga() {
	const task = yield fork(f1);
	yield delay(1000);
	yield cancel(task);
}

// cancel f3
// cancel f2
// cancel f1
```

2. fork 嵌套 fork

- `console.log('delayFunc'); // 永远不会执行 `
- 先 cancel 当前阻塞的 delayFunc, 然后再主进程 cancel f1, 然后再 cancel 子进程

```javascript
function f3(num) {
	let t;
	var p = new Promise((resolve) => {
		t = setTimeout(() => resolve(num), 3000);
	});
	p[CANCEL] = function () {
		clearTimeout(t);
		console.log("cancel f3");
	};
	return p;
}

function* f2(num) {
	let v;
	try {
		v = yield call(f3, num);
	} finally {
		if (yield cancelled()) {
			console.log("cancel f2");
		}
	}
	console.log(v);
	return v;
}

function delayFunc() {
	let t;
	var p = new Promise((resolve) => {
		t = setTimeout(() => resolve("delayFunc"), 3000);
	});
	p[CANCEL] = function () {
		clearTimeout(t);
		console.log("cancel delay");
	};
	return p;
}

function* f1() {
	try {
		yield fork(f2, 1);
		yield fork(f2, 2);
		yield call(delayFunc);
		console.log("delayFunc"); // 永远不会执行
	} finally {
		if (yield cancelled()) {
			console.log("cancel f1");
		}
	}
}

function* testSaga() {
	const task = yield fork(f1);
	yield call(delay, 2000);
	yield cancel(task);
}

// cancel delay
// cancel f1
// cancel f3
// cancel f2
// cancel f3
// cancel f2
```

3. `yield all` 发生错误

会造成平行的任务取消, delayFunc 的错误会造成 f2 两个任务的取消。

```javascript
function f3(num) {
	let t;
	var p = new Promise((resolve) => {
		t = setTimeout(() => resolve(num), 3000);
	});
	p[CANCEL] = function () {
		clearTimeout(t);
		console.log("cancel f3");
	};
	return p;
}

function* f2(num) {
	let v;
	try {
		v = yield call(f3, num);
	} finally {
		if (yield cancelled()) {
			console.log("cancel f2");
		}
	}
	console.log(v);
	return v;
}

function delayFunc() {
	let t;
	var p = new Promise((resolve, reject) => {
		t = setTimeout(() => reject("delayFunc error"), 2000);
	});
	p[CANCEL] = function () {
		clearTimeout(t);
		console.log("cancel delay");
	};
	return p;
}

function* testSaga2() {
	try {
		yield all([call(delayFunc), call(f2, 1), call(f2, 2)]);
	} catch (e) {
		console.log(e); // delayFunc error
	}
}

// cancel f3
// cancel f2
// cancel f3
// cancel f2
// delayFunc error
```

## 3. fork 的终止

一个 `saga` 的执行结束，必须在它里面的 有阻塞的部分都已经执行完毕 和 所有的 fork 都执行完毕。
如下的代码, end 的输出必须等待 5 秒, 尽管 1 秒之后就输出 `delay 1000` 了。

```javascript
function* f1() {
	yield fork(delay, 1000);
	yield fork(delay, 5000);
	yield call(delay, 1000);
	console.log("delay 1000");
}

function* testSaga() {
	yield call(f1);
	console.log("end");
}

// delay 1000
// end
```

## 4. saga 发生错误

一个 saga 发生错误, 原因有它自身主体发生错误，或错误从它的 fork 子任务冒泡上来

1. **主任务错误, 造成子任务取消**
   如下代码, 造成 fork 的子任务 fn 取消。
   ![image](https://user-images.githubusercontent.com/32337542/74600893-843a7800-50d2-11ea-9362-20f2b386860e.png)

```javascript
function fn() {
	let t;
	var p = new Promise((resolve) => {
		t = setTimeout(resolve, 3000);
	});
	p[CANCEL] = function () {
		clearTimeout(t);
		console.log("cancel promise");
	};
	return p;
}
function* main() {
	yield fork(fn);
	throw "error in *errorFn";
}
export default function* rootSaga() {
	yield all([main()]);
}
```

2. **子任务错误, 造成其它子任务取消**

打印日志同上。
由于子任务的错误冒泡到主任务, 所以造成其它任务取消

```javascript
// fn代码同上

function* child() {
	throw "error in *child";
}
function* main() {
	yield fork(fn);
	yield fork(child);
}
```

1. **子任务错误, 造成主任务取消**

- 注意子任务的错误必须在 try 里面。
- fork 的子任务, `try...catch` 捕捉不到。

![image](https://user-images.githubusercontent.com/32337542/74600970-9ec12100-50d3-11ea-907d-bec130f91167.png)

```javascript
function* child() {
	throw "error in *child";
}
function* main() {
	try {
		yield fork(child);
	} catch (e) {
		console.log(e); // 不会打印
	} finally {
		if (yield cancelled()) {
			console.log("*main cancel");
		}
		console.log("*main finally");
	}
	console.log("*main end"); // 不会打印
}
```

若子任务错误不在 try 里, 如下代码, 是不会造成主任务取消。

```javascript
function* main() {
  yield fork(child);
  ...
}
```

或主任务的代码已经执行到 finally, 如下代码, 也是不会造成主任务取消。

- 由于子任务延迟 1s 抛出错误, 当前代码已经走到了 finally, 所以主任务就不会取消了。
- 所以如果我们在 `yield fork(child);` 后面加 `yield delay(2000);`, 则主任务就可以取消。

```javascript
function* child() {
	yield delay(1000);
	throw "error in *child";
}
function* main() {
	try {
		yield fork(child);
	} catch (e) {
		console.log(e); // 不会打印
	} finally {
		if (yield cancelled()) {
			console.log("*main cancel");
		}
		console.log("*main finally");
	}
	console.log("*main end"); // 不会打印
}
```

4. **主任务直接错误(throw), 不会造成主任务取消。**
   throw 代码要么被 catch 抓到, 那么就不算错误。
   打印:

```
error in *main
*main finally
*main end
```

```javascript
function* main() {
	try {
		throw "error in *main";
	} catch (e) {
		console.log(e);
	} finally {
		if (yield cancelled()) {
			console.log("*main cancel"); // 不会打印
		}
		console.log("*main finally");
	}
	console.log("*main end");
}
```

要么 throw 在 try 上面, 则 throw 后面的代码都不执行

```javascript
function* main() {
  throw "error in *main";
  ...
}
```

5. **取消顺序, 主任务先取消, 子任务再取消**
   ![image](https://user-images.githubusercontent.com/32337542/74601599-e7300d00-50da-11ea-9566-12ec34d136d6.png)

```javascript
// fn 函数同上

function* child() {
	throw "error in *child";
}
function* main() {
	yield fork(fn);
	try {
		yield fork(child);
	} catch (e) {
		console.log(e);
	} finally {
		if (yield cancelled()) {
			console.log("*main cancel");
		}
		console.log("*main finally");
	}
	console.log("*main end"); // 不会打印
}
```

**总结**

- 主任务只要发生错误, 会造成其它子任务取消。
  这里的错误是能捕捉的到, 比如直接 throw, 或者 fork 的子任务错误冒泡上来。
  而像下面的代码, throw 放在 setTimeout 里, 是不会造成 fn 的取消。

```javascript
function* main() {
	yield fork(fn);
	setTimeout(() => {
		throw "error in *child";
	});
}
```

- fork 的错误在主任务里面是捕捉不到的，但是在主任务的父级通过 call 可以捕捉的到。
  如下代码 catch 里不会打印。

```javascript
function* child() {
	throw "error in *child";
}
function* main() {
	try {
		yield fork(child);
	} catch (e) {
		console.log(e); // 不会执行
	}
}
```

但增加一个父级 \*mainParent, 则会打印错误

```javascript
function* child() {
	throw "error in *child";
}
function* main() {
	yield fork(child);
}
function* mainParent() {
	try {
		yield call(main);
	} catch (e) {
		console.log(e);
	}
}
export default function* rootSaga() {
	yield all([mainParent()]);
}
```

**注:**
1.1.3^版本 redux-saga, delay 是一个 effect, 所以得用 `yield delay(500)`, 而不是 ` yield call(delay, 500)`

## 5. Detached forks (using spawn)

> Detached forks live in their own execution context. A parent doesn't wait for detached forks to terminate. Uncaught errors from spawned tasks are not bubbled up to the parent. And cancelling a parent doesn't automatically cancel detached forks (you need to cancel them explicitly).

> spawn is an effect that will disconnect your child saga from its parent, allowing it to fail without crashing it's parent

## 6. 使用 Channels

### 1.actionChannel

1. **put 和 take**
   如下的代码是不会打印 `testSaga end`

```javascript
function* testSaga() {
	yield put({ type: "REQUEST" });
	yield take("REQUEST");
	console.log("testSaga end");
}

export default function* rootSaga() {
	yield all([testSaga()]);
}
```

2. **fork 里的 put**
   fork 里的*putSaga 里面的 put 会把主动权又交回 *testSaga, 并且会把 put 的动作存储下来, 并且阻塞 \*putSaga，相当于延迟执行 asap。

所以最终打印:

```
1
2
3
4
5
6
```

```javascript
function* testSaga() {
	yield fork(putSaga);
	console.log(3);
	yield take("REQUEST");
	console.log(4);
}

function* putSaga() {
	console.log(1);
	yield console.log(2);
	yield put({ type: "REQUEST" });
	yield console.log(5);
	console.log(6);
}

export default function* rootSaga() {
	yield all([testSaga()]);
}
```

3. **actionChannel**
   fork 可以不阻塞请求的处理，但如果我们想按顺序处理请求, 则这个时候可以使用 actionChannel

如下代码 1 秒钟会马上打印出 ` 1,2,3,4,5,6,7,8,9,10`

```javascript
function* testSaga() {
	while (true) {
		const { payload } = yield take("REQUEST");
		yield fork(handleRequest, payload);
	}
}

function* handleRequest(payload) {
	yield delay(1000);
	console.log("payload", payload);
}

function* putRequest() {
	let i = 0;
	while (true) {
		i++;
		if (i > 10) {
			break;
		}
		yield put({ type: "REQUEST", payload: i });
	}
}

export default function* rootSaga() {
	yield all([testSaga(), putRequest()]);
}
```

如下代码每隔 1 秒会顺序打印出 ` 1,2,3,4,5,6,7,8,9,10`

```javascript
function* testSaga() {
	const requestChan = yield actionChannel("REQUEST");
	while (true) {
		const { payload } = yield take(requestChan);
		yield call(handleRequest, payload); // fork 改成了 call
	}
}
```

4. **buffers.sliding 最多保留的条数**

修改 \*testSaga 代码, 注意加了 `yield delay(0);`

```javascript
function* testSaga() {
  const requestChan = yield actionChannel("REQUEST", buffers.sliding(2));
  yield delay(0); // 或 yield delay(1);
  ...
}
```

代码输出

```
payload 9
payload 10
```

若不加 `yield delay(0);`, 由于第 1 个值会被马上消化, 所以会输出

```
payload 1
payload 9
payload 10
```

5. **buffers.none 不保留**

修改代码 \*testSaga

```javascript
function* testSaga() {
  const requestChan = yield actionChannel("REQUEST", buffers.none());
  yield delay(0);
  ...
}
```

不会打印任何东西。
注意 `yield delay(0);` 必须有, 否则直接打印了 `payload 1, 2, 3, 4, 5, 6, 7, 8, 9, 10`

6. **buffers.fixed(limit) 最多缓存几条**
   会报错 Channel's Buffer overflow!

```javascript
function* testSaga() {
  const requestChan = yield actionChannel("REQUEST", buffers.fixed(9));
  yield delay(0);
  ...
}
```

![image](https://user-images.githubusercontent.com/32337542/74132569-d0dd0980-4c21-11ea-8cb3-2f76ee149a13.png)

7. **buffers.expanding 扩展**
   目前看来 和不传任何参数是一样的, 下面的代码也是打印 `payload 1, 2, 3, 4, 5, 6, 7, 8, 9, 10`
   感觉没什么用...

```javascript
function* testSaga() {
  const requestChan = yield actionChannel("REQUEST", buffers.expanding(1));
  // 等价于
  //   const requestChan = yield actionChannel("REQUEST");

  yield delay(0);
  ...
}
```

8. **buffers.dropping**
   溢出时将会丢弃消息, 下面的代码打印 `payload 1, 2, 3, 4, 5`

```javascript
function* testSaga() {
  const requestChan = yield actionChannel("REQUEST", buffers.dropping(5));
  yield delay(0);
  ...
}
```

9. **flush(channel)**
   flush 清空 channel 里的缓存数据, 并且返回清除的数据。
   如下代码输出:
   ![image](https://user-images.githubusercontent.com/32337542/74208267-bfe1d600-4cbd-11ea-9f27-7857780f306c.png)

```javascript
function* testSaga() {
	const requestChan = yield actionChannel("REQUEST");
	yield delay(0);
	let i = 0;
	while (true) {
		i++;
		if (i > 2) {
			console.log("--------");
			const actions = yield flush(requestChan);
			console.log(actions);
			break;
		}
		const actions = yield take(requestChan);
		console.log(actions);
		yield call(handleRequest, actions.payload);
	}
}
```

### 2.eventChannel

和 actionChannel 不同在于, 它的事件源来自内部, 而不像 actionChannel 通过 外部的 `yield put({ type: "REQUEST" });` 触发。
通过 eventChannel 内部派发 `emitter(END);` 来关闭 eventChannel。

#### 1. 使用

emitter 方法的执行必须延迟，否则 take 不到值。
打印如下:

```
{fff: 1}
end
```

```javascript
const PAYLOAD = {
	fff: 1,
};

function evtChan() {
	return eventChannel((emitter) => {
		setTimeout(() => {
			emitter(PAYLOAD);
			emitter(END);
		});
		return () => {
			console.log("end");
		};
	});
}

function* testSaga3() {
	const chan = yield call(evtChan);
	const payload = yield take(chan);
	console.log(payload);
}
```

修改 evtChan, 这样只能打印 `end`

```javascript
function evtChan() {
	return eventChannel((emitter) => {
		emitter(PAYLOAD);
		emitter(END);
		return () => {
			console.log("end");
		};
	});
}
```

**倒计时的例子**
下面的代码会打印:

```
4
3
2
1
clearInterval
coundownSaga finally
```

```javascript
import { eventChannel, END } from "redux-saga";

function coundown(num) {
	return eventChannel((emitter) => {
		const iv = setInterval(() => {
			num--;
			if (num > 0) {
				emitter(num);
			} else {
				// 触发 channel 关闭, 则会执行下面的 clearInterval
				emitter(END);
			}
		}, 1000);
		return () => {
			console.log("clearInterval");
			clearInterval(iv);
		};
	});
}

function* coundownSaga() {
	const chan = yield call(coundown, 3);
	try {
		while (true) {
			let num = yield take(chan);
			console.log(num);
		}
	} finally {
		console.log("coundownSaga finally");
	}
	console.log("coundownSaga end"); // 注意它不会执行，具体原因看后面解释。
}
```

#### 2. 自己取消

通过调用 ` chan.close();`, 下面的代码输出:

```
4
3
2
clearInterval
coundownSaga finally
coundownSaga end
```

```javascript
function* coundownSaga() {
	const chan = yield call(coundown, 5);
	try {
		while (true) {
			let num = yield take(chan);
			if (num === 1) {
				throw "error";
			}
			console.log(num);
		}
	} catch (e) {
		chan.close();
	} finally {
		console.log("coundownSaga finally");
	}
	console.log("coundownSaga end");
}
```

若把 **`chan.close();` 注释了**, 则倒计时结束之后自己会取消, 所以会输出:

```
4
3
2
coundownSaga finally
coundownSaga end
clearInterval
```

#### 3. cancle task 后的渠道关闭 chan.close

代码如下, 3 秒以后执行 `cancel(task);`
打印如下:

```
4
3
2
clearInterval
coundownSaga cancel
coundownSaga finally
```

```javascript
function* coundownSaga() {
	const chan = yield call(coundown, 5);
	try {
		while (true) {
			let num = yield take(chan);
			console.log(num);
		}
	} catch (e) {
		console.log("coundownSaga error");
	} finally {
		if (yield cancelled()) {
			chan.close();
			console.log("coundownSaga cancel");
		}
		console.log("coundownSaga finally");
	}
	// 下面代码 不会执行
	// 详情博客 Generator里try..finnaly执行return的特殊
	console.log("coundownSaga end");
}

function* testSaga() {
	const task = yield fork(coundownSaga);
	yield delay(3000);
	yield cancel(task);
}

export default function* rootSaga() {
	yield all([testSaga()]);
}
```

#### 4. chan 关闭 是否会终止当前的 saga

执行了 `emitter(END)` 或 `chan.close()` , 若代码 `yield take(chan)` 还没执行, 则会终止整个 saga, 否则不会终止。

**终止例子**
先执行了 `yield take(chan);`, 后执行 `emitter(END);` 输出如下:

```
clearInterval
coundownSaga finally
```

```javascript
function coundown(num) {
	return eventChannel((emitter) => {
		const iv = setInterval(() => {
			emitter(END);
		}, 1000);
		return () => {
			console.log("clearInterval");
			clearInterval(iv);
		};
	});
}

function* coundownSaga() {
	const chan = yield call(coundown, 5);
	try {
		// chan.close();
		let num = yield take(chan);
		console.log(num);
		yield delay(3000);
		console.log(1111111);
	} catch (e) {
		console.log("coundownSaga error");
	} finally {
		console.log("coundownSaga finally");
	}
	console.log("coundownSaga end");
}

export default function* rootSaga() {
	yield all([coundownSaga()]);
}
```

**不终止例子**
下面代码还是会继续执行 `1111111 和 coundownSaga end`

```
5
clearInterval
1111111
coundownSaga finally
coundownSaga end
```

```javascript
function coundown(num) {
	return eventChannel((emitter) => {
		const iv = setInterval(() => {
			emitter(num);
			setTimeout(() => {
				emitter(END);
			}, 100);
		}, 1000);
		return () => {
			console.log("clearInterval");
			clearInterval(iv);
		};
	});
}

function* coundownSaga() {
	const chan = yield call(coundown, 5);
	try {
		let num = yield take(chan);
		console.log(num);
		// 这种情况 chan.close() 也不会阻止后面的代码执行
		yield delay(3000);
		console.log(1111111);
	} catch (e) {
		console.log("coundownSaga error");
	} finally {
		console.log("coundownSaga finally");
	}
	console.log("coundownSaga end");
}

export default function* rootSaga() {
	yield all([coundownSaga()]);
}
```

#### 5. try...finnaly 后面的代码永不执行原因

下面的代码 `coundown end` 不会执行, 这是 `try...catch` 里面有 `while(true)` 这个机制决定的。

```javascript
function coundown() {
	try {
		while (true) {}
	} finally {
	}
	console.log("coundown end");
}
```

若增加 catch, 则最后的代码有可能执行。

```javascript
function coundown() {
	try {
		while (true) {
			throw "error";
		}
	} catch (e) {
	} finally {
	}
	console.log("coundown end");
}
```

### 3. 使用 channels (在不同 saga 之间进行交流)

#### 3 种区别:

1. 创建的方式有

```javascript
yield actionChannel("REQUEST");
yield call(channelCreate); // channelCreate 是返回的是 eventChannel
yield call(channel);
```

2. 派发的方式

```javascript
yield put({ type: "REQUEST", payload: PAYLOAD });
eventChannel 内部 emmit 派发 emitter(PAYLOAD);
yield put(chan, PAYLOAD);
```

#### 3 种实现:

**1. actionChannel**

```javascript
function* actionChannelSaga() {
	const chan = yield actionChannel("REQUEST");
	yield fork(handle, chan);
	yield put({ type: "REQUEST", payload: PAYLOAD });
}
function* handle(chan) {
	const { payload } = yield take(chan);
	console.log(payload);
}
```

**2. eventChannel**

```javascript
function* eventChannelSaga() {
	const chan = yield call(evtChan);
	const payload = yield take(chan);
	console.log(payload);
}

function evtChan() {
	return eventChannel((emitter) => {
		setTimeout(() => {
			emitter(PAYLOAD);
			emitter(END);
		});
		return () => {};
	});
}
```

**3. channel**

```javascript
function* channelSaga() {
	const chan = yield call(channel);
	yield fork(handle, chan);
	yield put(chan, PAYLOAD);
}
function* handle(chan) {
	const payload = yield take(chan);
	console.log(payload);
}
```

#### 实现最大并发只能接收 3 个任务

这种机制的特点如下:

> All the three workers run a typical while loop. On each iteration, a worker will take the next request, or will block until a message is available. Note that this mechanism provides an automatic load-balancing between the 3 workers. Rapid workers are not slowed down by slow workers.

代码几个重点:

1. 只用了一个 channel。
2. 用 `yield take("REQUEST")` 做了一个代理。

```
// 过1s
1
2
3
// 过1s
4
5
6
// 过1s
7
8
9
```

```javascript
function* channelSaga() {
	const chan = yield call(channel);
	for (let i = 0; i < 3; i++) {
		yield fork(handleRequest, chan);
	}
	while (true) {
		// 这里巧妙的做了一层代理
		const { payload } = yield take("REQUEST");
		yield put(chan, payload);
	}
}
function* handleRequest(chan) {
	while (true) {
		const payload = yield take(chan);
		yield delay(1000);
		console.log(payload);
	}
}

function* putRequest() {
	let i = 0;
	while (true) {
		i++;
		if (i > 9) {
			break;
		}
		yield put({ type: "REQUEST", payload: i });
	}
}

export default function* rootSaga() {
	yield all([channelSaga(), putRequest()]);
}
```

若用 `actionChannel` 来实现的话, 代码更少, 但是创建的时已绑定了 `action` 为 `REQUEST`, 可能没有用`yield call(channel)` 这种创建方式灵活。

```javascript
function* channelSaga() {
	const chan = yield actionChannel("REQUEST");
	for (let i = 0; i < 3; i++) {
		yield fork(handleRequest, chan);
	}
}

function* handleRequest(chan) {
	while (true) {
		const { payload } = yield take(chan);
		yield delay(1000);
		console.log(payload);
	}
}
```

## 7. Root Saga Patterns

有 2 种方式, 一种是 `yield all` 或 `yield fork`,
区别是 all 是 `blocking effect`, fork 不是。
另外 fork 返回的 task 可以 cancel 或者 join

```javascript
export default function* rootSaga() {
  yield all([
    helloSaga(),
    watchIncrementAsync()
  ])
  // code after all-effect
}

export default function* rootSaga() {
  yield fork(saga1)
  yield fork(saga2)
  yield fork(saga3)
  // code after fork-effect
}
```

或者结合 all 和 fork 的方式

```javascript
const [task1, task2, task3] = yield all([ fork(saga1), fork(saga2), fork(saga3) ])
```

### Keeping the root alive

spawn 和 fork 的区别是, spawn is an effect that will disconnect your child saga from its parent, allowing it to fail without crashing it's parent.

```javascript
export default function* rootSaga() {
	yield spawn(saga1);
	yield spawn(saga2);
	yield spawn(saga3);
}
```

### Keeping everything alive

如何让 saga 发生错误以后重启

```javascript
function* rootSaga() {
	const sagas = [saga1, saga2, saga3];

	yield all(
		sagas.map((saga) =>
			spawn(function* () {
				while (true) {
					try {
						yield call(saga);
						break;
					} catch (e) {
						console.log(e);
					}
				}
			})
		)
	);
}
```

## 8. Recipes

### 1. Throttling(截流)

如下代码, 首次能马上执行, 后面 2s 期间执行的以最后一次为准。

```
1    // 马上执行
3    // 2s 以后执行
```

```javascript
function* handleInput(action) {
	console.log(Date.now());
	console.log(action.payload);
}

function* watchInput() {
	yield throttle(2000, "INPUT_CHANGED", handleInput);
}

function* putSaga() {
	console.log(Date.now());
	yield put({ type: "INPUT_CHANGED", payload: 1 });
	yield put({ type: "INPUT_CHANGED", payload: 2 });
	yield delay(1000); // 并不影响上面的代码throttle设置的 2000
	yield put({ type: "INPUT_CHANGED", payload: 3 });
}

export default function* rootSaga() {
	yield all([watchInput(), putSaga()]);
}
```

如何用 api 进行模拟:

```javascript
const throttle = (ms, pattern, task, ...args) =>
	fork(function* () {
		const throttleChannel = yield actionChannel(pattern, buffers.sliding(1));

		while (true) {
			const action = yield take(throttleChannel);
			yield fork(task, ...args, action);
			yield delay(ms);
		}
	});
```

### 2. debounce(防抖)

每次执行都会清空定时器, 有点像下面的 setTimeout

```javascript
clearTimeout(t);
t = setTimeout(()=>{
    ...
}, 2000);
```

所以下面的代码过了 4s 才输出了 3。

```javascript
function* handleInput(action) {
	console.log(Date.now());
	console.log(action.payload);
}

function* watchInput() {
	yield debounce(2000, "INPUT_CHANGED", handleInput);
}

function* putSaga() {
	console.log(Date.now());
	yield put({ type: "INPUT_CHANGED", payload: 1 });
	yield delay(1000);
	yield put({ type: "INPUT_CHANGED", payload: 2 });
	yield delay(1000);
	yield put({ type: "INPUT_CHANGED", payload: 3 });
}
```

使用 fork 来模拟 debounce

```javascript
function* handleInput(action) {
	yield delay(2000); // 这里延迟了 执行
	console.log(Date.now());
	console.log(action.payload);
}

function* watchInput() {
	let task;
	while (true) {
		const action = yield take("INPUT_CHANGED");
		if (task) {
			yield cancel(task);
		}
		task = yield fork(handleInput, action);
	}
}

function* putSaga() {
	console.log(Date.now());
	yield put({ type: "INPUT_CHANGED", payload: 1 });
	yield put({ type: "INPUT_CHANGED", payload: 2 });
	yield delay(1000);
	yield put({ type: "INPUT_CHANGED", payload: 3 });
}

export default function* rootSaga() {
	yield all([watchInput(), putSaga()]);
}
```

使用 takeLatest 来模拟 debounce

```javascript
function* handleInput(action) {
  yield delay(2000);
  ......
}

function* watchInput() {
  yield takeLatest("INPUT_CHANGED", handleInput);
}
```

如何用 api 进行模拟:

```javascript
const debounce = (ms, pattern, task, ...args) =>
	fork(function* () {
		while (true) {
			let action = yield take(pattern);

			while (true) {
				const { debounced, latestAction } = yield race({
					debounced: delay(ms),
					latestAction: take(pattern),
				});

				if (debounced) {
					yield fork(task, ...args, action);
					break;
				}

				action = latestAction;
			}
		}
	});
```

### 3. Retrying XHR calls

重试 xhr 发送，下面代码 3s 打印了 success
代码优化的地方有:

- for 里面用了 return
- 最后 1 次失败 不需要 return

```javascript
let j = 0;
function ajax(text) {
	j++;
	if (j < 4) {
		throw "err";
	}
	return text;
}

function* fetchApi() {
	for (let i = 0; i < 5; i++) {
		try {
			let data = yield call(ajax, "success");
			// 巧妙的地方, for 里面用了 return, 成功则返回了
			return data;
		} catch (e) {
			if (i < 4) {
				// 最后1次还是失败, 则不需要 delay, 所以这里用了 < 4
				yield delay(1000);
			}
		}
	}
	throw new Error("API request failed");
}

function* watchInput() {
	try {
		console.log(Date.now());
		let data = yield call(fetchApi);
		console.log(Date.now());
		console.log(data);
	} catch (e) {
		console.log("fail", e.message);
	}
}

export default function* rootSaga() {
	yield all([watchInput()]);
}
```

如果用 retry effect, 则不需要 \*fetchApi 函数, 可以这么写:

```javascript
let j = 0;
function ajax(text) {
	j++;
	if (j < 4) {
		throw "err";
	}
	return text;
}

function* watchInput() {
	try {
		console.log(Date.now());
		let data = yield retry(5, 1 * 1000, ajax, "success");
		console.log(Date.now());
		console.log(data);
	} catch (e) {
		console.log("fail", e.message);
	}
}

export default function* rootSaga() {
	yield all([watchInput()]);
}
```

### 4. Undo

主要使用 delay 和 race 这 2 个 effect, 而不存储之前的 preState 来做 undo。

```javascript
const { undo, archive } = yield race({
    undo: take(action => action.type === "UNDO" && action.undoId === undoId),
    archive: delay(5000)
});

if (undo) {
    ...
} else if (archive) {
    ...
}
```

## 9. API

### 1. take(pattern)

`yield put({ type: "bb" })` 触发以下 take

```javascript
yield take('bb');
yield take(); // 则任意 type 都会触发
yield take(action => action.type === "bb");

const fn = () => {};
fn.toString = () => "bb";
yield take(fn);

yield take(["aa", "bb"]); // 只要有一个等于 type, 都会触发
```

若使用 `yield put(END);`, 则 saga 会终止, 如下代码只会输出 finally

```javascript
function* watchSaga() {
	try {
		yield take("bb");
		console.log("1"); // 不会触发
	} catch (e) {
	} finally {
		if (yield cancelled()) {
			console.log("cancel"); // 不会触发
		}
		console.log("finally");
	}
	console.log("end"); // 不会触发
}

function* putSaga() {
	yield put(END);
}

export default function* rootSaga() {
	yield all([watchSaga(), putSaga()]);
}
```

若增加一个 fork, 则父 saga 会等 fork 执行完
下面代码输出:

```
finally
// 3s 后输出 doDelay
doDelay
ok
```

```javascript
function* doDelay() {
  yield delay(3000);
  console.log("doDelay");
}

function* childSaga() {
  try {
    yield fork(doDelay);
    ...
  }
}

function* watchSaga() {
  yield call(childSaga);
  console.log("ok");
}
```

### 2.takeMaybe(pattern)

和 take 的区别是, `put(END)` 不会终止 saga, 而是会被 takeMaybe 匹配到

1. 下面代码和正常的 take 一样, 输出 ok

```javascript
function* watchSaga() {
	yield takeMaybe("bb");
	console.log("ok");
}

function* putSaga() {
	yield put({
		type: "bb",
	});
}
```

2. 下面的代码 END 被 takeMaybe 匹配

```javascript
function* watchSaga() {
	yield takeMaybe("bb");
	yield takeMaybe("ss");
	console.log("ok");
}

function* putSaga() {
	yield put(END);
}
```

### 3. put 和 putResolve

Just like put but the effect is blocking (if promise is returned from dispatch it will wait for its resolution); putResolve 后面的代码会被 block 住。

1. 首先安装 redux-thunk

```javascript
import thunkMiddleware from "redux-thunk";
const sagaMiddleware = createSagaMiddleware();
const store = createStore(
	reducer,
	applyMiddleware(thunkMiddleware, sagaMiddleware)
);
sagaMiddleware.run(rootSaga);
```

2. 下面的代码输出:

```
// 过3s 打印 watchSaga
watchSaga
// 马上打印 putSaga
putSaga
```

```javascript
const delayFn = (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

const fetchSmth = (smth) => (dispatch) =>
	delayFn(2000).then(() => dispatch({ type: smth }));

function* watchSaga() {
	yield take("bb");
	console.log("watchSaga");
}

function* putSaga() {
	yield putResolve(fetchSmth("bb"));
	console.log("putSaga");
}

export default function* rootSaga() {
	yield all([watchSaga(), putSaga()]);
}
```

若改成 ` yield put(fetchSmth("bb"));`, 输出如下:

```
// 马上打印 watchSaga
watchSaga
// 过3s打印 putSaga
putSaga
```

### 4. call

- call(fn, ...args)
- call([context, fn], ...args)
- call([context, fnName], ...args)

1. call([context, fnName], ...args) 的用法

```javascript
var obj = {
	n: (val) => val,
};

function* putSaga() {
	var d = yield call([obj, "n"], "aaaa");
	console.log(d);
}
```

### 5. cps(fn, ...args)

下面的代码输出 `[1, 2]`

```javascript
const fn = (a, b, cb) => cb(null, [a, b]);

function* watchSaga() {
	try {
		var d = yield cps(fn, 1, 2);
		console.log(d);
	} catch (e) {
		console.log(e);
	}
}
```

若修改上面代码, 则 `console.log(e)` 输出 'ffff'

```
const fn = (a, b, cb) => cb('ffff', [a, b]);
```

### 6. join(task)

会让之前 fork 的 task 进行阻塞。

下面的代码 2s 才会打印 watchSaga

```javascript
function* fn(time) {
	yield delay(time);
}

function* watchSaga() {
	const task = yield fork(fn, 2000);
	yield join(task);
	console.log("watchSaga");
}
```

下面的代码 4s 才会打印 watchSaga:

```javascript
function* fn(time) {
	yield delay(time);
}

function* watchSaga() {
	const task = yield fork(fn, 2000);
	const task2 = yield fork(fn, 4000);
	yield join([task, task2]);
	console.log("watchSaga");
}
```

若 join 的 task 被取消了, 当遇到 `yield join(task)`, 整个 saga 会直接取消了。
下面的代码打印:

```
cancelled
finally
```

```javascript
function* fn(time) {
	yield delay(time);
}

function* watchSaga() {
	const task = yield fork(fn, 2000);
	yield cancel(task);
	try {
		yield join(task);
	} catch (e) {
	} finally {
		if (yield cancelled()) {
			console.log("cancelled");
		}
		console.log("finally");
	}
	console.log("watchSaga"); // 不会执行
}
```

### 7. cancel(task)

1. 先看一个简单的 cancel 例子, 下面的例子输出:

```
cancelled
finally
```

```javascript
function* fn(time) {
	try {
		yield delay(time);
	} catch (e) {
	} finally {
		if (yield cancelled()) {
			console.log("cancelled");
		}
		console.log("finally");
	}
	console.log("end"); // 不会输出
}

function* watchSaga() {
	const task = yield fork(fn, 2000);
	yield cancel(task);
}
```

2. cancel 向子 saga 传播
   如下代码, cancel 造成 fn 被 cancel, fn 又造成 fn2 被 cancel
   下面的代码输出:

```
cancelled fn
finally fn
cancelled fn2
finally fn2
```

```javascript
function* fn2() {
	try {
		yield delay(1000);
	} catch (e) {
	} finally {
		if (yield cancelled()) {
			console.log("cancelled fn2");
		}
		console.log("finally fn2");
	}
	console.log("end fn2"); // 不会输出
}

function* fn() {
	try {
		yield fork(fn2);
		yield delay(2000);
	} catch (e) {
	} finally {
		if (yield cancelled()) {
			console.log("cancelled fn");
		}
		console.log("finally fn");
	}
	console.log("end fn"); // 不会输出
}

function* watchSaga() {
	const task = yield fork(fn);
	yield cancel(task);
}
```

### 8. select(selector, ...args)

返回当前的 state

1. 若不传参数, 则返回整个 state

```javascript
let num = yield select();
console.log(num); //  {num: 1}
```

2. 传递函数

```javascript
const num = yield select(state => state.num);
console.log(num); // 1
```

3. 多传递参数

```javascript
const num = yield select((state, a) => state.num + a, 10);
console.log(num); // 11
```

### 9. race

1. 先看普通的用法

例子 1, 传递对象

```javascript
function* fn1() {
	yield delay(1);
	return 1;
}
function* fn2() {
	yield delay(0);
	return 2;
}
function* watchSaga() {
	const { res1, res2 } = yield race({
		res1: call(fn1),
		res2: call(fn2),
	});
	console.log(res1, res2); // 输出 1, undefined
}
```

例子 2, 传递数组

```javascript
function* watchSaga() {
	const [res1, res2] = yield race([call(fn1), call(fn2)]);
	console.log(res1, res2); // 输出 1, undefined
}
```

例子 3, 会取消其它的 effect
下面的例子输出:

```
cancel
finally
1 undefined
```

```javascript
function* fn1() {
	yield delay(500);
	return 1;
}

function* fn2() {
	try {
		yield delay(5000);
	} catch (e) {
	} finally {
		if (yield cancelled()) {
			console.log("cancel");
		}
		console.log("finally");
	}
}

function* watchSaga() {
	const [res1, res2] = yield race([call(fn1), call(fn2)]);
	console.log(res1, res2); // 输出 1, undefined
}
```

### 10. all(effects)

all 和 race 很像, 但是它必须等待 2 个都执行完了，才会继续下面的

1. 下面的代码过了 2s, 才会输出

```javascript
function* fn1() {
	yield delay(1000);
	return 1;
}

function* fn2() {
	yield delay(2000);
}

function* watchSaga() {
	console.time("saga");
	const [res1, res2] = yield all([call(fn1), call(fn2)]);
	console.timeEnd("saga");
	console.log(res1, res2); // 输出 1, undefined
}
```

如果有一个失败了, 则代码会报错, 另外一个 effect 则会取消,
下面的代码输出:

```
cancel
finally
eee
```

```javascript
function* fn1() {
	yield delay(1000);
	throw new Error("eee");
}

function* fn2() {
	try {
		yield delay(5000);
	} catch (e) {
	} finally {
		if (yield cancelled()) {
			console.log("cancel");
		}
		console.log("finally");
	}
}

function* watchSaga() {
	try {
		console.time("saga");
		const [res1, res2] = yield all([call(fn1), call(fn2)]);
		console.timeEnd("saga");
		console.log(res1, res2); // 输出 1, undefined
	} catch (e) {
		console.log(e.message);
	}
}
```

### 11. Task Api

1. task.isRunning() - true if the task hasn't yet returned or thrown an error

```javascript
function* fn1() {
	yield delay(1000);
}

function* watchSaga() {
	const task = yield fork(fn1);
	console.log(task.isRunning()); // true
	yield delay(1000);
	console.log(task.isRunning()); // false
}
```

2. task.isCancelled() - true if the task has been cancelled

```javascript
function* watchSaga() {
	const task = yield fork(fn1);
	console.log(task.isCancelled()); // false
	yield cancel(task);
	console.log(task.isCancelled()); // true
}
```

3. task.result() - task return value. `undefined` if task is still running

```javascript
function* fn1() {
	yield delay(1000);
	return 1;
}
function* watchSaga() {
	const task = yield fork(fn1);
	console.log(task.result()); // undefined
	yield delay(1000);
	console.log(task.result()); // 1
}
```

4. task.error() - task thrown error. `undefined` if task is still running
   task 抛出的错误

```javascript
function* fn() {
	yield delay(0); // 不延迟0, 则 task 拿不到值
	throw new Error("eee");
}

function* watchSaga() {
	const task = yield fork(fn);
	setTimeout(() => {
		console.log(task.error()); // Error: eee
	}, 0);
}
```

5. task.toPromise()
   a Promise which is either:

- resolved with task's return value
- rejected with task's thrown error
  根据 fn 是 抛出错误还是正常返回决定

```javascript
function* fn() {
	yield delay(0); // 不延迟0, 则 task 拿不到值
	//   throw new Error("eee");
	return "eee";
}

function* watchSaga() {
	const task = yield fork(fn);
	task
		.toPromise()
		.then((v) => {
			console.log(v); // eee
		})
		.catch((e) => {
			console.log(e); // Error: eee
		});
}
```

6. task.cancel()
   和 ` yield cancel(task)` 效果一样

```javascript
function* watchSaga() {
	const task = yield fork(fn);
	task.cancel();
}
```
