# ES6 继承原理 和 Object.create

## ES6 继承

ES6 原始继承代码如下:

```javascript
class Parent {
  static NAME_P = "NAME_P";
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  outParent() {
    return "outParent";
  }
}

class Child extends Parent {
  static NAME_C = "NAME_C";
  constructor(x, y, color) {
    super(x, y);
    this.color = color;
  }
  outChild() {
    return "outChild";
  }
}
```

babel 转换成 ES5 代码，简单版如下:

```javascript
function _inherits(subClass, superClass) {
  // 继承了prototype
  subClass.prototype.__proto__ = superClass.prototype;
  // 继承了 函数静态属性
  subClass.__proto__ = superClass;
}

var Parent = function (x, y) {
  this.x = x;
  this.y = y;
};
Parent.prototype.outParent = function () {
  return "outParent";
};
Parent.NAME_P = "NAME_P";

var Child = (function (_Parent) {
  _inherits(Child, _Parent);

  function Child(x, y, color) {
    // Child.__proto__ 其实就是 Parent
    Child.__proto__.call(this, x, y);
    this.color = color;
  }
  Child.prototype.outChild = function () {
    return "outChild";
  };
  return Child;
})(Parent);
Child.NAME_C = "NAME_C";

console.log(Child.NAME_C); // NAME_C
console.log(Child.NAME_P); // NAME_P
var obj = new Child(1, 2, "red");
console.log(obj.color); // red
console.log(obj.outChild()); // outChild
console.log(obj.outParent()); // outParent
```

如何继承呢:

- 实例属性的继承使用了 `Parent.__proto__.call(this, x, y);`
- 原型的继承使用了 `subClass.prototype.__proto__ = superClass.prototype;`
- 静态属性的继承使用了 `subClass.__proto__ = superClass;`

## Object.create(proto[, propertiesObject])

新创建了一个对象 A, 并且让 A 的隐式原型指向 proto

1. 先看一个例子, Object.create 到底做了什么?

```javascript
var o = {
  a: 1,
  f: function () {
    console.log(this.a);
  }
};

var o2 = Object.create(o);
```

o2 到底是什么呢, 控制台展开可以看到如下:
![image](https://user-images.githubusercontent.com/32337542/67998065-e7bea800-fc91-11e9-9587-8c5c4905284f.png)

所以相当于执行了
`o2.__proto__.a = o.a; o2.__proto__.f = o.f`, 也就是 `o2.__proto__ = o;`

2. 所以它和 `__proto__` 关系如下:

```javascript
var obj = {};
var obj2 = Object.create(obj);
// 等价于
var obj2 = {};
obj2.__protp__ = obj;
```

3. 那么 Object.create 等价于:

```javascript
Object.create = function(obj) {
  var o = {};
  // 或 Object.setPrototypeOf(o, obj);
  o.__proto__ = obj;
  reutrn o;
};

// 或者 ES5 写法
Object.create = function(obj) {
  function F() {}
  F.prototype = obj;
  return new F();
};
```

4. 正常的 object 对象的 `__proto__` 到底等于什么呢?

```javascript
var o = {};
o.__proto__ === Object.prototype; // true
```

5. 特别的, 如果不想继承任何属性(比如 toString) 的对象, 可以将 Object.create 对象参数设置为 null。
   `var o = Object.create(null);`

## Object.create 的第二个参数

默认为 undefined, 定义新创建对象的属性, 定义的方式类似 `Object. defineProperties`

```javascript
var o = { a: 1 };
var o2 = Object.create(o, {
  b: {
    writable: true,
    configurable: true,
    value: "Hello"
  }
});

console.log(o2.a); // 1
console.log(o2.__proto__.a); // 1
console.log(o2.b); // Hello
console.log(o2.__proto__.b); // undefined, 说明是定义在自身上的属性
```

第 2 个属性相当于:

```javascript
Object.defineProperties(o2, {
  b: {
    writable: true,
    configurable: true,
    value: "Hello"
  }
});

// 或
Object.defineProperty(o2, "b", {
  writable: true,
  configurable: true,
  value: "Hello"
});
```
