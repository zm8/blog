# ES6-字符串的扩展

## 1. 字符的 Unicode 表示法

ES6 采用 `\uxxxx` 表示一个字符，其中 `xxxx` 表示字符的 Unicode 码点。

```js
"\u0061"; // a
```

但是超过 这个范围的字符, 必须使用两个双字节的形式:

```js
"\uD842\uDFB7"; // 𠮷
```

如果超过了 `0xFFFF`, 那么浏览器可能解析不出来, ES6 对这点做了改进, 将码点放入大括号

```js
"\uD8427"; // 还是返回 \uD8427
"\u20BB7"; // ₻7
"\u{20BB7}"; // 𠮷
```

大括号表示法与四字节的 UTF-16 编码是等价的:

```js
"\u{1F680}" === "\uD83D\uDE80";
```

字母 'z' 的 ASCII 值是 122, 它有几种表示方式

```js
String.fromCharCode(122); // z
"z".charCodeAt(); // 122
"z" === "z";
"\172" === "z"; // 八进制表示 8*8 + 7 * 8 + 2 === 122
"\x7A" === "z"; // 十六进制表示 7 * 16 + 10 === 122
"\u007A" === "z"; // unicode 表示
"\u{7A}" === "z"; // unicode 大括号表示法
```

ASCII 码地址:
<https://tool.oschina.net/commons?type=4>

## 2. 字符串的遍历器接口

使用 `for...of` 遍历, 它可以识别大于 `0xFFFF`的码点,
而传统的 for 循环不太行

```js
var str = "abc";
for (const item of str) {
  console.log(item);
}
```

```js
let text = String.fromCodePoint(0x20bb7);

for (let i = 0; i < text.length; i++) {
  console.log(text[i]);
}
// "�"
// "�"

for (let i of text) {
  console.log(i);
}
```

### 3. 直接输入 U+2028 和 U+2029

JavaScript 规定有 5 个字符, 不能直接在字符串里面使用:

- U+005C：反斜杠（reverse solidus)
- U+000D：回车（carriage return）
- U+2028：行分隔符（line separator）
- U+2029：段分隔符（paragraph separator）
- U+000A：换行符（line feed）

```js
"我\u005C"; // '我\'
"我\u000D"; // '我\r'
"我\u2028"; // '我'
"我\u2028" === "我"; // false
("我\u2029"); // '我'
("我\u000A"); // '我\n'
eval("function\u2028f(){ console.log(1);} f();"); // 1
```

在 JavaScript 中，分隔符不被解析，主要用来分隔各种记号，如标识符、关键字、直接量等信息。 在 JavaScript 脚本中，常用分隔符来格式化代码，以方便阅读。
参考: <http://c.biancheng.net/view/5369.html>

由于 JSON 的字符串允许使用 U+2028（行分隔符）和 U+2029（段分隔符），但是用 `JSON.parse` 解析的时候, 有可能报错;

```js
const json = '"\u2028"';
JSON.parse(json); // 可能报错
```

ES2019 允许 JavaScript 字符串直接输入 U+2028（行分隔符）和 U+2029（段分隔符）。
这样 `JSON.parse(json);` 就不会报错了。

### 4. JSON.stringify() 的改造

UTF-8 标准规定，`0xD800`到`0xDFFF`之间的码点，不能单独使用。
必须配对使用, `\uD834\uDF06`是两个码点放在一起代表 `𝌆`,
单独使用`\uD834`和`\uDF06`这两个码点是不合法的
所以 `JSON.stringify('\uD834')` 返回单个码点就不合法。

但是目前 Chrome 95 对于这个处理倒是不会报错:

```js
JSON.stringify("\u{D834}"); // '"\ud834"'
JSON.parse(JSON.stringify("\u{D834}")); // '\uD834'
```

### 5.模板字符串

模板字符串 也可以定义多行文本

```js
// 多行字符串
`In JavaScript this is
 not legal.`;
```

如果在模板字符串中需要使用反引号，则前面要用反斜杠转义。

```js
let greeting = `\`Yo\` World!`;
```

如果使用模板字符串表示多行字符串，所有的空格和缩进都会被保留在输出之中。
如果你不想要这个换行，可以使用 `trim` 方法消除它

```js
`
<ul>
  <li>first</li>
  <li>second</li>
</ul>
`.trim();
```

模版字符串里面可以进行运算，也可以调用函数:

```js
let obj = { x: 1, y: 2 };
`${obj.x + obj.y}`;

const fn = () => "Hello World";
`${fn()}`;
```

由于模板字符串的大括号内部，就是执行 JavaScript 代码，因此如果大括号内部是一个字符串，将会原样输出。

````js
```${"Hello"}```;
````

模版字符串还可以嵌套:

```js
`${`${"Hello"}`}`; // 'Hello'

const tmpl = (addrs) => `
  <table>
  ${addrs
    .map(
      (addr) => `
    <tr><td>${addr.first}</td></tr>
    <tr><td>${addr.last}</td></tr>
  `
    )
    .join("")}
  </table>
`;

// 返回
const data = [
  { first: "<Jane>", last: "Bond" },
  { first: "Lars", last: "<Croft>" }
];

