# XSS 攻击

## 1. 什么是 XSS

Cross-Site Scripting（跨站脚本攻击）简称 XSS，是一种代码注入攻击。攻击者通过在目标网站上注入恶意脚本，使之在用户的浏览器上运行。利用这些恶意脚本，攻击者可获取用户的敏感信息如 Cookie、SessionID 等，进而危害数据安全。

## 2. XSS 分类

### 1. 存储型 XSS

例子(nodejs):

```javascript
const http = require("http");
const server = http.createServer();

server.on("request", function (req, res) {
  res.setHeader("Content-Type", "text/html;charset=utf-8");
  // 从数据库里拿出用户发表的内容
  const sqlCnt = "<script>console.log(1)</script>";
  const html = `<!DOCTYPE html><html>
    <body>
      我发表了内容:
      xxxx
      ${sqlCnt}
    </body>
  </html>`;
  res.write(html);
  res.statusCode = 200;
  res.end();
});

server.listen("8888");
console.log("Server is running at: http://localhost.meetsocial.cn:8888");
```

攻击步骤：

1. 攻击者将恶意代码提交到目标网站的数据库中。
2. 用户打开目标网站时，网站服务端将恶意代码从数据库取出，拼接在 HTML 中返回给浏览器。
3. 执行了恶意代码里的脚本。

常见于用户保存数据的网站功能, 比如**论坛发帖、商品评论、用户私信**。

比如你发表了一个帖子里面有恶意代码，然后管理员登录管理员后台，审核查看帖子内容，帖子里的内容有脚本执行，窃取了网站的 cookie，这样坏人就可以用管理员进行登录了。

### 2. 反射型 XSS

例子(nodejs):

```javascript
// 网站搜索例子
// 打开: http://localhost:8888/?s="><script>alert(1)</script>
const http = require("http");
const server = http.createServer();
const url = require("url");

server.on("request", function (req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html;charset=utf-8");
  const obj = url.parse(req.url, true);
  const query = obj.query;
  const html = `<!DOCTYPE html><html>
    <body>
    当前搜索的内容是: <input type="text" value="${query.s || ""}" />
    </body>
  </html>`;
  res.write(html);
  res.end();
});

server.listen("8888");
console.log("Server is running at: http://localhost.meetsocial.cn:8888");
```

攻击步骤：

1. 攻击者构造出特殊的 URL, 其中包含恶意代码。
2. **攻击者诱导用户打开带有恶意代码的 URL**，网站服务端将恶意代码从 URL 中取出，拼接在 HTML 中返回给浏览器。
3. 执行了恶意代码里的脚本。

常见 网站搜索、跳转等。网站跳转代码例子:

```php
// 网站跳转
<?php
echo "<script>window.location.href = $_GET['url']</script>";
?>
```

### 3. DOM 型 XSS

例子(nodejs):

```javascript
//打开: http://localhost.meetsocial.cn:8888/?t=<img src='1' onerror='alert(1)' />

const http = require("http");
const server = http.createServer();
server.on("request", function (req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html;charset=utf-8");
  const html = `<!DOCTYPE html><html>
    <body>
    哈哈哈哈~
    <div id='tttt'></div>
    <script>
    document.getElementById("tttt").innerHTML=decodeURIComponent(location.search.substr(3));
    </script>
    </body>
  </html>`;
  res.write(html);
  res.end();
});

server.listen("8888");
console.log("Server is running at: http://localhost.meetsocial.cn:8888");
```

攻击步骤：

1. 攻击者构造出特殊的 URL。
2. **攻击者诱导用户打开带有恶意代码的 URL**。
3. 前端 JavaScript 取出 URL 中的恶意代码并执行。

## 3. xss 预防

### 1.预防存储型和反射型 XSS 攻击(服务端)

1.改成纯前端渲染，把代码和数据分隔开。
就是数据都是通过 ajax 获得的数据，然后进行页面渲染。

2.对 HTML 做充分转义。
使用常用的模板引擎，如 doT.js、ejs、FreeMarker 等。例如 Java 工程里，常用的转义库为 org.owasp.encoder。

### 2.预防 DOM 型 XSS 攻击(客户端)

使用.innerHTML、.outerHTML、document.write()小心, **不要把不可信的数据作为 HTML 插到页面上**，而应尽量使用 .textContent、.setAttribute()

使用 Vue/React 技术栈时，使用 v-html/dangerouslySetInnerHTML 功能。

下面的代码都可以执行字符串, 所以如果把**不安全的数据传递给这些 API**，很容易产生安全隐患。

```html
<!-- 内联事件监听器中包含恶意代码 -->
<img onclick="UNTRUSTED" onerror="UNTRUSTED" src="data:image/png," />

<!-- 链接内包含恶意代码 -->
<a href="UNTRUSTED">1</a>

<script>
  // setTimeout()/setInterval() 中调用恶意代码
  setTimeout("UNTRUSTED");
  setInterval("UNTRUSTED");

  // location 调用恶意代码
  location.href = "UNTRUSTED";

  // eval() 中调用恶意代码
  eval("UNTRUSTED");
</script>
```

总结一句话：执行可变的数据的 js 代码的时候一定要注意。

## 4. xss 遇到实际遇到的例子

1. wifi 打开的 http，会发现有广告，有广告说明也受到了 XSS 攻击, 而 https 就不会有这个问题。
2. 为什么银行网站需要 2 次输入密码 来查看相关余额，也是为了安全, 防止之前受到了 xss 攻击。
3. [香港书城网上商店 XSS 攻击](https://www.hkbookcity.com/searchbook3.php?startnum=1&txtkeyword=%22%3E%3Cscript%3Ealert%28document.cookie%29%3B%3C%2Fscript%3E%28%AE%D1%A6W%A9%CEISBN%29&btnK=%26%23160%3B%26%23160%3B%A7%E4%AE%D1%26%23160%3B%26%23160%3B&key=smart)(请勿做违法的事)

:::tip 参考地址
<https://cloud.tencent.com/developer/article/1410405>
:::
