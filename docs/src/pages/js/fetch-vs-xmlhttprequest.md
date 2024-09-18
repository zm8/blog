# fetch 对比 XMLHttpRequest

## 更新

对于有预检请求(Option) 的情况, 服务端 需要返回 3 个请求头:

```js
res.setHeader("Access-Control-Allow-Credentials", "true");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");
res.setHeader("Access-Control-Allow-Origin", origin);
```

如果前端的 `Access-Control-Allow-Headers` 多带了一个 `Token` 字段,
即: `Access-Control-Allow-Headers: Content-Type, Token`
那么服务端的也得多返回一个 `Token` 字段:

```js
res.setHeader("Access-Control-Allow-Headers", "Content-Type, Token");
```

而对于 Option 接下来的 GET 和 POST 请求, 服务端返回的请求头只要:
`Access-Control-Allow-Credentials` 和 `Access-Control-Allow-Origin`
<img width="680" alt="image" src="https://user-images.githubusercontent.com/32337542/156573994-2780b1c5-40f4-4951-9ce4-eb7f2305bc15.png">

## 前言

### 1. 什么时候需要服务端设置预简头

[参考地址](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)
若请求的 url 跨域, 并且 Content-Type 不是下列三者之一。

- text/plain
- multipart/form-data
- application/x-www-form-urlencoded

### 2.请求配置

当前 url 是 https://david.meetsocial.cn:9991/,
请求的远端 url 为 https://localhost.meetsocial.cn:9991

## 1.fetch

若要传递 cookie, 则设置 `credentials: 'include'`

### 1. post (application/json)

```javascript
http("https://localhost.meetsocial.cn:9991", { a: 1, b: 2 })
  .then((data) => console.log(data))
  .catch((error) => console.error(error));

function http(url, data = {}) {
  return window
    .fetch(url, {
      body: JSON.stringify(data),
      //credentials: 'include',
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      cache: "no-cache",
      method: "POST",
      mode: "cors"
    })
    .then((res) => res.text());
}
```

### 2. post (application/x-www-form-urlencoded)

```javascript
http("https://localhost.meetsocial.cn:9991", { a: 1, b: 2 })
  .then((data) => console.log(data))
  .catch((error) => console.error(error));

function http(url, data = {}) {
  const arr = [];
  Object.entries(data).forEach(([key, val]) => {
    arr.push(key + "=" + val);
  });
  const body = arr.join("&");
  return window
    .fetch(url, {
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      cache: "no-cache",
      method: "POST",
      mode: "cors"
    })
    .then((res) => res.text());
}
```

### 3. get (application/json)

```javascript
http("https://localhost.meetsocial.cn:9991", { a: 1, b: 2 })
  .then((data) => console.log(data))
  .catch((error) => console.error(error));

function http(url, data = {}) {
  const arr = [];
  Object.keys(data).forEach((n) => {
    arr.push(n + "=" + data[n]);
  });
  if (arr.length > 0) {
    url = url + "?" + arr.join("&");
  }
  return window
    .fetch(url, {
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      cache: "no-cache",
      method: "GET",
      mode: "cors"
    })
    .then((res) => res.text());
}
```

或

```javascript
http("https://localhost.meetsocial.cn:9991", { a: 1, b: 2 })
  .then((data) => console.log(data))
  .catch((error) => console.error(error));

function http(url, data = {}) {
  url = new URL(url);
  url.search = new URLSearchParams(data).toString();
  return window
    .fetch(url, {
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      cache: "no-cache",
      method: "GET",
      mode: "cors"
    })
    .then((res) => res.text());
}
```

或

```javascript
http("https://localhost.meetsocial.cn:9991", { a: 1, b: 2 })
  .then((data) => console.log(data))
  .catch((error) => console.error(error));

function http(url, data = {}) {
  url = new URL(url);
  Object.keys(data).forEach((key) => url.searchParams.append(key, data[key]));
  return window
    .fetch(url, {
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      cache: "no-cache",
      method: "GET",
      mode: "cors"
    })
    .then((res) => res.text());
}
```

### 4. get (application/x-www-form-urlencoded)

```javascript
http("https://localhost.meetsocial.cn:9991", { a: 1, b: 2 })
  .then((data) => console.log(data))
  .catch((error) => console.error(error));

function http(url, data = {}) {
  url = new URL(url);
  url.search = new URLSearchParams(data).toString();
  return window
    .fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      cache: "no-cache",
      method: "GET",
      mode: "cors"
    })
    .then((res) => res.text());
}
```

## 2.XMLHttpRequest

若要传递 cookie, 则设置 `xhr.withCredentials=true;`

### 1. post (application/json)

