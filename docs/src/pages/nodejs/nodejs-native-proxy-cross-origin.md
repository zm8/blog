# nodejs 原生代码 proxy 跨域

## 准备工作

1. A: 浏览器打开 `https://david.cn:7771/a/b/`
2. B: 最终发送的服务器: `https://localhost.meetsocial.cn:9991`
3. P: 中间件转发服务器, 代码写在 A 的 POST 请求里。
4. 代码启动

```
> nodemon proxy.js
> nodemon https.js
```

## 基本知识

### 1.`Request Headers` 的 Orign 字段

只要是 cors 请求 或者 POST 请求那么都会有 Origin 字段。
参考地址: https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Origin

### 2. post 请求带过去的 cookie 是 URL 里有的 cookie

假设在浏览器里 A 的控制台发送请求给 B, A 有 cookie `a=1`, B 有 cookie `b=2`,
那么发送请求头里只有 B 的 cookie。

```javascript
postData('B')
  .then((data) => console.log(data))
  .catch((error) => console.error(error))

function postData(url) {
  return window
    .fetch(url, {
      credentials: 'include',
      cache: 'no-cache',
      method: 'POST',
      mode: 'cors'
    })
    .then((response) => response.text())
}
```

### 3. cookie 访问路径对应的值(重要!!!)

在 url 根路径`/`, 执行下面代码, 能访问到 a, 不能访问 b
在 url 路径 `/a/b`或(`/a/b/`), 执行下面代码, **能访问到 a**, 也能访问到 b

```javascript
document.cookie = 'a=1;path=/'
document.cookie = 'b=1;path=/a/b'
```

在 url 路径 `/a/b`, 执行下面代码, 最终 d 的实际 path 为 '/a';
在 url 路径 `/a/b/`, 执行下面代码, 最终 d 的实际 path 为 '/a/b';

```javascript
// 不设置 path
document.cookie = 'd=1;'
```

## 正文

### A 控制台执行如下代码:

```javascript
postData('/c/d/')
  .then((data) => console.log(data))
  .catch((error) => console.error(error))

function postData(url, data = {}) {
  return window
    .fetch(url, {
      body: JSON.stringify(data),
      credentials: 'include',
      cache: 'no-cache',
      method: 'POST',
      mode: 'cors'
    })
    .then((response) => response.text())
}
```

### 查看几个重要的打印

#### 1. P 接收 A 请求的 header:

```
method:  POST
url:  /c/d/
req headers=== {
  host: 'david.cn:7771',
  connection: 'keep-alive',
  'content-length': '0',
  pragma: 'no-cache',
  'cache-control': 'no-cache',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
  'sec-fetch-dest': 'empty',
  accept: '*/*',
  origin: 'https://david.cn:7771',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-mode': 'cors',
  referer: 'https://david.cn:7771/a/b/',
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8'
}
```

#### 2. B 接收 P 转发的请求 header

```
method:  POST
url:  /c/d/
headers:  {
  connection: 'keep-alive',
  'content-length': '0',
  pragma: 'no-cache',
  'cache-control': 'no-cache',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
  'sec-fetch-dest': 'empty',
  accept: '*/*',
  origin: 'https://david.cn:7771',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-mode': 'cors',
  referer: 'https://david.cn:7771/a/b/',
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
  host: 'localhost.meetsocial.cn:9991'
}
```

#### 3. P 接收 B 响应回的 header

由于 A 的页面 url 的 path 是`/a/b/`, 而拿到的 cookie 里的 path 为`/c/d`, 所以得修改 path 为 `/a/b` 或者 `/`

```
res headers=== {
  'set-cookie': [
    'a=1; domain=localhost.meetsocial.cn; path=/c/d/',
    'b=2; domain=localhost.meetsocial.cn; path=/c/d/'
  ],
  date: 'Fri, 03 Apr 2020 09:56:19 GMT',
  connection: 'keep-alive',
  'content-length': '0'
}
```

#### 4.若 P 向 B 请求`https.request`不带 header

则 B 接收到的 header 如下:

```
headers:  {
  host: 'localhost.meetsocial.cn:9991',
  connection: 'close',
  'transfer-encoding': 'chunked'
}
```

B 接收的 headers 会自动带 host, 所以 P 向 B 请求的 headers 必须移除 host,
否则 B 收到的 host 就是 P 从 A 接收到的 host `david.cn:7771`, 这是不对的。

#### 5.若 P 不设置返回头给 A, 即`resOrg.writeHead(200, headers);`

则 A 浏览器的最终拿到的 `Response Headers` 如下:

```
Connection: keep-alive
Content-Length: 13
Date: Fri, 03 Apr 2020 09:21:18 GMT
```

#### 6.若 A 直接向 B 发送请求 `postData('https://localhost.meetsocial.cn:9991/c/d/', {a: 1, b: 2})`

B 必须设置返回头 `Access-Control-Allow-Credentials 和 Access-Control-Allow-Origin`,
否则 虽然 B 能收到 A 的请求, 但是 A 收不到 B 的返回，并且控制台报跨域的错误。

B 从 A 和 B 从 P 请求头区别如下:

```
// B直接从A那里拿到
'sec-fetch-site': 'cross-site',

// B从P那里拿到
'sec-fetch-site': 'same-origin',
```

B 从 A 那里拿到的完整请求头如下, host 为 B 自己的主机名, origin 为 A 的 url。

