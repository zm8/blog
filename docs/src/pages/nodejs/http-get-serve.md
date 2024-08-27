# Node.js 处理 GET 请求的 HTTP 服务器

## 1. 本地创建处理 get 请求的服务器

文件保存在 `code/node/get.js`

```js
const http = require("http");
const url = require("url");

/*
    创建服务器调用 http.createServer();
    服务器每次收到 http 请求后都会调用这个回调函数,
*/
var server = http.createServer().on("request", (req, res) => {
	// req.method 查看用的是哪个 HTTP 方法
	switch (req.method) {
		case "GET":
			showGet(res, req);
			break;
	}
});

server.listen(3000);

function showGet(res, req) {
	const obj = url.parse(req.url, true);
	let data = obj.query;
	data = JSON.stringify(data);

	res.setHeader("Access-Control-Allow-Origin", "*"); // 允许跨域
	res.setHeader("Contenty-Type", "application/json;charset=utf-8");
	res.statusCode = 200;
	res.end(data);
}
```

### 2. nodejs 发送 get 请求

文件保存在 `code/node/get_send.js`

```js
const http = require("http");

const options = {
	host: "127.0.0.1",
	port: "3000",
	path: "/?a=111&b=222",
	method: "GET",
	timeout: 20 * 1000, // 设置超时时间
};

// 或 http.get('http://127.0.0.1:3000/?a=111&b=222', res=>{})
const req = http.request(options, (res) => {
	console.log(`STATUS: ${res.statusCode}`);
	console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
	res.setEncoding("utf8");

	let data = "";
	res
		.on("data", (chunk) => {
			// console.log(`BODY: ${chunk}`);
			data += chunk;
		})
		.on("end", () => {
			console.log("=====end=====");
			console.log(data);
		});
});

req.on("timeout", () => {
	req.abort(); // 中止
});

req.on("error", (e) => {
	console.error(`problem with request: ${e.message}`);
});

req.end();
```
