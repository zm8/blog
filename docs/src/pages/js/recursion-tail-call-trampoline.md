# 递归, 尾调用, 蹦床函数 学习

## Functions and the Stack 函数和堆栈

Javascript 是单线程, 意思是任何给定的时间只有一个任务可以运行。
如何理解执行上下文环境，请看下面的代码:
![image](https://user-images.githubusercontent.com/32337542/66297078-89680900-e921-11e9-9fa5-7ab4a0545b3e.png)

执行堆示意图如下:
![image](https://user-images.githubusercontent.com/32337542/66297131-a7ce0480-e921-11e9-8169-e46b85fb198a.png)
需要注意的是，当嵌套的函数被调用时，它会被添加到堆中。当代码在它所在的执行上下文执行完, 它将被销毁, 并且控制权移交到上一个堆的执行上下文当中。

## Iterating 迭代

下面代码的 range 函数使用 while 循环去迭代产出一个范围数组。
range 函数在全局的执行上下文当中被调用, 并且触发了一个新的执行上下文在堆中创建。

```javascript
// Generate an array of integers in the range s -> e.
// Iterative implementation
function range(s, e) {
	var res = [];

	while (s != e) {
		res.push(s);
		s < e ? s++ : s--;
	}
	res.push(s);
	return res;
}

range(1, 4); // [1,2,3,4]
range(-5, 1); // [-5,-4,-3,-2,-1,0,1]
```

执行堆示意图如下:
![image](https://user-images.githubusercontent.com/32337542/66297508-64c06100-e922-11e9-811a-2a14904bca65.png)

## Recursion 递归

若用递归来重写 range 函数。每一次递归添加一个新的执行上下文到堆中直到开始的值和结束的值一样。

```javascript
// Generate an array of numbers in a given range.
// Recursive implementation
function range(s, e) {
	var res = [];

	res.push(s);
	return s == e ? res : res.concat(range(s < e ? ++s : --s, e));
}

range(1, 4); // [1,2,3,4]
```

![image](https://user-images.githubusercontent.com/32337542/66297650-a81acf80-e922-11e9-8938-58fa0e8d92e3.png)

## Tail Calls & Recursion 尾调用和递归

如果函数的`return`返回的是另外一个函数的执行，这个函数的执行并不依赖当前的函数执行上下文（即 不依赖任何本地的环境变量），那么就是尾部调用。代码如下:
注意代码 `s===e ? res ` 由于不是调用其它函数, 所以不考虑是否为**尾调用**。

```javascript
// Generate an array of numbers in a given range.
// Tail Recursive implementation
function range(s, e, res) {
	res = res || [];
	res.push(s);
	return s == e ? res : range(s < e ? ++s : --s, e, res);
}

range(1, 4); // [1,2,3,4]
```

是否为尾调用版本代码如下:

```javascript
// Non tail-call version
return s == e ? res : res.concat(range(s < e ? ++s : --s, e));

// Tail call version
return s == e ? res : range(s < e ? ++s : --s, e, res);
```

ES5 不支持尾部调用优化(如下图), ES6 支持。那有没有办法解决? 可以使用 **蹦床函数**。
![image](https://user-images.githubusercontent.com/32337542/66298110-a69dd700-e923-11e9-8fd7-65e0c93a676a.png)

### 尾调用使用蹦床函数(Tail Recursion with Trampoline)

trampoline 是个高阶函数, 需要一个 thunk 函数 **f** 当作参数, 并且返回一个新函数。新函数调用 f 函数, 并且若 f 函数的返回是一个函数, 则会一直调用，直到它返回的不是函数。
thunk 函数是指包装另外一个函数, 而延迟执行。

```javascript
function trampoline(fn) {
	return function () {
		var res = fn.apply(this, arguments);
		while (res instanceof Function) {
			res = res();
		}
		return res;
	};
}

// Generate an array of numbers in a given range.
// Tail Recursive implementation
function range(s, e, res) {
	res = res || [];
	res.push(s);
	// return a result or a thunk if we need to do more
	return s == e
		? res
		: function () {
				return range(s < e ? ++s : --s, e, res);
		  };
}

trampoline(range)(1, 4); // [1,2,3,4]
```

call stack 如下, 蹦床函数堆运行比较安全，虽然运行的比较慢，对比迭代调用和尾递归调用。
![image](https://user-images.githubusercontent.com/32337542/66302033-cb497d00-e92a-11e9-876f-315a641e610d.png)
对比没有用蹦床函数, 堆的大小成线性增加。
![image](https://user-images.githubusercontent.com/32337542/66302150-fa5fee80-e92a-11e9-8ecf-a87b48639221.png)

## Considerations when using recursion? 考虑使用递归

错误的使用递归会有以下问题:

- 如果没有考虑终止条件，那么递归调用会无限循环，从而锁住浏览器
- 如果数据太多，会有栈溢出
- js 使用立即求值，并且 若没有处理递归的优化，那么使用递归会有性能优化问题。

所以调用函数的时候, 使用延迟处理或者有终止条件比较好。

```javascript
// Call ourselves repeatedly until some other async process
// loads our app's local storage we need.
(function waitForLocalStorage(key) {
	if (localStorage.getItem(key)) {
		// do something with loaded data
	} else {
		setTimeout(waitForLocalStorage.bind(null, key), 100);
	}
})("mydata");
```

很多搜索 和排序的算法依赖递归，递归比较好理解和维护。

### Performance comparison 性能对比

通过下面的图可以看到, 直接迭代的 效率最高，如果不考虑性能的话就用这个。
直接递归的性能最差，蹦床的递归 比 尾递归差，但是它不会抛出 RangeError，如果性能不是首选，建议用 蹦床的递归。
babel 转移的代码，使用一个新的函数，并且使用 while 循环, 所以更接近原生的迭代的性能。
![image](https://user-images.githubusercontent.com/32337542/66303328-60e60c00-e92d-11e9-9d3d-63f9658d9ac1.png)

```javascript
"use strict";

function trampoline(fn) {
	return function (/*args*/) {
		var res = fn.apply(this, arguments);
		while (res instanceof Function) {
			res = res();
		}
		return res;
	};
}
// Generate an array of numbers in a given range.
// Tail Recursive implementation
function _rangetr(s, e, res) {
	res = res || [];
	res.push(s);
	return s == e
		? res
		: function () {
				return _rangetr(s < e ? ++s : --s, e, res);
		  };
}

// Generate an array of numbers in a given range.
// Tail Recursive implementation
function rangetr(s, e, res) {
	res = res || [];
	res.push(s);
	return s == e ? res : rangetr(s < e ? ++s : --s, e, res);
}

// Generate an array of numbers in a given range.
// Recursive implementation
function ranger(s, e) {
	var res = [];

	res.push(s);
	return s == e ? res : res.concat(ranger(s < e ? ++s : --s, e));
}

// Generate an array of numbers in a given range.
// Iterative implementation
function range(s, e) {
	var res = [];

	while (s != e) {
		res.push(s);
		s < e ? s++ : s--;
	}
	res.push(s);
	return res;
}

// Babel transpiled tail-call optimization
function rangetr_babel(_x, _x2, _x3) {
	var _again = true;

	_function: while (_again) {
		var s = _x,
			e = _x2,
			res = _x3;
		_again = false;

		res = res || [];
		res.push(s);
		if (s == e) {
			return res;
		} else {
			_x = s < e ? ++s : --s;
			_x2 = e;
			_x3 = res;
			_again = true;
			continue _function;
		}
	}
}
```

## Tail Call Optimization in ES6

重新看下尾递归的函数

```javascript
function range(s, e, res) {
	res = res || [];
	res.push(s);
	return s == e ? res : range(s < e ? ++s : --s, e, res);
}
```

call stack 如下, 这里 js 认识尾调用，并且可以重新使用之前的栈帧来进行递归调用，移除之前任何的本地变量和状态。
![image](https://user-images.githubusercontent.com/32337542/66303871-92aba280-e92e-11e9-9b3e-d4f963f512b9.png)

如果使用 babel 转译, 则它处理尾递归优化 直接使用 自我递归，**其实类似迭代的代码一样执行**, 代码如下:

```javascript
// Generated using Babel 5.x
"use strict";

function range(_x, _x2, _x3) {
	var _again = true;

	_function: while (_again) {
		var s = _x,
			e = _x2,
			res = _x3;
		_again = false;

		res = res || [];
		res.push(s);
		if (s == e) {
			return res;
		} else {
			_x = s < e ? ++s : --s;
			_x2 = e;
			_x3 = res;
			_again = true;
			continue _function;
		}
	}
}
```

这比蹦床函数的性能高，原因是:

- 当前的函数重写了，里面没有嵌套的函数, 让我们的栈的上下文是一个常量
- 代码执行使用了 循环, 更加的高效。而使用 蹦床函数, 由于使用了 thunk, 我们不断的创建和销毁栈帧。

蹦床函数适用于 很大范围的尾递归调用，它更灵活和可维护。但是如果考虑性能, 使用 loop 重写你的代码，或者使用 babel 的转译。

## 总结

- 蹦床函数的性能最好，大数据都考虑用蹦床函数。
- Iterating 迭代 和 babel 转译代码其实差不多, 性能最好，但是若数据比较大，容易锁死浏览器。
- 尾递归在当前的 chrome 浏览器 mac 77.0.3865.90, 还是会有溢出报错。
  **Uncaught RangeError: Maximum call stack size exceeded**

```javascript
"use strict";
function rangetr(s, e, res) {
	"use strict";
	res = res || [];
	res.push(s);
	return s == e ? res : rangetr(s < e ? ++s : --s, e, res);
}
console.log(rangetr(1, 123456));
```
