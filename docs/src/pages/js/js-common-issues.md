# JS 常见问题解决

## requestIdleCallback

最好传入第 2 个参数的 timeout，防止主线程一直占用而不执行 callback 方法。

```js
requestIdleCallback(
  (deadline) => {
    if (deadline.didTimeout) {
      // 必须执行（兜底逻辑）
    } else {
      // 真正的 idle 执行
    }
  },
  { timeout: 2000 }
);
```

## new Date 兼容性问题

以下环境 的代码会报错

- IOS 11.1.2 iphoneX safari
- IE11

```javascript
var d = new Date("2018-09-20 19:20:32"); // invalid date
alert(d.getTime());
```

必须改成:

```javascript
var d = new Date("2018/09/20 19:20:32");
alert(d.getTime());
```

chrome 浏览器 或者 用 moment.js

```javascript
moment("2018-09-20 10:58").valueOf();
```

## 后端返回的数字过长, 造成精度丢失问题

假设服务端返回数据如下, 可以看到 `JSON.parse` 之后精度有丢失。

```js
const data = '{"id":12345678901234567890,"name":"David"}';
const res = JSON.parse(data); // {id: 12345678901234567000, name: "David"}
```

### 解决方案

1.使用正则将 Long 类型数据转换为字符串

```js
axios({
  method: method,
  url: url,
  data: data,
  transformResponse: [
    function (data) {
      const convertedJsonString = data.replace(/"(\w+)":(\d{15,})/g, '"$1":"$2"');
      // '{"id":12345678901234567890,"name":"David"}' 转化成 '{"id":"12345678901234567890","name":"David"}'
      return JSON.parse(convertedJsonString);
    }
  ]
});
```

2.使用 npm 包 `json-bigint`处理

```js
import JSONbig from "json-bigint";
axios({
  method: method,
  url: url,
  data: data,
  transformResponse: [
    function (data) {
      const JSONbigToString = JSONbig({ storeAsString: true });
      // 将Long类型数据转换为字符串
      return JSONbigToString.parse(data);
    }
  ]
});
```

## try catch

try catch 功能里的 try 里的代码如果是异步的话，在 catch 里捕获不到。

```javascript
try {
  throw new Error("sss");
} catch (e) {
  console.log(11111); // 能执行
}
```

```javascript
try {
  setTimeout(() => {
    throw new Error("sss");
  }, 0);
} catch (e) {
  console.log(11111); // 不能执行
}
```

所以造成 promise 里面的异步回调函数的报错 在 catch 监听不到

```javascript
promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    throw Error("This is an error");
  });
});

promise.catch((error) => {
  console.log(1111); // 不会执行
});
```

## 正则表达式 test exec match 里的问题

正则使用 test 和 exec 多次会返回值不一样的情况，match 不会有问题，原因是 RegExp 有一个 lastIndex 属性来保存索引开始位置，第 1 次调用的 lastIndex 值为 0，第 2 次调用 lastIndex 为 1。
解决方案是:

1. 去掉 g，关闭全局匹配。(但是通常不会关掉)
2. 每次匹配之前将 lastIndex 的值设置为 0。

```javascript
var reg = /1/g;
reg.test("1"); // true
reg.test("1"); // false
reg.exec("1"); // ["1", index: 0, input: "1", groups: undefined]
reg.exec("1"); // null
"1".match(reg); // ["1"]
"1".match(reg); // ["1"]

// 解决方式
reg.lastIndex = 0;
reg.test("1"); // true
reg.lastIndex = 0;
reg.test("1"); // true
```

## 滚动相关

### 1. 获取滚动条的高度

```js
var container = document.querySelector(".container");
var scrollbarHeight = container.scrollHeight - container.clientHeight;
```

### 2. 获取一个元素相对于其父级元素的高度

注意 container 必须设置 `relative` 才可以使用 `offsetTop`, 否则只能使用 `firstChild.getBoundingClientRect().top - container.getBoundingClientRect().top`

```js
var firstElementChild = document.querySelector(".content").firstElementChild;
firstElementChild.offsetTop;
```

### 3. 如果是向下滚动的话

那么最后一个元素是向下滚动 40px, 倒数第 2 个元素是向下滚动 80px;

```js
var lastElementChild = document.querySelector(".content").lastElementChild;
var container = document.querySelector(".container");
container.scrollHeight - lastElementChild.offsetTop;
```

html 代码如下:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>滚动示例</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      .container {
        margin: 100px;
        width: 300px;
        height: 200px;
        overflow-y: scroll;
        border: 10px solid #000;
        position: relative;
      }
      .content {
      }
      .content div {
        height: 40px;
        border: 1px solid red;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="content">
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div>6</div>
        <div>7</div>
        <div>8</div>
        <div>9</div>
        <div>10</div>
      </div>
    </div>
  </body>
</html>
```

## 浏览器原生支持生成 UUID, `window.crypto.randomUUID()`

是一种用于生成随机 UUID（通用唯一标识符）的方法
兼容性表:

- Google Chrome: 支持 (自版本 92 起)
- Mozilla Firefox: 支持 (自版本 95 起)
- Safari: 支持 (自版本 15.4 起)
- Microsoft Edge: 支持 (自版本 92 起)
- Opera: 支持 (自版本 78 起)

```js
window.crypto.randomUUID(); //  '7e96031a-9db8-4f8f-aa6b-e55a8d374764'
```