```javascript
url:  /c/d/
headers:  {
  host: 'localhost.meetsocial.cn:9991',
  connection: 'keep-alive',
  'content-length': '0',
  pragma: 'no-cache',
  'cache-control': 'no-cache',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
  'sec-fetch-dest': 'empty',
  accept: '*/*',
  origin: 'https://david.cn:7771',
  'sec-fetch-site': 'cross-site',
  'sec-fetch-mode': 'cors',
  referer: 'https://david.cn:7771/a/b/',
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8'
}
```

浏览器的 `Response Header`为:

```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: https://david.cn:7771
Connection: keep-alive
Content-Length: 13
Set-Cookie: a=1; domain=localhost.meetsocial.cn; path=/c/d/
Set-Cookie: b=2; domain=localhost.meetsocial.cn; path=/c/d/
```

## 综上所述

最终浏览器的 cookie 设置上了, 但是看浏览器的 `Response Header` 竟然没有如下头:

```
Access-Control-Allow-Credentials: true,
Access-Control-Allow-Origin: https://david.cn:7771/a/b
```

说明中间件转发的时候可以不设置返回头 , 也能跨域设置 cookie。

## 代码如下:

### P 的 Proxy.js 和 A 的 GET

```javascript
const fs = require('fs')
const https = require('https')

var options = {
  key: fs.readFileSync('./cert/local.key'),
  cert: fs.readFileSync('./cert/local.crt')
}
const server = https.createServer(options)
require('./codeProxy')(server).listen(7771, () => {
  console.log('打开 https://david.cn:7771')
})
```

### P 的 Proxy.js 和 A 的 GET

必须传递 agent 或者 设置全局的 https 的 agent `https.globalAgent.options.ca`, 否则会报错

> unable to verify the first certificate

```javascript
const qs = require('querystring')
const https = require('https')
const fs = require('fs')

// https.globalAgent.options.ca = fs.readFileSync("cert/rootCA.pem");
const agent = new https.Agent()
agent.options.ca = fs.readFileSync('./cert/rootCA.pem', 'utf8')

// 转发
function forward({ reqOrg, resOrg, data }) {
  const { method, url, headers } = reqOrg
  console.log('method: ', method)
  console.log('url: ', url)
  console.log('req headers===', headers)
  delete headers.host

  const options = {
    hostname: 'localhost.meetsocial.cn',
    port: 9991,
    path: url,
    method,
    agent,
    headers
  }
  const req = https.request(options, (res) => {
    res.setEncoding('utf8')
    const { headers, statusCode } = res
    console.log('res headers===', headers)

    let data = ''
    res
      .on('data', (chunk) => {
        data += chunk
      })
      .on('end', () => {
        if (statusCode === 200) {
          console.log(resOrg.set)
          // 去掉 domain, 只取cookie 的value值
          const cookies = headers['set-cookie'].map((item) => {
            return item.split(';')[0] + '; path=/'
          })
          headers['set-cookie'] = cookies
          resOrg.writeHead(200, headers)
          /*
            由于是同域, 所以只执行下面的方法也是可以的:

            resOrg.writeHead(200, {
              "set-cookie": cookies
            });
          */
          resOrg.end(data)
        }
      })
  })

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`)
  })
  req.write(data)
  req.end()
}

module.exports = function (server) {
  return server
    .on('request', (req, res) => {
      const { method, url } = req

      // 屏蔽请求 favicon.ico
      if (url === '/favicon.ico') {
        handleFavicon(req, res)
        return
      }

      if (method === 'POST') {
        handlePOST(req, res, (data) => {
          forward({
            reqOrg: req,
            resOrg: res,
            data
          })
        })
        return
      }

      if (method === 'GET') {
        handleGET(req, res)
        return
      }
    })
    .on('error', (err) => {
      console.error(err.stack)
    })

  function handleGET(req, res) {
    res.end('codeMid get get get')
  }

  function handlePOST(req, res, callback) {
    let body = []
    req
      .on('data', (chunk) => {
        body.push(chunk)
      })
      .on('end', () => {
        // body: a=1&b=2
        body = Buffer.concat(body).toString()
        callback(body)
      })
  }

  function handleFavicon(req, res) {
    res.statusCode = 404
    res.end()
  }
}
```

### B 的代码

```javascript
const myUrl = getUrl(req)
if (method === 'POST') {
  // myUrl.hostname 为 localhost.meetsocial.cn, host 去掉端口号
  res.setHeader('Set-Cookie', [
    `a=1; domain=${myUrl.hostname}; path=${url}`,
    `b=2; domain=${myUrl.hostname}; path=${url}`
  ])
  handlePOST(req, res)
  return
}

function handlePOST(req, res) {
  let body = []
  req
    .on('data', (chunk) => {
      body.push(chunk)
    })
    .on('end', () => {
      // body: a=1&b=2
      body = Buffer.concat(body).toString()
      res.end(body)
    })
}

/*
  new URL("https://localhost.meetsocial.cn:9991/a/b")
  URL {
    href: 'https://localhost.meetsocial.cn:9991/a/b',
    origin: 'https://localhost.meetsocial.cn:9991',
    protocol: 'https:',
    username: '',
    password: '',
    host: 'localhost.meetsocial.cn:9991',
    hostname: 'localhost.meetsocial.cn',
    port: '9991',
    pathname: '/a/b',
    search: '',
    searchParams: URLSearchParams {},
    hash: ''
  }
*/
function getUrl(req) {
  const { url, headers } = req
  // host 当前自己起的主机名, origin 是请求的主机名
  const { host } = headers
  let protocol = req.connection.encrypted ? 'https:' : 'http:'
  let href = protocol + '//' + host + url
  console.log(href)
  return new URL(href)
}
```

:::tip 参考地址
https://nodejs.org/api/url.html
:::
