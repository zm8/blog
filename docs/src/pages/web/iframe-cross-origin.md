# Iframe 跨于问题总结

## 导读

非跨域的情况必须是: 协议，子域名，主域名，端口都一样，才不是跨域。
![image](https://user-images.githubusercontent.com/32337542/76500403-75e63e80-647b-11ea-97be-7afa5a9b1480.png)

跨域虽然不能访问里面的变量, 但是却可以通过下面的方式操作 iframe 的 src 跳转。

```js
var ifr = document.getElementById("ifr");
ifr.contentWindow.location = "https://www.baidu.com";
```

## 非跨域的如何访问

1. 使用 `browser-sync --port=80` 创建本地服务

2. 父访问子
   父通过 `contentWindow` 访问子域 window, 通过 `contentDocument` 访问子域 document

```html
// parent.html
<iframe src="/child.html" id="ifr"></iframe>
<script>
	var ifr = document.getElementById("ifr");
	// 必须load 完才能获取到里面的变量
	ifr.addEventListener("load", () => {
		console.log(ifr.contentWindow.child);
	});
</script>

// child.html
<script>
	var child = 1;
</script>
```

3. 子访问父
   直接通过访问 `window.parent`, 或 `window.top`

```html
// parent.html
<iframe src="/child.html" id="ifr"></iframe>
<script>
	window.pppp = 1;
</script>

// child.html
<script>
	alert(window.parent.pppp);
	alert(window.top.pppp);
</script>
```

## 跨域的解决方式

### 前置配置

1. 配置 host

```
localhost.meetsocial.cn  127.0.0.1
david.meetsocial.cn  127.0.0.1
```

### 一、 通过 jsonp 跨域

原理就是 js 注入可以跨域。
html 页面

```html
<script src="http://localhost:8888/?a=1&b=2&callback=fn"></script>
<script>
	function fn(obj) {
		console.log(obj); // obj 是个对象 => {"a":1,"b":2,"callback":"fn"}
	}
</script>
```

nodejs

```javascript
var http = require("http");
var server = http.createServer();
let url = require("url");

server.on("request", function (req, res) {
	let obj = url.parse(req.url, true);
	// query 获取? 后面的参数
	let query = obj.query;
	var fn = query.callback;
	res.writeHead(200, {
		"Content-Type": "application/javascript; charset=utf-8",
	});
	res.write(fn + "(" + JSON.stringify(query) + ")");
	res.end();
});

server.listen("8888");
console.log("Server is running at port 8888...");
```

### 二、 document.domain + iframe 跨域

#### 1. 条件

**` document.domain` 解决跨域的条件是, 协议必须相同**。
要么 http 跨域 http, 要么 https 跨域 https, 而不能 http 跨域 https, https 跨域 http。

http 跨域 https, 虽然设置了 `document.domain` , 还是报错

:::tip Error
Uncaught DOMException: Blocked a frame with origin "http://localhost.meetsocial.cn" from accessing a cross-origin frame.
at HTMLIFrameElement. (http://localhost.meetsocial.cn/:22:43)
:::

https 跨域 http, 虽然设置了 `document.domain` , 还是报错

:::tip Error
Mixed Content: The page at 'https://localhost.meetsocial.cn/' was loaded over HTTPS, but requested an insecure frame 'http://david.meetsocial.cn/child.html'. This request has been blocked; the content must be served over HTTPS.
:::

#### 2 设置

假设我们本地起了服务 ` http://localhost.meetsocial.cn:3000`, 那么 `document.domain` 默认等于 `localhost.meetsocial.cn`, 不包含端口号。

并且它不能随便设置 `document.domain = 'a'`, 会报错:

:::tip Error
Uncaught DOMException: Failed to set the 'domain' property on 'Document': 'a' is not a suffix of 'localhost.meetsocial.cn'.
at :1:17
:::

代码如下:

```html
// parent
<iframe src="http://david.meetsocial.cn/child.html" id="ifr"></iframe>
<script>
	document.domain = "meetsocial.cn";
	var ifr = document.getElementById("ifr");
	// 必须load 完才能获取到里面的变量
	ifr.addEventListener("load", () => {
		console.log(ifr.contentWindow.child);
	});
</script>

// child
<script>
	document.domain = "meetsocial.cn";
	var child = 1;
</script>
```

### 三、 location.hash + iframe 跨域

本质上和用 queryString 来传递是一样的，就是利用 child 页面再嵌套一个和 parent 同域的空白页面, 然后通过 ``` window.parent.parent 或 window.top ````调用 parent 的方法。

### 四、window.name + iframe 跨域

`window.name` 默认是空字符串。
它有 2 点魔性:

- 在页面上设置 `window.name='aaa'`, 那么强制刷新页面的时候，控制台上 ` window.name` 还是等于 aaa, 除非把当前的 tab 关闭，然后再重新打开。
- 在当前页面用脚本跳转了 ` window.location.href = 'http://www.baidu.com'`, `window.name` 竟然还存在。

所以根据上面 2 点, 可以在 child 页面里设置 `window.name`, 然后再让 child 跳转到和 parent 同域的空白页面, 空白页面再调用 ` window.parent.parent 或 window.top`

```html
// parent.html
<iframe src="http://david.meetsocial.cn/child.html" id="ifr"></iframe>
<script>
	var ifr = document.getElementById("ifr");
	let flag;
	// 必须load 完才能获取到里面的变量
	ifr.addEventListener("load", () => {
		// 防止变化location的时候, load 方法又执行，进入死循环。
		if (flag) {
			return;
		}
		flag = true;
		ifr.contentWindow.location = "/blank.html";
	});
	function fn(data) {
		console.log(data);
	}
</script>

// child.html
<script>
	window.name = "aabbcc";
</script>

// blank.html
<script>
	window.top.fn(window.name);
</script>
```

### 五、 postMessage 跨域

它可以传递对象, 但是对象里面不能有方法。

```html
// parent.html
<iframe src="http://david.meetsocial.cn/child.html" id="ifr"></iframe>
<script>
	var ifr = document.getElementById("ifr");
	var obj = {
		a: 1,
	};
	ifr.onload = function () {
		ifr.contentWindow.postMessage(obj, "*");
	};
	// 接受 child 返回数据
	window.addEventListener(
		"message",
		function (e) {
			console.log("data from child ---> ", e.data);
		},
		false
	);
</script>

// child
<script>
	window.addEventListener(
		"message",
		function (e) {
			console.log("data from parent ---> ", e.data);
			e.data.a += 1;

			// 向 parent 传递数据
			window.parent.postMessage(e.data, "http://localhost.meetsocial.cn");
		},
		false
	);
</script>
```

若传递的数据里面有函数，则传递不会成功, 会报错:

:::tip Error
Uncaught DOMException: Failed to execute 'postMessage' on 'Window': () => { } could not be cloned.
at HTMLIFrameElement.ifr.onload (http://localhost.meetsocial.cn/:25:31)
:::

```javascript
var obj = {
	a: 1,
	fn: () => {},
};
```
