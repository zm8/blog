# Generator 代码执行的理解

请先看代码：

```javascript
function f1() {
  console.log("f1");
  return 1;
}
function f2() {
  console.log("f2");
  return 2;
}
function* g() {
  var v1 = yield f1();
  console.log(v1);
  var v2 = yield f2();
  console.log(v2);
  return 3;
}
var h = g();
console.log(h.next()); // f1; { value: 1, done: false}
console.log(h.next(2)); // 2; f2; {value: 2, done: false}
console.log(h.next()); // undefined; {value: 3, done: true}
console.log(h.next()); // {value: undefined, done: true}
```

通过以上的结果 和 babel 转义发现:

- `var v1 = yield f1();` 里的 `v1` 和 `yield f1()`- 根本一点关系都没有

- `yield` 后面的东东为每次 `next()` 的返回值里的 `value` 的值

- `v1` 的值是第 2 次 `next` 传递进来的值, 并且第 2 次执行的时候发生了 3 件事：

  - 赋值 `v1`;
  - `console.log(v1);`
  - `f2();`

- 第 3 次的`next`, 由于没有传递值，所以`console.log`值为`undefined`, 返回的`value`的值为`return`的值

- 第 4 次的`next`和以后的`next`, 始终是`{value: undefined, done: true}`

babel 转义如下：

```javascript
var _marked = /*#__PURE__*/ regeneratorRuntime.mark(g);

function f1() {
  console.log("f1");
  return 1;
}
function f2() {
  console.log("f2");
  return 2;
}
function g() {
  var v1, v2;
  return regeneratorRuntime.wrap(
    function g$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            _context.next = 2;
            return f1();

          case 2:
            v1 = _context.sent;

            console.log(v1);
            _context.next = 6;
            return f2();

          case 6:
            v2 = _context.sent;

            console.log(v2);
            return _context.abrupt("return", 3);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    },
    _marked,
    this
  );
}
```