console.log(tmpl(data));
// <table>
//
//   <tr><td><Jane></td></tr>
//   <tr><td>Bond</td></tr>
//
//   <tr><td>Lars</td></tr>
//   <tr><td><Croft></td></tr>
//
// </table>
```

### 6. 实例：模板编译

通过模板字符串，生成正式模板的实例。

```js
let template = `
  <ul>
    <% for(let i=0; i < data.supplies.length; i++) { %>
      <li><%= data.supplies[i] %></li>
    <% } %>
  </ul>
`;
```

思路是将其转换为 JavaScript 表达式字符串。

```js
echo("<ul>");
for (let i = 0; i < data.supplies.length; i++) {
  echo("<li>");
  echo(data.supplies[i]);
  echo("</li>");
}
echo("</ul>");
```

相当于可执行的代码如下:

```js
function compile(data) {
  let html = "";
  function echo(str) {
    html += str;
  }
  echo("<ul>");
  for (let i = 0; i < data.supplies.length; i++) {
    echo("<li>");
    echo(data.supplies[i]);
    echo("</li>");
  }
  echo("</ul>");
  return html;
}
div.innerHTML = compile({ supplies: ["broom", "mop", "cleaner"] });
```

解决思路:
要能变成这个`echo('<ul>');`, 需要在 `<ul>` 前面新增加 `echo('`, 而 `<ul>` 的结束标志是 `<%`

1.第一步

```js
let template = "";
template += "echo(";
```

2.第二步

```js
const evalExpr = /<%=(.+?)%>/g;
template = template.replace(evalExpr, "`); \n  echo( $1 ); \n  echo(`");
console.log(template);
```

就会把:

```html
<li><%= data.supplies[i] %></li>
```

转换成:

```html
<li>`); echo( data.supplies[i] ); echo(`</li>
```

3.第三步

```js
const expr = /<%([\s\S]+?)%>/g;
template = template.replace(expr, "`); \n $1 \n  echo(`");
```

会把

```
<% for(let i=0; i < data.supplies.length; i++) { %>
```

转换成:

```
`);
for(let i=0; i < data.supplies.length; i++) {
echo(`
```

会把:

```
<% } %>
```

转换成:

```
`);
}
echo(`
```

最终把三步联合起来，封装成 compile 函数

```js
function compile(template) {
  const evalExpr = /<%=(.+?)%>/g;
  const expr = /<%([\s\S]+?)%>/g;

  template = template
    .replace(evalExpr, "`); \n  echo( $1 ); \n  echo(`")
    .replace(expr, "`); \n $1 \n  echo(`");

  template = "echo(`" + template + "`);";

  let script = `(function parse(data){
    let output = "";

    function echo(html){
      output += html;
    }

    ${template}

    return output;
  })`;

  return script;
}
let parse = eval(compile(template));
div.innerHTML = parse({ supplies: ["broom", "mop", "cleaner"] });
```

### 7.标签模板

模板字符串 可以 跟在一个函数后面, 该函数将被调用来处理这个模板字符串。
这被称为“标签模板”功能（tagged template）。

```js
alert`hello`;
// 等同于
alert(["hello"]);
```

下面的代码 arg1 相当于 `['', '']`, arg2 相当于 10

```js
var hello = "hello";

function tag(arg1, arg2) {
  console.log(arg1);
  console.log(arg2);
}

tag`${hello}`;
```

复杂点的例子:

```
let a = 5;
let b = 10;

tag`Hello ${ a + b } world ${ a * b }`;
```

则参数列表如下:

- 第一个参数 ```['Hello ', ' world ', '']
- 第二个参数 15
- 第三个参数 50

模版函数的第 1 个参数(模板字符串数组)总是比第 2 个参数，长度多 1;
所以可以以第 1 个参数的长度来遍历，写出如下的代码:

```js
let total = 30;
let msg = passthru`The total is ${total} (${total * 1.05} with tax)`;
function passthru(literals, ...values) {
  let output = "";
  for (let index = 0; index < literals.length; index++) {
    output += literals[index] + (values[index] ?? "");
  }
  return output;
}
console.log(msg);
```

“标签模板”的一个重要应用，就是过滤 HTML 字符串，防止用户输入恶意内容。

```js
const safeStr = (str = "") =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

let sender = '<script>alert("abc")</script>';
let message = SaferHTML`<p>${sender} has sent you a message.</p>`;
function SaferHTML(literals, ...values) {
  let output = "";
  for (let index = 0; index < literals.length; index++) {
    // 由于 literals比values 长度长, 而values 的值的最后一个是 undefined
    output += literals[index] + safeStr(values[index] ?? "");
  }
  return output;
}
console.log(message);
```

模板字符串数组 有个 ``raw``` 属性, 会将字符串里面的值转换:

```js
tag`First line\nSecond line`;

function tag(strings) {
  console.log(strings.raw[0]);
  // strings.raw[0] 为 "First line\\nSecond line"
  // 打印输出 "First line\nSecond line"
}
```

### 8.模板字符串的限制

ES2018 放松了对标签模板里面的字符串转义的限制。如果遇到不合法的字符串转义，就返回 undefined，而不是报错。

```js
var str ='\unicode'; // 报错  Uncaught SyntaxError: Invalid Unicode escape sequence
```

返回 undefined, 并且 raw 属性能拿到原始的字符串, 还可以对原始的字符串进行处理;

```js
function tag(strings) {
  console.log(strings[0]); // undefined
  console.log(strings.raw[0]); // \unicode
}
tag`\unicode`;
```

::: 参考地址
<https://es6.ruanyifeng.com/#docs/string#%E6%A8%A1%E6%9D%BF%E5%AD%97%E7%AC%A6%E4%B8%B2>
:::
