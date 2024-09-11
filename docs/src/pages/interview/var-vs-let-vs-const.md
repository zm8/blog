# `var` `let` `const` 区别

## 先说结论

- var 声明是全局作用域或函数作用域，而 let 和 const 是块作用域。
- var 变量可以在其范围内更新和重新声明; let 变量可以被更新但不能重新声明; const 变量既不能更新也不能重新声明。
- 它们都被提升到其作用域的顶端。 但是，虽然使用变量 undefined 初始化了 var 变量，但未初始化 let 和 const 变量。
- 尽管可以在不初始化的情况下声明 var 和 let，但是在声明期间必须初始化 const。

## 1. var

1.当在最外层函数的外部声明 var 变量时，作用域是全局的。

2.var 变量可以重新声明和修改。

```js
var greeter = "hey hi";
var greeter = "say Hello instead";
```

由于可以重新声明, 所以会有个问题:

```js
var greeter = "hey hi";
var times = 4;
if (times > 3) {
  var greeter = "say Hello instead";
}
// 修改了外部的 greeter
console.log(greeter); // "say Hello instead"
```

3.var 的变量提升

```js
console.log(greeter);
var greeter = "say hello";
```

被解释成

```js
var greeter;
console.log(greeter); // greeter is undefined
greeter = "say hello";
```

## 2. let

1.let 是块级作用域
块是由 {} 界定的代码块,大括号中有一个块

2.let 可以被修改但是不能被重新声明

```js
let greeting = "say Hi";
let greeting = "say Hello instead"; // error: Identifier 'greeting' has already been declared
```

3.let 的变量提升

- 用 var 声明的变量会被提升到其作用域的顶部，并使用 **undefined** 值对其进行初始化。
- 用 let 声明的变量会被提升到其作用域的顶部，**不会对值进行初始化**。

```js
/*
Uncaught ReferenceError: Cannot access 'foo' before initialization
    at test.html:13
*/
console.log(foo);
let foo;
```

## 3. const

1.const 声明的变量在块级作用域内
2.const 不能被修改并且不能被重新声明

```js
// Uncaught TypeError: Assignment to constant variable.
const a = 1;
a = 2;
```

```js
// Uncaught SyntaxError: Identifier 'a' has already been declared
const a = 1;
const a = 2;
```

3.const 声明期间必须初始化值

```js
// Uncaught SyntaxError: Missing initializer in const declaration
const foo;
console.log(foo);
```

::: 参考地址
<https://chinese.freecodecamp.org/news/javascript-var-let-and-const/>
:::
