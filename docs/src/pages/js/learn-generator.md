# Generator 学习

## 1. The Basics Of ES6 Generators

函数里用 yield 关键字来暂停函数运行。外部没有任何东西可以暂停它。所以当它暂停了，必须有外部控制来重新启动它。
通常一个函数，你刚开始传递参数进去，然后 用 return 来返回。而 Generator 函数，通过 yield 传递消息出去，每次启动的时候传递消息进去，传递的值是 yield 表达式的结果。

## Generator 返回的是一个迭代器

```js
function* foo() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
}
var it = foo();
```

## yeild 调用

由于第 1 次调用 `it.next(5)` 时，因为并没有 yeild 表达式接收 5 这个值，都没有 yeild 执行过。
所以只能初始化 `foo(5)`, 传递值 5 进去给 x。

```js
function* foo(x) {
  var y = 2 * (yield x + 1);
  var z = yield y / 3;
  return x + y + z;
}

var it = foo(5);

// note: not sending anything into `next()` here
console.log(it.next()); // { value:6, done:false }
console.log(it.next(12)); // { value:8, done:false }
console.log(it.next(13)); // { value:42, done:true }
```

## for..of

ES6 也可以用 `for..of` 来迭代 `generator`, 但是注意下面的例子, return 返回的值并不能被迭代出, 所以 `generator` 里不建议用 `return`;
另外一个角度理解, 函数的最后 `return undefined`

```js
function* foo() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
  return 6;
}

for (var v of foo()) {
  console.log(v);
}
// 1 2 3 4 5

console.log(v); // still `5`, not `6`
```

## 2. Diving Deeper With ES6 Generators

如何往 Generator 里面抛入一个异常;
注意抛进去的异常, 并不是赋值给了 x, 而是给了 catch 里的 err。

```js
function* foo() {
  try {
    var x = yield 3;
    console.log("x: " + x); // may never get here!
  } catch (err) {
    console.log("Error: " + err);
  }
}
var it = foo();
var res = it.next(); // { value:3, done:false }
it.throw("Oops!"); // Error: Oops!
```

如果你往 Generator 里面抛异常, Generator 没有用 `try...catch` 捕获异常的话，异常就会抛出来，可以在外面捕获这个异常

```js
function* foo() {
  var x = yield 3;
  console.log("x: " + x); // may never get here!
}
var it = foo();
var res = it.next(); // { value:3, done:false }
try {
  it.throw("Oops!");
} catch (e) {
  console.log("Error: " + e); // Error: Oops!
}
```

或者

```js
function* foo() {
  var x = yield 3;
  var y = x.toUpperCase(); // could be a TypeError error!
  yield y;
}

var it = foo();

it.next(); // { value:3, done:false }

try {
  it.next(42); // `42` won't have `toUpperCase()`
} catch (err) {
  console.log(err); // TypeError (from `toUpperCase()` call)
}
```

这个就相当于普通函数如果有异常，在外面其实也可以捕获:

```js
function f1() {
  console.log(aaaa);
}
try {
  f1();
} catch (e) {
  console.log(e); // 'ReferenceError: a is not defined'
}
```

## 3. Delegating Generators

如何在 generator 内部去调用另外一个 generator, 通过 `yield *`
当代码遇到 `yield*`, 会去实例化 foo(), 所以实际上是 yielding/delegating 另外一个 generator。
当 `*foo()` 结束，控制权转回原来的 generator;

```js
function* foo() {
  yield 3;
  yield 4;
}

function* bar() {
  yield 1;
  yield 2;
  yield* foo(); // `yield *` delegates iteration control to `foo()`
  yield 5;
}

for (var v of bar()) {
  console.log(v);
}
// 1 2 3 4 5
```

如果不用 `for..of`, 正常的使用 `next(..)`, 看下下面的例子

```js
function* foo() {
  var z = yield 3;
  var w = yield 4;
  console.log("z: " + z + ", w: " + w);
}

function* bar() {
  var x = yield 1;
  var y = yield 2;
  yield* foo(); // 相当于 var ffff = foo(); ffff.next();
  var v = yield 5;
  console.log("x: " + x + ", y: " + y + ", v: " + v);
}

var it = bar();

it.next(); // { value:1, done:false }
it.next("X"); // { value:2, done:false }
it.next("Y"); // { value:3, done:false }
it.next("Z"); // { value:4, done:false }
it.next("W"); // { value:5, done:false }
// z: Z, w: W

it.next("V"); // { value:undefined, done:true }
// x: X, y: Y, v: V
```

另外一个情况是 `yield*` 可以接收从委托的 `generator` 里的 `return` 的值,
注意并没有输出 `{ value:'foo', done:false }`

```js
function* foo() {
  yield 2;
  yield 3;
  return "foo"; // return value back to `yield*` expression
}

function* bar() {
  yield 1;
  var v = yield* foo();
  console.log("v: " + v);
  yield 4;
}

var it = bar();

it.next(); // { value:1, done:false }
it.next(); // { value:2, done:false }
it.next(); // { value:3, done:false }
it.next(); // "v: foo"   { value:4, done:false }
it.next(); // { value:undefined, done:true }
```

但是如果只迭代有 `return` 值的 foo, 则可以迭代出 `{ value:'foo', done:false }`
**如果没有 `return "foo"`, 可以理解函数最后有一个 return undefined;**

