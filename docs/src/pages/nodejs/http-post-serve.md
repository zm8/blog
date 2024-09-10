# Node.js 创建 POST 请求的 HTTP 服务器

## 1. 本地创建处理 post 请求的服务器

文件保存在 `code/node/post.js`

```javascript
const http = require('http')
const qs = require('querystring')

/*
    创建服务器调用 http.createServer();
    服务器每次收到 http 请求后都会调用这个回调函数,
*/
const server = http.createServer().on('request', (req, res) => {
  console.log(req.method)
  console.log(req.headers)

  const { method, headers } = req
  const { origin } = headers

  origin && res.setHeader('Access-Control-Allow-Origin', origin) // 允许跨域
  // 若fetch content-type 为 application/json, 则需要处理 OPTIONS, 返回预检头
  if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.end()
    return
  }

  // req.method 查看用的是哪个 HTTP 方法
  switch (req.method) {
    case 'POST':
      getData(req, function (data) {
        showPost(res, data)
      })
      break
  }
})

server.listen(3000)
console.log('接收post请求 http://locahost:3000')

function getData(req, callback) {
  var body = ''
  /*
        默认情况下, data 事件会提供 Buffer 对象,
        这是 Node 版的字节数组。
        而对于文本格式, 并不需要二进制, 所以将编码设置为 utf8
    */
  req.setEncoding('utf8')
  // 要得到整个字符串, 可以将所有的数据块拼接到一起, 直到表明请求已经完成的 end 事件被发射出来
  req.on('data', (chunk) => {
    body += chunk
  })
  req.on('end', () => {
    console.log('body:', body)
    try {
      /*
        若 body 格式是 '{"a": 1, "b": 2}',
        对应 fetch 的Content-Type 为 application/json,
        parse 后变成 {a: 1, b: 2}
      */
      body = JSON.parse(body)
      console.log('JSON.parse', body)
    } catch (e) {
      /*
        若 body 格式是 "a=1&b=2",
        对应 fetch 的Content-Type 为 application/x-www-form-urlencoded,
        parse 后变成 {a: 1, b: 2}
      */
      body = qs.parse(body)
      console.log('qs.parse', body)
    }
    callback(body)
  })
}

function showPost(res, data = {}) {
  data = JSON.stringify(data)
  res.setHeader('Contenty-Type', 'application/json;charset=utf-8')
  res.statusCode = 200
  res.end(data)
}
```

### 2. nodejs 发送 post 请求

文件保存在 `code/node/post_send.js`

保存下面的代码为 `post.js` 并且执行

```bash
> node post.js # 返回{"a":"1","b":"2"}
```

```javascript
const http = require('http')

const options = {
  host: '127.0.0.1',
  port: '3000',
  path: '/',
  method: 'POST',
  timeout: 20 * 1000 // 设置超时时间
}

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`)
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
  res.setEncoding('utf8')

  let data = ''
  res
    .on('data', (chunk) => {
      data += chunk
    })
    .on('end', () => {
      console.log('\n=====end=====\n')
      console.log(data)
    })
})

req.on('timeout', () => {
  req.abort() // 中止
})

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`)
})

/*
  相当于前端fetch:
  fetch('http://localhost:3000', {
    body: JSON.stringify({ a: 1, b: 2 }),
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
    },
    cache: 'no-cache',
    method: 'POST',
    mode: 'cors',
  })
*/
const postData = JSON.stringify({ a: 1, b: 2 })

/*
  或写成:
  const postData = "a=1&b=2";
  const postData = require('querystring').stringify({a: 1, b:2})
  
  相当于前端fetch:
  fetch('http://localhost:3000', {
    body: "a=1&b=2",
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    cache: 'no-cache',
    method: 'POST',
    mode: 'cors',
  })
*/

req.write(postData)
req.end()
```
