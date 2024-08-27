# fetch, xhr 跨域总结

## Chrome 请求头

fetch 跨域请求的参数里是否添加 `credentials: 'include'`, 在 Chrome 的请求头里面, 没有**任何区别。**

```js
function postData(url, data) {
	return window
		.fetch(url, {
			credentials: "include",
			body: JSON.stringify(data),
			headers: {
				"content-type": "application/json",
			},
			cache: "no-cache",
			method: "POST",
			mode: "cors",
		})
		.then((response) => response.json());
}
```

![image](https://user-images.githubusercontent.com/32337542/155837270-2f60cfdf-16ec-4196-a9a8-c1dccb91e896.png)

## 1. 代码准备

### 1. nodejs 启动服务 http 和 https

```javascript
// http
const http = require("http");
const server = http.createServer();
require("./code")(server).listen(9990, () => {
	console.log("打开 http://localhost.meetsocial.cn:9990");
});

// https
const fs = require("fs");
const https = require("https");

var options = {
	key: fs.readFileSync("./keys/server.key"),
	cert: fs.readFileSync("./keys/server.crt"),
};
const server = https.createServer(options);
require("./code")(server).listen(9991, () => {
	console.log("打开 https://localhost.meetsocial.cn:9991");
});

// code
module.exports = function (server) {
	return server
		.on("request", (req, res) => {
			// 屏蔽请求 favicon.ico
			if (url === "/favicon.ico") {
				handleFavicon(req, res);
				return;
			}

			if (method === "POST") {
				handlePOST(req, res);
				return;
			}

			if (method === "GET") {
				handleGET(req, res);
				return;
			}
		})
		.on("error", (err) => {
			console.error(err.stack);
		});

	function handleGET(req, res) {
		res.end("hello world");
	}

	function handlePOST(req, res) {
		let body = [];
		req
			.on("data", (chunk) => {
				body.push(chunk);
			})
			.on("end", () => {
				// body: a=1&b=2
				body = Buffer.concat(body).toString();
				console.log("body: ", body === "[object Object]");
				res.end(body);
			});
	}

	function handleFavicon(req, res) {
		res.statusCode = 404;
		res.end();
	}
};
```

### 2. fetch Post 请求代码(非跨域情况)

代码如下:

```javascript
postData("/", { a: 1, b: 2 })
	.then((data) => console.log(data))
	.catch((error) => console.error(error));

function postData(url, data) {
	const arr = [];
	Object.entries(data).forEach(([key, val]) => {
		arr.push(key + "=" + val);
	});
	const body = arr.join("&");

	return window
		.fetch(url, {
			body: body,
			cache: "no-cache",
			method: "POST",
			mode: "no-cors",
		})
		.then((res) => res.text());
}
```

#### 1. post 不指定 `Content-Type`

- 默认的 `Content-Type` 为 `text/plain;charset=UTF-8`
- 请求的数据形式是: `Request Payload: a=1&b=2`

#### 2. post 表单提交的 `Content-Type`

- 请求的数据形式是: `Form Data: a: 1(换行)b: 2`, 注意**不是对象**

```javascript
return window.fecth(url, {
	...
	headers: {
	    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	},
});
```

请求的数据格式从 `a=1&b=2` 改成 `JSON.stringify(data)`,
那么返回的格式是个对象 `{a: 1, b:2} `

```javascript
postData("/", { a: 1, b: 2 })
	.then((data) => console.log(data))
	.catch((error) => console.error(error));

function postData(url, data) {
	return window
		.fetch(url, {
			body: JSON.stringify(data),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			cache: "no-cache",
			method: "POST",
			mode: "no-cors",
		})
		.then((res) => res.json());
}
```

注意请求的 body 不能直接写成 `{body: data}`, 否则相当于传递字符串 `'[object Object]'`

#### 3. post 带`Content-Type: application/json`

- 请求的数据形式是: `Request Payload: {a: 1, b: 2}`
- 虽然 cors 可以用 `no-cors`, 那么 `Request Headers` 的 `Content-Type` 为`text/plain;charset=UTF-8`, 不影响结果正确返回。

cors 最好用 **same-origin** 或 **cors**, 则 `Request Headers` 的 `Content-Type` 为 `application/json`,
Chrome 浏览器 mode 默认为 **cors**。

```javascript
postData("/", { a: 1, b: 2 })
	.then((data) => console.log(data))
	.catch((error) => console.error(error));

function postData(url, data) {
	const body = JSON.stringify(data);

	return window
		.fetch(url, {
			body: body,
			headers: {
				"Content-Type": "application/json",
			},
			cache: "no-cache",
			method: "POST",
			mode: "same-origin",
		})
		.then((res) => res.json());
}
```

上面的代码相当于 jQuery:

```javascript
jQuery.ajax({
	url: "/",
	headers: { "Content-Type": "application/json" },
	type: "POST",
	dataType: "json",
	data: JSON.stringify({ c: 1, b: 2 }),
	success: (data) => {
		// {a: "1", b: "2"}
		console.log(data);
	},
});
```

#### 4. 总结

1. 请求的数据格式跟 `Content-Type` 是什么没有关系, 和服务端怎么处理你的数据有关系。

比如你传递了 `'a=1&b=2'`, 那么服务端可以返回 `'a=1&b=2'`, 也可以返回 `'{"a":1,"b":2}'`。

若你传递了`JSON.stringify` 的数据格式 `'{"a":1,"b":2}'`, 则服务端直接原样的数据返回 `'{"a":1,"b":2}'`, 不用处理更加简便。

2. `res.text` 的使用始终没有问题，而`res.json` 必须返回的是可以 `JSON.parse` 的数据，比如 `'{"a":1,"b":2}'`，所以 `res.json()` 其实等价于 `JSON.parse(res.text())`。

### 3. xhr Post 请求代码(非跨域情况)

首先加载 jQuery

```javascript
var s = document.createElement("script");
s.src = "https://code.jquery.com/jquery-1.11.3.js";
document.body.appendChild(s);
```

下面 jQuery 代码和 fetch 设置 `Content-Type` 为 ` application/x-www-form-urlencoded; charset=UTF-8`, 在 Network 看到的请求头基本一样。

```javascript
jQuery.ajax({
	url: "/",
	type: "POST",
	data: { c: 1, b: 2 },
	success: (data) => {
		// {a: "1", b: "2"}
		console.log(data);
	},
});
```

jQuery 会多传递一个请求头:`X-Requested-With: XMLHttpRequest`

![image](https://user-images.githubusercontent.com/32337542/77395747-34d81d80-6ddd-11ea-83e6-1d7c42e34b52.png)

## 2. 普通跨域

请求代码:

```javascript
jQuery.ajax({
	url: "https://david.meetsocial.cn:9991",
	type: "POST",
	data: { c: 1, b: 2 },
	success: (data) => {
		// {a: "1", b: "2"}
		console.log(data);
	},
});
```

1. 普通请求会报错

:::danger Error
Access to XMLHttpRequest at 'https://david.meetsocial.cn:9991/' from origin 'https://localhost.meetsocial.cn:9991' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
:::

2. 服务端设置 `Access-Control-Allow-Origin` 返回头, 可以跨域。

设置为 `origin`, 或者直接设置为 `*`, 都可以跨域。

```javascript
const { method, url, headers } = req;
const { origin } = headers;
if (method === "POST") {
	origin && res.setHeader("Access-Control-Allow-Origin", origin);
	handlePOST(req, res);
	return;
}
```

3. http 可以跨域请求 https, https 不可以请求 http

https 请求 http 报错如下:

:::danger Error
Access to XMLHttpRequest at 'https://david.meetsocial.cn:9991/' from origin 'https://localhost.meetsocial.cn:9991' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
:::

## 3. 跨域( `Content-Type: application/json` )

请求代码:

```javascript
postData("https://david.meetsocial.cn:9991", { dddd: 1, b: 2 })
	.then((data) => console.log(data))
	.catch((error) => console.error(error));

function postData(url, data) {
	return window
		.fetch(url, {
			body: JSON.stringify(data),
			cache: "no-cache",
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
			mode: "cors",
		})
		.then((res) => res.text());
}
```

服务端必须返回预检头才可以跨域:

```javascript
const { method, url, headers } = req;
const { origin } = headers;
console.log("method: ", method);
console.log("url: ", url);
console.log("origin: ", origin);
console.log("");

// 返回预检头
if (method === "OPTIONS") {
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
	origin && res.setHeader("Access-Control-Allow-Origin", origin);
	res.end();
	return;
}

if (method === "POST") {
	origin && res.setHeader("Access-Control-Allow-Origin", origin);
	handlePOST(req, res);
	return;
}
```

服务端打印日志情况如下:

```
method:  OPTIONS
url:  /
origin:  https://localhost.meetsocial.cn:9991

method:  POST
url:  /
origin:  https://localhost.meetsocial.cn:9991
```

什么时候需要预简头, [参考地址](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS), 其中一点:

Content-Type 为下列三者之一，则不需要预检头。

- text/plain
- multipart/form-data
- application/x-www-form-urlencoded

## 4. 跨域( 携带 cookie )

**总结:**

- 若要带 cookie, 需要请求头设置 `{credentials: true}`。

- 若请求头**不设置**`{credentials: true}`, 只是客户端 cookie 传**不过去**, 代码本身请求并**不会报错**。

- 若请求头加上了 `{credentials: true}`, 而服务端必须有相应返回头 `Access-Control-Allow-Credentials`设置, 否则浏览器控制台会报错。

- 若服务端没设置返回头, 还是能接收到 OPTION 请求, 而 POST 请求接收不到。

- 若服务端要接收到 POST 请求, 必须先设置 OPTION 返回头 ` Access-Control-Allow-Credentials: true`。

- `Credentials` 的字段在 Chrome Network 的 `Request Headers` 看不见相应的字段。

- 请求头 `Credentials` 设置为 `true` 以后, 服务端的 `access-control-allow-origin` 不能设置为 `*`, 必须设置为客户端请求的域名(`request.headers.origin` 字段)。

### 1. 设置本地 cookie

注意浏览器的 cookie 必须设置 domain 为二级域名, 否则就算服务端代码设置都完美了，服务端还是读不到 cookie 的。

```javascript
document.cookie = "a=1; domain=.meetsocial.cn;";
document.cookie = "b=1; domain=.meetsocial.cn;";
```

### 2. fetch 跨于请求设置 credentials

步骤 1 设置好以后, fetch 必须设置 ` credentials: include`, 否则就算服务端代码设置都完美了，服务端还是读不到客户端传递的 cookie 的。

fetch 代码如下:

```javascript
// fetch
postData("https://david.meetsocial.cn:9991", { a: 1, b: 2 })
	.then((data) => console.log(data))
	.catch((error) => console.error(error));

function postData(url, data) {
	return window
		.fetch(url, {
			credentials: "include",
			body: JSON.stringify(data),
			headers: {
				"content-type": "application/json",
			},
			cache: "no-cache",
			method: "POST",
			mode: "cors",
		})
		.then((response) => response.json());
}
```

### 3. xhr 跨域请求设置 withCredentials

xhr 必须设置 `xhr.withCredentials=true`,代码如下:

注意不是设置 `http.setRequestHeader('withCredentials', 'true');`

```javascript
httpPost("https://david.meetsocial.cn:9991", {
	a: "1",
	b: "2",
});

function httpPost(url, data = {}) {
	const xhr = new window.XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status == 200) {
			console.log(xhr.responseText); // {"a":"1","b":"2"}
		}
	};
	xhr.open("POST", url, true);
	xhr.withCredentials = true;
	// open 之后才能 setRequestHeader
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(JSON.stringify(data));
}
```

jQuery 代码, 设置 xhrFields 字段

```javascript
jQuery.ajax({
	url: "https://david.meetsocial.cn:9991",
	headers: { "Content-Type": "application/json" },
	type: "POST",
	dataType: "json",
	data: JSON.stringify({ c: 1, b: 2 }),
	xhrFields: {
		withCredentials: true,
	},
	success: (data) => {
		// {a: "1", b: "2"}
		console.log(data);
	},
});
```

### 4. 服务端必须设置 OPTIONS 和 POST

服务端 OPTIONS 和 POST 都需设置 `access-control-allow-credentials`为 `true`。

:::tip
若 OPTION 设置, POST 不设置, 还是可以读的到客户端 cookie, 只不过最终浏览器会抛出错误。
:::

```javascript
// 预检头
if (method === "OPTIONS") {
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
	origin && res.setHeader("Access-Control-Allow-Origin", origin);
	res.end();
	return;
}

// POST 请求
if (method === "POST") {
	res.setHeader("Access-Control-Allow-Credentials", "true");
	origin && res.setHeader("Access-Control-Allow-Origin", origin);
	handlePOST(req, res);
	return;
}
```

若 OPTIONS 没设置, 会报错:

:::danger Error
Access to fetch at 'https://david.meetsocial.cn:9991/' from origin 'https://localhost.meetsocial.cn:9991' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Credentials' header in the response is '' which must be 'true' when the request's credentials mode is 'include'.
:::

若 POST 没设置, 会报错:

:::danger Error
Access to fetch at 'https://david.meetsocial.cn:9991/' from origin 'https://localhost.meetsocial.cn:9991' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Credentials' header in the response is '' which must be 'true' when the request's credentials mode is 'include'.
:::

### 5. 服务端打印日志

可以看到 OPTIONS 的时候看不到 cookie, POST 的时候能看到

```
cookie:  undefined
method:  OPTIONS
url:  /
origin:  https://localhost.meetsocial.cn:9991

cookie:  a=1
method:  POST
url:  /
origin:  https://localhost.meetsocial.cn:9991
```

### 6. http 请求 https, cookie 还是能带上

比如当前环境是 http: `http://david.meetsocial.cn:9990`,
请求 https `https://localhost.meetsocial.cn:9991`,
则 cookie 也是会带上的。

### 7. 服务端返回 cookie

`Set-Cookie`必须设置 domain, 否则 domain 默认为服务端的域名, 设置到浏览器是设置不上的。

```javascript
if (method === "POST") {
	const cookieObj = getCookie(cookie);

	res.setHeader("Set-Cookie", [
		`a=${++cookieObj["a"]}; HttpOnly; domain=.meetsocial.cn`,
		`b=${++cookieObj["b"]}; HttpOnly; domain=.meetsocial.cn`,
	]);
}

// getCookie, 返回 {a: 1, b: 2}
function getCookie(cookie) {
	let obj = {};
	cookie &&
		cookie.split(";").forEach((item) => {
			let arr = item.split("=");
			obj[arr[0].trim()] = arr[1].trim();
		});
	return obj;
}
```

如下返回的 Network 查看, 2 个 cookie 的 domain 为 `david.meetsocial.cn`, 再刷新下 cookie, 那 2 个 cookie 就不见了。

![image](https://user-images.githubusercontent.com/32337542/77406473-aae58000-6def-11ea-8cf8-7f38a85a9d96.png)

## 5. nginx 代理跨域

上面跨域传递的 cookie 的前提必须它们的子域名一样, 都是 `meetsocial.cn`,
而 nginx 代理跨域可以实现完全不同域名的 cookie 读取和写入。

### 1.准备代码和接口转发

当前浏览器 url: `https://david.cn:4444`,
走的 nginx 配置如下, 所有的以 `/api/` 开头的请求都转发到 `https://localhost.meetsocial.cn:9991`

```
server {
    listen       4444 ssl;
    server_name  david.cn;

    ssl_certificate      server.crt;
    ssl_certificate_key  server.key;

    location / {
        root   html;
        index  index.html;
    }

    location ^~ /api/ {
        proxy_pass https://localhost.meetsocial.cn:9991;
    }
}
```

POST 请求 url 的以`/api/`的前缀, 代码:

```javascript
// 注意这里不能为 '/api', 否则会出现诡异, 转发过去的竟然是 get 请求
postData("/api/aa/bb/cc", { a: 1, b: 2 })
	.then((data) => console.log(data))
	.catch((error) => console.error(error));

function postData(url, data) {
	return window
		.fetch(url, {
			body: JSON.stringify(data),
			headers: {
				"content-type": "application/json",
			},
			cache: "no-cache",
			method: "POST",
			mode: "cors",
		})
		.then((response) => response.text());
}
```

### 2.接收的打印

node 那边接收的 `headers`, `url` 为:

```javascript
const { method, url, headers } = req;
const { origin, cookie } = headers;

console.log("method: ", method);
console.log("url: ", url);
console.log("headers: ", headers);
console.log("");
```

```
method:  POST
url:  /api/aa/bb/cc
headers:  {
  host: 'localhost.meetsocial.cn:9991',
  connection: 'close',
  'content-length': '13',
  pragma: 'no-cache',
  'cache-control': 'no-cache',
  'sec-fetch-dest': 'empty',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
  'content-type': 'application/json',
  accept: '*/*',
  origin: 'https://david.cn:4444',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-mode': 'cors',
  referer: 'https://david.cn:4444/',
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8'
}
```

若直接打开浏览器 ` https://localhost.meetsocial.cn:9991`, 发送上面的 POST 请求, 那么 headers 接收到的基本一样。

![image](https://user-images.githubusercontent.com/32337542/77885661-030dfd80-729a-11ea-9ba4-694d1980918e.png)

若要转发请求到 `localhost.meetsocial.cn` 不带 `/api/`, 则 nginx 配置如下:

```
location ^~ /api/ {
    rewrite ^/api/(.*)$ /$1 break;
    proxy_pass https://localhost.meetsocial.cn:9991;
}
```

node 接收打印如下:

```
url:  /aa/bb/cc
```

### 3. cookie 设置

若要将请求的 cookie 设置域名为`david.cn`和 path 为`/`, 则配置如下:

```
location ^~/api/ {
    rewrite ^/api/(.*)$ /$1 break;
    proxy_pass https://localhost.meetsocial.cn:9991;
    proxy_cookie_domain localhost.meetsocial.cn david.cn;
    proxy_cookie_path /aa/bb/cc /;
}
```

node 代码如下, node 获取的 url 为 `/aa/bb/cc`, 必须显示的设置 nodejs 的 path 属性, 否则 proxy_cookie_path 的替换规则不生效。

```javascript
res.setHeader("Set-Cookie", [
	`a=1; domain=localhost.meetsocial.cn; path=${url}`,
	`b=2; domain=localhost.meetsocial.cn; path=${url}`,
]);
```

若要匹配任意 path, 配置如下:

```
proxy_cookie_path ~*(.+) /
// 或
proxy_cookie_path ~(.+) /
```

注意不能为: `proxy_cookie_path (.+) /`

符号解释:

```
~ 表示区分大小写正则匹配
~* 表示不区分大小写正则匹配
```

## 6. POST 请求的服务端如何设置 cookie

1. 假设当前的浏览器打开地址是 `https://david.cn:9991`, POST 请求的 url 是 `https://localhost.meetsocial.cn:9991`。

2. 前端请求的时候必须带 `credentials: 'include'`, 否则服务端读不到客户端传递的 cookie。

3. 服务端只能设置 cookie 的 domain 为 `localhost.meetsocial.cn` 或 `meetsocial.cn`, 这个 domain 和 POST 的 url 相对应, 而不能是 `david.meetsocial.cn`

4. 最终在 Chrome 浏览器里 `Application-Cookies` 里查看的 cookie 都会增加前缀`.`, 比如 `.localhost.meetsocial.cn或 .meetsocial.cn`。

服务端设置 cookie 代码:

```javascript
if (method === "POST") {
	...
	res.setHeader("Set-Cookie", [
	  `ccc=1; HttpOnly; domain=localhost.meetsocial.cn`,
	  `ddd=2; HttpOnly; domain=localhost.meetsocial.cn`
	]);
	...
}
```

前端 POST 代码:

```javascript
postData("https://localhost.meetsocial.cn:9991", { a: 1, b: 2 })
	.then((data) => console.log(data))
	.catch((error) => console.error(error));

function postData(url, data) {
	return window
		.fetch(url, {
			credentials: "include",
			body: JSON.stringify(data),
			headers: {
				"content-type": "application/json",
			},
			cache: "no-cache",
			method: "POST",
			mode: "cors",
		})
		.then((response) => response.json());
}
```

控制台有个警告, 跨域设置 cookie 功能, Chrome 浏览器以后只支持服务端设置了 `SameSite=None; Secure`

:::tip 警告
A cookie associated with a cross-site resource at http://localhost.meetsocial.cn/ was set without the `SameSite` attribute. A future release of Chrome will only deliver cookies with cross-site requests if they are set with `SameSite=None` and `Secure`. You can review cookies in developer tools under Application>Storage>Cookies and see more details at https://www.chromestatus.com/feature/5088147346030592 and https://www.chromestatus.com/feature/5633521622188032.
:::

所以修改 nodejs 代码如下, 就不会有警告了:

```javascript
if (method === "POST") {
	...
	res.setHeader("Set-Cookie", [
	  `ccc=1; HttpOnly; domain=localhost.meetsocial.cn; SameSite=none; Secure`,
	  `ddd=2; HttpOnly; domain=localhost.meetsocial.cn; SameSite=none; Secure`
	]);
	...
}
```
