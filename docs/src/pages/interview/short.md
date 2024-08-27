# 简短面试题

## 1. 模版字符串

```javascript
function getPersonInfo(one, two, three) {
	console.log(one); // ["", " is ", " years old", raw: ["", " is ", " years old"] ]
	// two 是 Lydia
	console.log(two); // Lydia
	// three 是 21
	console.log(three); // 21
}

var person = "Lydia";
var age = 21;
getPersonInfo`${person} is ${age} years old`;
```

如果使用标记的模板字符串，则第一个参数的值始终是字符串值的数组。 其余参数获取传递到模板字符串中的表达式的值！

## 2. 字符串当作对象的属性

```javascript
const a = {};
const b = { key: "b" };
const c = { key: "c" };

a[b] = 123;
a[c] = 456;

console.log(a[b]); // 输出 456
```

试图将一个对象设置为对象的键值, 那么 这个 key 会转换成 `"[object Object]"`,
所以上面的代码 `a[b]` 就相当于 `a["[object Object]"]`,
`a[c]` 相当于 `a["[object Object]"]`, `a[c]`会覆盖 `a[b]`

## 3. 下面这些值哪些是假值?

```javascript
0;
new Number(0);
("");
(" ");
new Boolean(false);
undefined;
```

只有 `0, '', undefined`;
`JavaScript` 中只有 6 个假值

- undefined
- null
- NaN
- 0
- '' (empty string)
- false

## 4. JavaScript 中的所有内容都是?

- A：原始或对象
- B：函数或对象
- C：技巧问题！只有对象
- D：数字或对象

答案是 A

原始数据类型和基本数据类型一个意思；

JavaScript 中共有 6 种基本数据类型：`Undefined、Null、Boolean、Number、String、Symbol`

对象类型有: `Object 类型、Array 类型、Date 类型、RegExp 类型、Function 类型`

## 5. `[..."Lydia"]` 返回什么?

返回 `["L", "y", "d", "i", "a"]`
