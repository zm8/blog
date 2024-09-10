# cookie 属性学习

### 1. domain

当前属于哪个域名下能访问。

特别的, 当设置 domain 为`.meetsocial.cn`, 那么所有子域名比如 `test-sat.meetsocial.cn` 和 `testtlweb.meetsocial.cn` 都能访问。并且 http 和 https 都能访问。

### 2. path

在哪个路径下能访问, 特别的 `/`, 那么当前域名下的所有路径都能访问。
若设置为`/fb_tag`, 那么只能在这个路径下能访问。

### 3. HttpOnly

只能通过 http 传输, document.cookie 取不到 cookie。

### 4. Secure

是否只能通过 https 来传递 cookie

### 5. SameSite

1. Strict
   不能设置跨域的 cookie

2. Lax
   可以设置跨子域的 cookie
   跨子域的意思是: 比如源服务器是 `localhost.meetsocial.cn`, 而目标服务器是 `david.meetsocial.cn`, 那么是没有问题的。

3. None
   可以设置完全跨域的 cookie

### 6. 跨域传递 cookie

条件非常严格, 如下:

1. 目标服务必须是 https, 发送的服务可以为 http。
2. 发送的服务参数必须设置 `credentials: 'include'`, 目标服务得设置相应的返回头 `Access-Control-Allow-Credentials: true` 和 `Access-Control-Allow-Origin: ${origin}`
3. 目标服务的 cookie 必须设置 `samesite: none, secure`, Chrome 要求 samesite 为 none 的时候, 必须 secure, 所以目标服务器必须是 https。
   PS: 如果是跨子域传递 cookie, 只要设置 `samesite: lax`, 并不需要 secure。

### 7. 代码如下:

1. 发送服务的地址 `http://localhost:9990/`,
   控制台的执行的 JS 代码:

```js
http('https://localhost.meetsocial.cn:9999')
  .then((data) => console.log(data))
  .catch((error) => console.error(error))

function http(url, data = {}) {
  return window
    .fetch(url, {
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      cache: 'no-cache',
      method: 'POST',
      mode: 'cors'
    })
    .then((res) => res.text())
}
```

2. 目标服务
   启动的服务地址: `https://localhost.meetsocial.cn:9999`,
   代码:

```js
const fs = require('fs')
const https = require('https')
var options = {
  key: fs.readFileSync('./cert/local.key'),
  cert: fs.readFileSync('./cert/local.crt')
}
const server = https.createServer(options)

server
  .on('request', (req, res) => {
    const { method, url, headers } = req
    const { origin } = headers
    // 屏蔽请求 favicon.ico
    if (url === '/favicon.ico') {
      res.statusCode = 404
      res.end()
      return
    }

    if (method === 'GET') {
      res.end('get get get')
      return
    }

    // 返回预检头
    if (method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
      origin && res.setHeader('Access-Control-Allow-Origin', origin)
      res.end()
      return
    }

    if (method === 'POST') {
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      origin && res.setHeader('Access-Control-Allow-Origin', origin)
      // 设置 cookie, domain 和 path 不是必须的
      res.setHeader('Set-Cookie', [
        `a=11111; domain=.meetsocial.cn; path=/; samesite=none; secure;`
      ])
      res.end('POST success')
      return
    }
  })
  .on('error', (err) => {
    console.error(err.stack)
  })
  .listen(9999, () => {
    console.log('打开 https://localhost.meetsocial.cn:9999')
  })
```
