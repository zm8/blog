# 页面卸载前如何发送请求

### 导言

- 通常使用它来做客户端日志发送给服务端, 查看用户页面停留时间

### 1. 使用 `Navigator.sendBeacon()`

它是使用 **post** 发送

1. FormData 形式
   使用这种方式做文件上传, `Content-Type ` 通常是 `multipart/form-data`

```js
window.addEventListener('beforeunload', logData, false)
function logData() {
  var formData = new FormData()
  formData.append('username', 'David')
  navigator.sendBeacon('https://localhost.meetsocial.cn:7001', formData)
}
```

eggjs 这时为了验证拿到 username, 开启 `mode: file` 模式

```js
// config.default.js
  config.multipart = {
    mode: 'file',
  };

// controller/home.js
async index() {
    const { ctx } = this;
    console.log('body', this.ctx.request.body); // body { username: 'David' }
    ctx.body = '<h1 style=text-align:center>Hello, node_sat!</h1>';
  }
```

### 2. application/x-www-form-urlencoded

```js
var params = new URLSearchParams({
  username: 'David'
})
navigator.sendBeacon('https://localhost.meetsocial.cn:7001', params)
```

### 3. application/json

```js
const body = {
  name: 'David'
}
const headers = {
  type: 'application/json'
}
const blob = new Blob([JSON.stringify(body)], headers)
navigator.sendBeacon('https://localhost.meetsocial.cn:7001', blob)
```

### 2. 使用 `XMLHttpRequest  同步发送请求`

发现 Chrome(90.0.4430.93) mac 下不起作用

```js
window.addEventListener('beforeunload', logData, false)

function logData() {
  http('https://localhost.meetsocial.cn:7001', {
    name: 'David'
  })
  function http(url, data = {}) {
    const xhr = new window.XMLHttpRequest()
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status == 200) {
        console.log(xhr.responseText)
      }
    }
    xhr.open('POST', url, false)
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
    xhr.send(JSON.stringify(data))
  }
}
```

### 3. 使用脚本锁死

使用 XHR 异步的方式

```js
window.addEventListener('beforeunload', logData, false)

function logData() {
  http('https://localhost.meetsocial.cn:7001', {
    name: 'David'
  })
  function http(url, data = {}) {
    const xhr = new window.XMLHttpRequest()
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status == 200) {
        console.log(xhr.responseText)
      }
    }
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
    xhr.send(JSON.stringify(data))
  }
  var jjj = 100000000
  while (jjj--) {}
}
```

使用 Fetch 方式

```js
http('https://localhost.meetsocial.cn:7001', { name: 'David' })
  .then((data) => console.log(data))
  .catch((error) => console.error(error))

function http(url, data = {}) {
  return window
    .fetch(url, {
      body: JSON.stringify(data),
      //credentials: 'include',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      cache: 'no-cache',
      method: 'POST',
      mode: 'cors'
    })
    .then((res) => res.text())
}

var jjj = 100000000
while (jjj--) {}
```