```js
function* foo() {
  yield 1;
  yield 2;
  return "foo"; // return value back to `yield*` expression
}
var it = foo();
it.next(); // { value:1, done:false }
it.next(); // { value:2, done:false }
it.next(); // { value:'foo', done:true }
```

委托如果遇到报错, 是怎么传递的, 看下面的例子。
`foo` 里面的报错在 `bar` 里接收了。
注意下面的代码, `it.throw( "Uh oh!" )` 会跳到了下一个 `yield;`

```js
function* foo() {
  try {
    yield 2;
  } catch (err) {
    console.log("foo caught: " + err);
  }

  yield; // pause

  // now, throw another error
  throw "Oops!";
}

function* bar() {
  yield 1;
  try {
    yield* foo();
  } catch (err) {
    console.log("bar caught: " + err);
  }
}
var it = bar();
it.next(); // {value: 1, done: false}
it.next(); // {value: 2, done: false}
it.throw("Uh oh!"); // foo caught: Uh oh!, {value: undefined, done: false}
it.next(); // bar caught: Oops! {value: undefined, done: true}
```

## 4.一些例子

```js
function* bar() {
  yield 1;
  try {
    console.log(a);
    yield 2;
  } catch (err) {
    console.log("bar caught: " + err);
  }
}
var it = bar();
it.next(); // {value: 1, done: false}
/*
  到不了 yiled 2;
  bar caught: ReferenceError: a is not defined;
  {value: undefined, done: true};
*/
it.next(2);
```

## 5.总结

`yield*` 允许你委托迭代控制从当前的 generator 到另外一个 generator,
`yield*` 扮演一个传递的角色, 可以同时传递信息和报错。

throw 的例子, **下面的 2 个例子是等价的**
所以 `it.throw('xxx')` 的时候可以大概理解成 `it.next(throw 'xxx')`;

例子 1:

```js
function* bar() {
  yield 1;
  try {
    yield 2;
  } catch (err) {
    console.log("bar caught: " + err);
  }
}
var it = bar();
it.next(); // {value: 1, done: false}
it.next(); // {value: 2, done: false}
it.throw("aaa"); // bar caught: aaa; {value: undefined, done: false}
```

例子 2:

```js
function* bar() {
  yield 1;
  try {
    yield 2;
    throw "aaa";
  } catch (err) {
    console.log("bar caught: " + err);
  }
}
var it = bar();
it.next(); // {value: 1, done: false}
it.next(); // {value: 2, done: false}
it.next(); // bar caught: aaa; {value: undefined, done: false}
```

## 6. Going Async With ES6 Generators

## Simplest Async

通过 request 里面调用 `it.next` 来进行下一步。yeild 不用关心 request 里面是怎么拿最新的 data 的。
注意 makeAjaxCall 里的代码不能立即执行 callback, 否则有个错误,
因为 generator 从技术上来说还没有在停止的状态，因为在那个时刻 generator 还在运行当中，yeild 还没有处理。

```js
var id = 1;
function makeAjaxCall(url, callback) {
  setTimeout(() => {
    callback(
      JSON.stringify({
        value: url,
        id: id++
      })
    );
  }, 1000);
}

function request(url) {
  makeAjaxCall(url, function (response) {
    it.next(response);
  });
}

function* main() {
  var result1 = yield request("http://some.url.1");
  var data = JSON.parse(result1);

  var result2 = yield request("http://some.url.2?id=" + data.id);
  var resp = JSON.parse(result2);
  console.log("The value you asked for: " + resp.value);
}

var it = main();
it.next();
```

例子 2 也就是说 yield 里面的函数不能立刻执行 `it.next`

```js
function doNext() {
  it.next();
}
function* foo() {
  var res = yield doNext();
  console.log(res);
  res = yield 2;
  console.log(res);
  res = yield 3;
  console.log(res);
}
var it = foo();
it.next();
```

## Better Async

目前异步的问题有 3 个:
1: 对于异常的处理不清晰。虽然我们能用 `it.throw` 来处理异常, 然后用 `try..catch` 来捕获异常,
但是如果我们做很多的 generators, 代码不太好用。

2: `makeAjaxCall(..)` 的问题是不受我们控制，如果 callback 执行多次，或者 成功和失败同时执行。那么我们的 generator 就会失控

3: 如何触发多个任务在一个 `generator yeild` 里面。

如何解决这个问题，通过 `yeild out promise`, 通过定义一个 `runGenerator` 方法。

```js
function request(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(url);
    }, 2000);
  });
}

runGenerator(function* main() {
  var result1 = yield request("http://some.url.1");
  console.log("result1=" + result1);
  var result2 = yield request("http://some.url.2?id=");
  console.log("result2=" + result2);
  var r3 = yield 2;
  console.log(r3);
});

function runGenerator(ge) {
  let it = ge();
  const loop = (data) => {
    let p = it.next(data);
    if (p.done) {
      return;
    }
    if (p.value.then) {
      p.value.then(loop);
    } else {
      /*
  这里其实不用 setTimeout 也不会报错,
  但是为了跟上面的 promise.then 一样是异步的, 所以加了个 setTimeout
 */
      setTimeout(() => {
        loop(p.value);
      });
    }
  };
  loop();
}
```