```javascript
http("https://localhost.meetsocial.cn:9991", {
  a: "1",
  b: "2"
});

function http(url, data = {}) {
  const xhr = new window.XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status == 200) {
      console.log(xhr.responseText); // {"a":"1","b":"2"}
    }
  };
  xhr.open("POST", url, true);
  // xhr.withCredentials=true;
  // open 之后才能 setRequestHeader
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.send(JSON.stringify(data));
}
```

### 2. post (application/x-www-form-urlencoded)

```javascript
http("https://localhost.meetsocial.cn:9991", {
  a: "1",
  b: "2"
});

function http(url, data = {}) {
  const arr = [];
  Object.keys(data).forEach((n) => {
    arr.push(n + "=" + data[n]);
  });
  const xhr = new window.XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status == 200) {
      console.log(xhr.responseText); // {"a":"1","b":"2"}
    }
  };
  xhr.open("POST", url, true);
  // xhr.withCredentials=true;
  // open 之后才能 setRequestHeader
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
  xhr.send(arr.join("&"));
}
```

### 3. get (application/json)

```javascript
http("https://localhost.meetsocial.cn:9991", {
  a: "1",
  b: "2"
});

function http(url, data = {}) {
  url = new URL(url);
  url.search = new URLSearchParams(data).toString();
  const xhr = new window.XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status == 200) {
      console.log(xhr.responseText); // {"a":"1","b":"2"}
    }
  };
  xhr.open("GET", url, true);
  // xhr.withCredentials=true;
  // open 之后才能 setRequestHeader
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.send(null);
}
```

### 4. get (application/x-www-form-urlencoded)

```javascript
http("https://localhost.meetsocial.cn:9991", {
  a: "1",
  b: "2"
});

function http(url, data = {}) {
  url = new URL(url);
  url.search = new URLSearchParams(data).toString();
  const xhr = new window.XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status == 200) {
      console.log(xhr.responseText); // {"a":"1","b":"2"}
    }
  };
  xhr.open("GET", url, true);
  // xhr.withCredentials=true;
  // open 之后才能 setRequestHeader
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
  xhr.send(null);
}
```

## 3.jQuery

首先加载 jQuery

```javascript
var s = document.createElement("script");
s.src = "https://code.jquery.com/jquery-1.11.3.js";
document.body.appendChild(s);
```

### 1. post (application/json)

- 若要传递 cookie, 则设置 `xhrFields`。
- 必须设置 headers

```javascript
http("https://localhost.meetsocial.cn:9991", {
  a: "1",
  b: "2"
});
function http(url, data) {
  jQuery.ajax({
    url,
    type: "POST",
    //xhrFields: {
    //withCredentials: true
    //},
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify(data),
    success: (data) => {
      console.log(data);
    }
  });
}
```

### 2. post (application/x-www-form-urlencoded)

jQuery 默认的`Content-Type` 为 `application/x-www-form-urlencoded; charset=UTF-8`,
所以不设置也可以。

```javascript
http("https://localhost.meetsocial.cn:9991", {
  a: "1",
  b: "2"
});
function http(url, data) {
  jQuery.ajax({
    url,
    type: "POST",
    //headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    data: data,
    success: (data) => {
      console.log(data);
    }
  });
}
```

### 3. get (application/json)

```javascript
http("https://localhost.meetsocial.cn:9991", {
  a: "1",
  b: "2"
});
function http(url, data) {
  jQuery.ajax({
    url,
    type: "GET",
    headers: { "Content-Type": "application/json" },
    data,
    success: (data) => {
      console.log(data);
    }
  });
}
```

### 4. get (application/x-www-form-urlencoded)

```javascript
http("https://localhost.meetsocial.cn:9991", {
  a: "1",
  b: "2"
});
function http(url, data) {
  jQuery.ajax({
    url,
    type: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    data: data,
    success: (data) => {
      console.log(data);
    }
  });
}
```

另外 Chrome 的开发工具，对于跨域的情况, 它看不到请求头的具体信息, 但是可以通过 Fidder 或者 Charles 进行拦截一层查看。

## 总结:

- POST 请求必须设置 `Content-Type`。
- GET 请求设置不设置 `Content-Type` 都没关系, 最终请求参数都拼接在 querystring 上。
- fetch, XMLHttpRequest, jQuery 的 GET 请求头, 默认都没有 `Content-Type`。
- fetch 和 XMLHttpRequest 的 POST 请求头, `Content-Type` 默认为 `text/plain;charset=UTF-8`, 而 jQuery 默认为 `application/x-www-form-urlencoded; charset=UTF-8`。
- 另外上传文件的时候不要设置 `Content-Type` 为`multipart/form-data`, 参考地址https://zhuanlan.zhihu.com/p/34291688

:::tip 参考地址
https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch
https://stackoverflow.com/questions/35038857/setting-query-string-using-fetch-get-request
https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS
:::
