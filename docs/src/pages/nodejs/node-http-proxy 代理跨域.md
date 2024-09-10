# node-http-proxy 代理跨域

### 准备工作:

1. 本地启动服务 https://david.cn:1111, 记为 A
2. 访问远端服务 https://localhost.meetsocial.cn:9991, 记为 B
3. 代理代码 http-proxy, 记为 P
4. node 启动代码

```
> yarn init -y
> yarn add http-proxy
> nodemon httpProxy.js
> nodemon https.js
```

5. A 的浏览器控制台, 代码准备:

```javascript
postData('/api/aa/bb/cc', { a: 1, b: 2 })
  .then((data) => console.log(data))
  .catch((error) => console.error(error))

function postData(url, data) {
  return window
    .fetch(url, {
      body: JSON.stringify(data),
      headers: {
        'content-type': 'application/json'
      },
      cache: 'no-cache',
      method: 'POST',
      mode: 'cors'
    })
    .then((response) => response.text())
}
```

### 代码解读:

1. `changeOrigin: true,` 为了让传递给 B 的 host 为 `localhost.meetsocial.cn:9991`, 而不是 `david.cn:1111`。所以得配合加上参数 cookieDomainRewrite, 让传回的 cookie 的 domain 变成 `david.cn`。
2. secure true 是否验证证书, 如果设置为 true, 则必须传递参数 agent。
3. 为了能让 https 能够转发不会报下面的错, 需要传递 agent
   > unable to verify the first certificate
4. B 代码返回头必须的设置 cookie 的 path, 否则 P 里的 cookiePathRewrite 不起作用。

```javascript
res.setHeader('Set-Cookie', [`a=1; path=xxx`])
```

5. 另外, http-proxy 还可以增加参数 `selfHandleResponse: true`, 则可以自定义返回的内容。

### 代码:

#### A 和 P 的代码

```javascript
const httpProxy = require('http-proxy')
const fs = require('fs')
const https = require('https')

const agent = new https.Agent()
agent.options.ca = fs.readFileSync('./cert/rootCA.pem', 'utf8')

const options = {
  key: fs.readFileSync('./cert/local.key', 'utf8'),
  cert: fs.readFileSync('./cert/local.crt', 'utf8')
}

const proxy = new httpProxy.createProxyServer({
  target: 'https://localhost.meetsocial.cn:9991',
  cookiePathRewrite: {
    '/api/aa/bb/cc': '/'
  },
  cookieDomainRewrite: {
    'localhost.meetsocial.cn': 'david.cn'
  },
  changeOrigin: true,
  ssl: options,
  agent,
  secure: true
})

proxy.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  })
  res.end(err.toString())
})

https
  .createServer(options)
  .on('request', function (req, res) {
    const { url } = req
    if (url.indexOf('/api/') > -1) {
      proxy.web(req, res)
    } else {
      res.end('proxy proxy get get')
    }
  })
  .listen(1111)
```

#### B 的代码

```javascript
if (method === 'POST') {
  // myUrl.hostname 为 localhost.meetsocial.cn
  // url 为 /api/aa/bb/cc
  res.setHeader('Set-Cookie', [
    `a=1; domain=${myUrl.hostname}; path=${url}`,
    `b=2; domain=${myUrl.hostname}; path=${url}`
  ])
  handlePOST(req, res)
  return
}
```

#### B 打印的 header

```
method:  POST
url:  /api/aa/bb/cc
headers:  {
  'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'accept-encoding': 'gzip, deflate, br',
  referer: 'https://david.cn:1111/',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  origin: 'https://david.cn:1111',
  accept: '*/*',
  'content-type': 'application/json',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
  'sec-fetch-dest': 'empty',
  'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '13',
  connection: 'keep-alive',
  host: 'localhost.meetsocial.cn:9991'
}
```

若 A 的控制台直接请求 B, `postData('https://localhost.meetsocial.cn:9991/api/aa/bb/cc')`,
返回头如下, 和代理转发的返回头唯一的区别是 `sec-fetch-site` 字段。

```
method:  POST
url:  /api/aa/bb/cc
headers:  {
  host: 'localhost.meetsocial.cn:9991',
  connection: 'keep-alive',
  'content-length': '13',
  pragma: 'no-cache',
  'cache-control': 'no-cache',
  'sec-fetch-dest': 'empty',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
  'content-type': 'application/json',
  accept: '*/*',
  origin: 'https://david.cn:1111',
  'sec-fetch-site': 'cross-site',
  'sec-fetch-mode': 'cors',
  referer: 'https://david.cn:1111/',
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8'
}
```
