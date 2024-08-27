# Generator 代码 Babel 编译后的理解

先上代码:

```javascript
function* helloWorldGenerator() {
	var res = yield "hello";
	yield res / 2;
	yield "world";
	return "ending";
}

var hw = helloWorldGenerator();
console.log(hw.next()); // {value: "hello", done: false}
console.log(hw.next(8888)); // {value: 4444, done: false}
console.log(hw.next()); // {value: "world", done: false}
console.log(hw.next()); // {value: "ending", done: true}
console.log(hw.next()); // {value: undefined, done: true}
```

编译后如下：

```javascript
"use strict";

var _marked = /*#__PURE__*/ regeneratorRuntime.mark(helloWorldGenerator);

function helloWorldGenerator() {
	var res;
	return regeneratorRuntime.wrap(
		function helloWorldGenerator$(_context) {
			while (1) {
				switch ((_context.prev = _context.next)) {
					case 0:
						_context.next = 2;
						return "hello";

					case 2:
						res = _context.sent;
						_context.next = 5;
						return res / 2;

					case 5:
						_context.next = 7;
						return "world";

					case 7:
						return _context.abrupt("return", "ending");

					case 8:
					case "end":
						return _context.stop();
				}
			}
		},
		_marked,
		this
	);
}

var hw = helloWorldGenerator();
console.log(hw.next()); // {value: "hello", done: false}
console.log(hw.next(8888)); // {value: 8888, done: false}
console.log(hw.next()); // {value: "world", done: false}
console.log(hw.next()); // {value: "ending", done: true}
console.log(hw.next()); // {value: undefined, done: true}
```

注意里面多了一个 regeneratorRuntime.wrap 和 regeneratorRuntime.mark 方法。这 2 个方法 到底是啥呢，请看下面的代码:

```javascript
(function () {
	var ContinueSentinel = {};

	var mark = function (genFun) {
		var generator = Object.create({
			next: function (arg) {
				return this._invoke("next", arg);
			},
			return: function (arg) {
				return this._invoke("return", arg);
			},
			throw: function (arg) {
				return this._invoke("throw", arg);
			},
		});
		genFun.prototype = generator;
		return genFun;
	};

	function wrap(innerFn, outerFn, self) {
		/*
                outerFn.prototype 其实就是 genFun.prototype( 在mark 函数里)
        */
		var generator = Object.create(outerFn.prototype);

		var context = {
			done: false,
			method: "next",
			next: 0,
			prev: 0,
			// type: "return", arg: "ending"
			abrupt: function (type, arg) {
				var record = {};
				record.type = type;
				record.arg = arg;

				return this.complete(record);
			},
			complete: function (record, afterLoc) {
				if (record.type === "return") {
					this.rval = this.arg = record.arg;
					this.method = "return";
					this.next = "end";
				}

				return ContinueSentinel;
			},
			stop: function () {
				this.done = true;
				return this.rval;
			},
		};

		generator._invoke = makeInvokeMethod(innerFn, context);

		return generator;
	}

	function makeInvokeMethod(innerFn, context) {
		var state = "start";

		return function invoke(method, arg) {
			if (method === "throw") {
				throw arg;
			}
			if (state === "completed") {
				return { value: undefined, done: true };
			}
			context.method = method;
			context.arg = arg;
			while (true) {
				if (context.method === "next") {
					context.sent = context.arg;
				} else if (context.method === "return") {
					context.abrupt("return", context.arg);
				}
				state = "executing";
				var record = {
					type: "normal",
					arg: innerFn.call(self, context),
				};
				state = context.done ? "completed" : "yield";
				if (record.arg === ContinueSentinel) {
					continue;
				}
				return {
					value: record.arg,
					done: context.done,
				};
			}
		};
	}

	window.regeneratorRuntime = {};
	regeneratorRuntime.wrap = wrap;
	regeneratorRuntime.mark = mark;
})();
```

1. regeneratorRuntime.mark 的作用是构建 helloWorldGenerator 和 hw 的关系链。
   说白了 mark 方法让传入进去的函数原型上多了 next, throw, return 等方法

```javascript
function* f() {}
var g = f();
console.log(g.__proto__ === f.prototype); // true
console.log(g.__proto__.__proto__ === f.__proto__.prototype); // true
```

2. hw = helloWorldGenerator() 相当于调用 regeneratorRuntime.wrap, 返回 generator
3. generator 和 mark 函数通过原型有关联, 所以 hw 有 next, return 等方法
4. 最终的函数是从 makeInvokeMethod 开始执行, innerFn 相当于 helloWorldGenerator$
5. 倒数第 2 个 hw.next() 执行, 会调用函数 helloWorldGenerator$里的

```javascript
return _context.abrupt('return', 'ending'),
```

从而走到

```javascript
if (record.arg === ContinueSentinel) {
    continue;
}
```

又会调用 helloWorldGenerator$里的 \_context.stop()，最后返回:

```javascript
{
    value: "ending",
    done: true
}
```
