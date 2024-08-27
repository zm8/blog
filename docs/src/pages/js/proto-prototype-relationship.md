# `__proto__`和`prototype`的区别和关系

### 1. 先来个总结

1. `__proto__`是每个对象都有的一个属性。
   js 里 万物皆对象，所以都有 `__proto__` 属性。

2. `prototype` 是函数才会有的属性。
   并不是所有函数都有 `prototype`:

- 比如内置函数 `Math.pow` 就没有
- `(function(){}).bind({}).prototype` 也没有

### 2. 梳理下

1. `prototype` 是显示原型
   每个函数在创建的时候都有一个 `prototype` 属性，这个属性是一个指针，指向一个对象，而这个对象的用途是包含所有实例共享的属性和方法。

2. `__proto__` 是隐式原型
   JavaScript 中任意对象都有一个内置属性 `[[prototype]]`，在 ES5 之前不能访问这个内置属性，ES5 中可通过 `Object.getPrototypeOf()` 获取.

### 3. 如何快速知道`obj`的`proto`是什么?

1. 若 obj 有 prototype 属性, 比如 `Function, Object, Array, function f(){}`, 则说明它是个函数，它的`__proto__`是 `Function.prototype`。

2. 若 obj 没有 `prototype`，则它的 `__proto__` 有 2 种可能。

- 若能找得到实例化它的构造函数，比如 `function f(){}; var obj = new fn;` 则 `obj.__proto__ === fn.prototype`

- 若不能，则一般是 `Object.prototype`。 `Object.prototype` 是所有对象的顶级的 `__proto__`。 另外 `Object.prototype.__proto__ === null`。

### 4. 二者的关系：

根据 ECMA 定义 `to the value of its constructor’s "prototype"`, 所以 `__proto__` 指向创建这个对象的构造函数的原型。

### 5. 例子说明

```javascript
var o = {};
var n = 1;
var f = function () {};
// 它们只是创建对象的一个语法糖, 实际是
var o = new Object();
var n = new Number();
var f = new Function();
```

所以:

```javascript
o.__proto__ === Object.prototype;
f.__proto__ === Function.prototype;
n.__proto__ === Number.prototype;
```

`Object`, `Function`, `Number` 都是函数，因为它们有 `prototype` 属性, 所以

```javascript
Object.__proto__ === Function.prototype;
Function.__proto__ === Function.prototype;
Number.__proto__ === Function.prototype;
```

`Object.prototype`, `Function.prototype`, `Number.prototype` 都是对象, 所以

```javascript
Function.prototype.__proto__ === Object.prototype;
Number.prototype.__proto__ === Object.prototype;
Object.prototype.__proto__ === null; // 特殊
```

### 6. 关系如下图

![image](https://user-images.githubusercontent.com/32337542/55555690-724d2200-5718-11e9-96ec-2aeb6b5d2f71.png)
