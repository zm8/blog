# 学习 Object.defineProperty

## 导读

继承原理里面大量使用了, `Object.defineProperty` 和 `Object.create`, 所以有必要先分析下这 2 个方法。

## Object.defineProperty(obj, prop, descriptor)

它的属性描述符有 2 种形式: **数据描述符**和**存取描述符**

- 数据描述符: configurable, enumerable, value, writable
- 存取描述符: get 和 set

### 1. value

该属性对应的值, 默认为 undefined。

```javascript
var obj = {};
Object.defineProperty(obj, "a", {
  value: 1
});
console.log(obj.a); // 1
```

### 2. enumerable

是否可以枚举, 默认为 false。
由于默认是 false, 所以下面 2 种写法是等价。

```javascript
Object.defineProperty(obj, "a", {
  enumerable: false
});
// 等价
Object.defineProperty(obj, "a", {});
```

举例用法:

```javascript
var obj = {};
Object.defineProperty(obj, "a", {
  enumerable: false,
  value: 1
});
for (let n in obj) {
  console.log(n); // 输出不了 n
}
```

**但是可以枚举自身之前有设置的属性!**

```javascript
var obj = { a: 1 };

Object.defineProperty(obj, "b", {
  enumerable: false,
  value: 3
});

// 可以枚举 a, 不能枚举 b
for (let key in obj) {
  console.log("key", key);
}
console.log(obj.a); // 3
```

### 3. configurable

对象的 **描述符** 是否可以修改或者增加。同时该属性是否能删除。
默认为: false。

```javascript
var obj = {};
Object.defineProperty(obj, "a", {
  configurable: false,
  value: 1
});

// 这里报错: TypeError: Cannot redefine property: a
Object.defineProperty(obj, "a", {
  value: 2
});

// TypeError: Cannot delete property 'a' of #<Object>
delete obj.a;

console.log(obj.a);
```

注意 这里是**描述符**是否可以修改, 所以下面的例子不属于描述符的情况:

```javascript
var obj = {};
Object.defineProperty(obj, "a", {
  configurable: false,
  writable: true,
  value: 1
});
obj.a = 222;
console.log(obj.a); // 222
```

### 4. writable

它的 value 是否能被赋值运算符改变
注意它少了一个 e, 不是 `writeable`
默认为 false

```javascript
var obj = {};
Object.defineProperty(obj, "a", {
  writable: false
});
// 由于默认是 false, 所以等价
// Object.defineProperty(obj, "a", {
// });

// TypeError: Cannot assign to read only property 'a' of object '#<Object>'
obj.a = 1;
console.log(obj.a);
```

### 5. get

读取 "**属性前**" 会执行的函数。没有参数传入, 但是会传入 this 对象。

- 注意 writable 不能和 get 或者 set 一起搭配, value 也不能和 get 或者 set 一起搭配
  否则会抛出错误:
  `TypeError: Invalid property descriptor. Cannot both specify accessors and a value or writable attribute, #<Object>`

1. get 里面不能读 this.a, 否则会死循环, 例子如下:

```javascript
var obj = { a: 1 };
Object.defineProperty(obj, "a", {
  get: function () {
    // 不能写 console.log(this.a)
    console.log("get");
    return 3;
  }
});
console.log(obj.a);

// get
// 3
```

2. 巧妙的例子, 如何让 a 同时满足几个不同的条件,
   注意下面的代码不能 `return this.a+1;`, 这样会 **死循环**, 因为不断的取 this.a 的值,
   所以只能借助外部的变量 `i`。

```javascript
var i = 0;
var obj = {};
Object.defineProperty(obj, "a", {
  get() {
    return [1, 2, 3][i++];
  }
});

if (obj.a === 1 && obj.a === 2 && obj.a === 3) {
  console.log("done");
}
```

3. 巧妙的例子, 任何 对象读取同一个属性, 返回自己

```javascript
var obj = { a: 1 };
var obj2 = { b: 1 };
var s = Symbol();
Object.defineProperty(Object.prototype, s, {
  get() {
    return this;
  }
});

console.log(obj[s]); // {a: 1}
console.log(obj2[s]); // {b: 1}
```

4. 特殊的只有一个 get 时, 不能赋值

```javascript
var obj = { a: 1 };
Object.defineProperty(obj, "a", {
  get() {}
});
// TypeError: Cannot set property a of #<Object> which has only a getter
obj.a = 4;
```

### 6.set

当属性值修改时，触发执行该方法。该方法将接受唯一参数，即该属性新的参数值。

- set 的里的 `return 语句` 没有意义
- 若只有 set, 没有 get, 那么取值的时候, 永远返回 undefined
  如下例子, obj.a 永远为 undefined, 赋值不上。

```javascript
var obj = {};
Object.defineProperty(obj, "a", {
  set(v) {
    console.log("set", v);
  }
});

obj.a = 4; // set 4
console.log("obj.a", obj.a); // obj.a undefined
```

## getter 和 setter 其它的声明方式

1. 注意写法

```javascript
var obj = {
  get a() {
  },
};

// 以下的写法错误
var obj = {
  get a: function() {

  }
}
```

2. 和 Object.defineProperty 的区别
   Object.defineProperty 可以后面定义, **get 和 set 只能在声明的对象的时候定义**。

```javascript
var obj = {
  get a() {
    console.log("get");
    return 1;
  },
  set a(val) {
    console.log("set", val);
  }
};

obj.a = 2; // 输出 set 2
console.log(obj.a); // get 1
```

等价于

```javascript
var obj = {};

Object.defineProperty(obj, "a", {
  get() {
    console.log("get");
    return 1;
  },
  set(val) {
    console.log("set", val);
  }
});

obj.a = 2; // 输出 set 2
console.log(obj.a); // get 1
```
