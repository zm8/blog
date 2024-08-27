# Node.js 处理表单提交的 POST 请求

创建 http 服务器

```js
var http = require("http");
var qs = require("querystring");

/*
    创建服务器调用 http.createServer();
    服务器每次收到 http 请求后都会调用这个回调函数,
*/
var server = http.createServer((req, res) => {
	if ("/" == req.url) {
		// req.method 查看用的是哪个 HTTP 方法
		switch (req.method) {
			case "GET":
				handleGet(res);
				break;
			case "POST":
				handlePost(req, function (data) {
					show(res, data);
				});
				break;
			default:
				badRequest(res);
				break;
		}
	} else {
		notFound(res);
	}
});

server.listen(3000);
```

`handleGet` 方法:

```js
function handleGet(res, data = {}) {
	var html = "";
	html +=
		"<!DOCTYPE HTML>" +
		"<html>" +
		" <head><title>Todo List</title></head>" +
		"<body>" +
		"<h1>Todo List</h1>" +
		"<ul>" +
		Object.keys(data)
			.map((key) => "<li>" + data[key] + "</li>")
			.join("") +
		"</ul>" +
		'<form method="post" action="/">' +
		'<p><input type="text" name="a" /></p>' +
		'<p><input type="text" name="b" /></p>' +
		'<p><input type="submit" value="Add Item" /></p>' +
		"</form>" +
		"</body>" +
		"</html>";

	/*
       设置 Content-Length 会隐含禁用 Node 的块编码, 
       因为要传输的数据少，所以能提升性能 和 提高响应速度,
       Content-Length 应该是字节长度，而不是字符长度 即 html.length
   */
	res.setHeader("Content-Length", Buffer.byteLength(html));
	/*
        发送 text/html 让浏览器知道要把响应结果作为 HTML 渲染
    */
	res.setHeader("Contenty-Type", "text/html; charset=utf-8");
	res.statusCode = 200;
	res.end(html);
}
```

`handlePost` 方法:

```js
function handlePost(req, callback) {
	var body = "";
	/*
        默认情况下, data 事件会提供 Buffer 对象,
        这是 Node 版的字节数组。
        而对于文本格式, 并不需要二进制, 所以将编码设置为 utf8
    */
	req.setEncoding("utf8");
	// 要得到整个字符串, 可以将所有的数据块拼接到一起, 直到表明请求已经完成的 end 事件被发射出来
	req.on("data", (chunk) => {
		body += chunk;
	});
	req.on("end", () => {
		/*
            body 是 "a=1&b=2",
            parse 后变成 {a: 1, b: 2}
        */
		callback(qs.parse(body));
	});
}
```

`badRequest` 错误请求函数:

```js
function badRequest(res) {
	res.statusCode = 400;
	res.setHeader("Content-Type", "text/plain");
	res.end("Bad Request");
}
```

`notFound` 函数:

```js
function notFound(res) {
	res.statusCode = 404;
	res.setHeader("Content-Type", "text/plain");
	res.end("Not Found");
}
```
