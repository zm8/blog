# 如何跨站传递数据

## 1. 跨域资源共享（CORS）

## 2. JSONP（JSON with Padding）

## 3. 服务器代理

在不同源之间传递数据时，可以设置一个服务器代理，充当中介，将数据从一个源传递到另一个源。客户端与代理服务器通信，代理服务器再与不同源的服务器通信，然后将数据传递回客户端。这种方法可以控制数据的传递，并提供额外的安全性。

## 4. postMessage 通信

1. 启动本地服务器

```
> http-server -c-1 ./
```

2. 浏览器打开页面: http://ming.cn:8080

**注意**: 父页面和子页面不同域的话，则监听不到子页面的 onload 事件, 只能用 setTimeout 模拟

### 不同域情况

父页面地址是: `http://ming.cn:8080/`
子页面地址是: `http://david.cn:8080/child.html`

父页面代码:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Parent</title>
  </head>
  <body>
    <button id="btn">点击打开新页面</button>
    <script>
      window.addEventListener('message', (e) => {
        console.log('父接收数据:', e.data)
      })
      btn.onclick = function () {
        const p = window.open('http://david.cn:8080/child.html')
        setTimeout(() => {
          console.log('loaded====')
          p.postMessage('父=====>子', 'http://david.cn:8080')
        }, 2000)
      }
    </script>
  </body>
</html>
```

子页面代码:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Child</title>
  </head>
  <body>
    <button id="btn">点击传输数据</button>
    <script>
      window.addEventListener('message', function (e) {
        console.log('子接收数据:', e.data)
      })
      btn.onclick = () => {
        window.opener.postMessage('子=====>父', 'http://ming.cn:8080')
      }
    </script>
  </body>
</html>
```

### 同域情况

父页面地址是: `http://david.cn:8080/`
子页面地址是: `http://david.cn:8080/child.html`

父页面代码:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Parent</title>
  </head>
  <body>
    <button id="btn">点击打开新页面</button>
    <script>
      window.addEventListener('message', (e) => {
        console.log('父接收数据:', e.data)
      })
      btn.onclick = function () {
        const p = window.open('http://david.cn:8080/child.html')
        // 打开的子页面同域名, 则监听的到 load 事件
        p.addEventListener('load', () => {
          console.log('loaded====')
          p.postMessage('父=====>子', 'http://david.cn:8080')
        })
      }
    </script>
  </body>
</html>
```

子页面代码:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Child</title>
  </head>
  <body>
    <button id="btn">点击传输数据</button>
    <script>
      window.addEventListener('message', function (e) {
        console.log('子接收数据:', e.data)
      })
      btn.onclick = () => {
        window.opener.postMessage('子=====>父', 'http://david.cn:8080')
      }
    </script>
  </body>
</html>
```

## 5.iframe 通信

步骤:

1. 启动本地服务器

```
> http-server -c-1 ./
```

2. 浏览器打开页面: http://ming.cn:8080

父页面:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Parent</title>
  </head>
  <body>
    <iframe
      src="http://david.cn:8080/child.html"
      frameborder="1"
      width="100%"
      height="500px"
      id="Bframe"
    ></iframe>
    <button id="btn">点击传输数据</button>
    <script>
      window.addEventListener('message', (e) => {
        console.log('父接收数据:', e.data)
      })
      btn.onclick = function () {
        const frame = window.frames[0]
        frame.postMessage('父=====>子', 'http://david.cn:8080')
      }
    </script>
  </body>
</html>
```

子页面:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Child</title>
  </head>
  <body>
    <button id="btn">点击传输数据</button>
    <script>
      btn.onclick = function () {
        window.top.postMessage('子=====>父', 'http://ming.cn:8080')
      }
      window.addEventListener('message', (e) => {
        console.log('子接收数据:', e.data)
      })
    </script>
  </body>
</html>
```
