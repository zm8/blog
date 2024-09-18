# CSRF 攻击

## 1. 什么是 CSRF

CSRF（Cross-site request forgery）跨站请求伪造：攻击者诱导受害者进入第三方网站，在第三方网站中，向被攻击网站发送跨站请求。利用受害者在被攻击网站已经获取的注册凭证，来执行某项操作。

## 2. CSRF 分类

### 1.GET 类型的 CSRF

可以完美避过跨域问题

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>csrf_1</title>
  </head>
  <body>
    <img src="http://localhost.meetsocial.cn:8888/update?amount=1111" />
  </body>
</html>
```

### 2. POST 类型的跨域问题

使用 iframe 页面不会跳转, 更加隐藏

```html
<html>
  <head>
    <meta charset="utf-8" />
    <title>csrf_2</title>
  </head>
  <body>
    <iframe src="csrf_iframe.html"></iframe>
  </body>
</html>
```

csrf_iframe.html:

```html
<html>
  <head>
    <meta charset="utf-8" />
    <title>csrf_2</title>
  </head>
  <body>
    <form method="POST" action="http://localhost.meetsocial.cn:8888/update">
      <input type="hidden" name="amount" value="2222" />
    </form>
    <script>
      document.forms[0].submit();
    </script>
  </body>
</html>
```

### 3. 链接类型的 CSRF

```html
<html>
  <head>
    <meta charset="utf-8" />
    <title>csrf_3</title>
  </head>
  <body>
    <a href="http://localhost.meetsocial.cn:8888/update?amount=1234" target="_blank">重磅消息</a>
  </body>
</html>
```

## 3. CSRF 的特点

1. 攻击一般发起在**第三方网站**，而不是被攻击的网站。
2. 攻击利用受害者在被攻击网站的**登录凭证**(所以有时**隐私浏览器访问**也比较安全)，冒充受害者提交操作。
3. 整个过程攻击者**并不能获取到受害者的登录凭证**，仅仅是“冒用”。

CSRF 攻击有着如下的流程：

1. 受害者登录 a.com，并保留了登录凭证（Cookie）。
2. 攻击者引诱受害者访问了 b.com。
3. a.com 验证凭证正确, 最终攻击完成。

## 4. 防护策略

### 1. 同源检测

CSRF 大多来自第三方网站, 直接禁止外域，所以可根据 **Referer Header** 来判断。

这种方法并非万无一失，Referer 的值是由浏览器提供的，虽然 HTTP 协议上有明确的要求，但是每个浏览器对于 Referer 的具体实现可能有差别，并不能保证浏览器自身没有安全漏洞。使用验证 Referer 值的方法，就是把安全性都依赖于第三方（即浏览器）来保障，从理论上来讲，这样并不是很安全。在部分情况下，攻击者可以隐藏，甚至修改自己请求的 Referer。

同源验证是一个相对简单的防范方法，能够防范绝大多数的 CSRF 攻击。但这并不是万无一失的，对于安全性要求较高，或者有较多用户输入内容的网站，我们就要对关键的接口做额外的防护措施。

### 2. CSRF Token

攻击者无法直接窃取到用户的信息（Cookie，Header，网站内容等），仅仅是冒用 Cookie 中的信息。

服务器通过校验请求是否携带正确的 Token，来把正常的请求和攻击的请求区分开，也可以防范 CSRF 的攻击。

攻击分为 3 个步骤：

1. 将 CSRF Token 输出到页面中
   服务器采用 Encrypted Token Pattern，给用户生成一个 Token，通常是使用 UserID、时间戳和随机数，通过加密的方法生成。

2. 页面提交的请求携带这个 Token
   对于 GET 请求，Token 将附在请求地址之后，这样 URL 就变成 <http://url?csrftoken=tokenvalue。>
   而对于 POST 请求来说，要在 form 的最后加上：<input type=”hidden” name=”csrftoken” value=”tokenvalue”/>

3. 服务器验证 Token 是否正确
   先解密 token，Token 中包含的 UserID 和时间戳将会被拿来被验证有效性，将 UserID 与当前登录的 UserID(我想登录的 UserID 应该是放在 session 中)进行比较，并将时间戳与当前时间进行比较。

总结:
Token 是一个比较有效的 CSRF 防护方法，只要页面没有 XSS 漏洞泄露 Token，那么接口的 CSRF 攻击就无法成功。

但是此方法的实现比较复杂，需要给每一个页面都写入 Token（前端无法使用纯静态页面），每一个 Form 及 Ajax 请求都携带这个 Token，后端对每一个接口都进行校验，并保证页面 Token 及请求 Token 一致。

> 验证码和密码其实也可以起到 CSRF Token 的作用哦，而且更安全，
> 虽然有的时候比较繁琐。这也是为什么很多银行等网站会要求已经登录的用户在转账时再次输入密码。

### 3. 双重 Cookie 验证

在会话中存储 CSRF Token 比较繁琐, 另一种防御措施是使用双重提交 Cookie。

#### 1. 步骤:

1. 在用户访问网站页面时，服务端向请求域名注入一个 Cookie，内容为随机字符串（例如 csrfcookie=v8g9e4ksfhw）。
2. 在前端向后端发起请求时，取出 Cookie，并添加到 URL 的参数中（接上例 POST <https://www.a.com/comment?csrfcookie=v8g9e4ksfhw）。>
3. 后端接口验证 Cookie 中的字段与 URL 参数中的字段是否一致，不一致则拒绝。

#### 2. 总结:

优点:

1. **无需存储 Session**，Token 储存于客户端中，没有服务器压力，易于实施。
2. 前端请求可以统一写(每个请求都带上 csrfcookie)，服务端也可以统一校验，而不需要一个个接口和页面添加。

缺点:

1. Cookie 中增加了额外的字段。
2. 如果有其他漏洞（例如 XSS），攻击者可以注入 Cookie，那么该防御方式失效。
3. 网站使用 HTTPS 的方式，防止 cookie 被拦截。

### 3.Samesite Cookie

#### 1. Strict

完全禁止第三方 Cookie，跨站点时，任何情况下都不会发送 Cookie。

但是当前页面发送跨子域请求时, 携带 cookie 还是可以的, 打开本页面控制台输入如下代码:
(假设当前页面地址是 <http://local.meetsocial.cn:8888>)

```javascript
// 调用跨子域 接口
fetch("http://david.meetsocial.cn:8888/update", {
  body: JSON.stringify({ amount: 2 }),
  credentials: "include",
  method: "POST"
});
```

服务端设置:

```javascript
if (req.headers.origin) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
}
```

#### 2. Lax

Chrome 计划将 Lax 变为默认设置。
**设置 Lax 并且所有接口都用 POST 的方式**，就基本可以防范 CSRF 的攻击。

| 请求类型  | 示例                                     | 正常情况    | Lax         |
| --------- | ---------------------------------------- | ----------- | ----------- |
| 链接      | &lt;a href="...">&lt;/a&gt;              | 发送 Cookie | 发送 Cookie |
| 预加载    | &lt;link rel="prerender" href="..."/&gt; | 发送 Cookie | 发送 Cookie |
| GET 表单  | &lt;form method="GET" action="..."&gt;   | 发送 Cookie | 发送 Cookie |
| POST 表单 | &lt;form method="POST" action="..."&gt;  | 发送 Cookie | 不发送      |
| iframe    | &lt;iframe src="..."&gt;&lt;/iframe&gt;  | 发送 Cookie | 不发送      |
| AJAX      | $.get("...")                             | 发送 Cookie | 不发送      |
| Image     | &lt;img src="..."&gt;                    | 发送 Cookie | 不发送      |

#### iframe 解释

比如域名 `localhost.com` 嵌套了一个 iframe `<iframe src='http://david.cn'></iframe>`, `david.cn` 里有个 cookie 的 domain 是 david.cn, 而 iframe 又是 get 请求, 默认情况下 `http://david.cn` 能拿到这个 cookie 加载内容, 但是若 cookie 设置 Lax 属性, 那么这个 cookie 是无效的, iframe 就加载不了`david.cn` 里面的内容。

#### 3. None

显式关闭 SameSite 属性，可将其设为 None。

将来谷歌计划要使 None 设置生效，必须同时设置 Secure 属性（**让 Cookie 只能通过 HTTPS 协议发送**）。
目前下面的代码, 没有设置 Secure 属性控制台会有警告:

```javascript
document.cookie = "aaa=111;SameSite=None;";
```

> A cookie associated with a resource at <http://test-sso.meetsocial.cn/> was set with `SameSite=None` but without `Secure`. **A future release of Chrome will only deliver cookies marked `SameSite=None` if they are also marked `Secure`**. You can review cookies in developer tools under Application>Storage>Cookies and see more details at <https://www.chromestatus.com/feature/5633521622188032>.

所以必须像下面这样设置:

```javascript
document.cookie = "bbb=2222;SameSite=None; Secure";
```

结论:

1. 建议网站的 cookie **设置 Lax 并且所有接口都用 POST 的方式**，这样可以防范大多数的攻击。
   虽然 **链接类型的 CSRF** 可以攻击 Lax, 但是他调用接口的方式是 GET。

2. 目前 SameSite 设置 Strict, Lax, None 都支持当前页面发送跨子域请求 携带 cookie, 当前 Chrome 版本 83, 以前 Chrome 版本待考证，其它浏览器的兼容性有待考证。

3. 虽然设置 Strict 也支持携带 cookie, 但是从`<a href='页面A'></a>`链接 或者 从搜索引擎点击进到的页面 A，这个 cookie 会丢失, 并且就算此时再刷新(或强制刷新)这个页面, cookie 也还是丢失, 这样用户登录态就会丢失了, 所以不太推荐过多使用。

## 总结

### 1. CSRF 的攻击可以来自

1. 攻击者自己的网站。
2. 有文件上传漏洞的网站。
3. 第三方论坛等用户内容。
4. 被攻击网站自己的评论功能等。(直接提交表单评论, 所以验证码也是)。

### 2. 如何防止自己的网站被利用成为攻击的源头呢

1. 严格管理所有的上传接口，防止任何预期之外的上传内容（例如 HTML）。
2. 添加 Header X-Content-Type-Options: nosniff 防止黑客上传 HTML 内容的资源（例如图片）被解析为网页。-- 待考证
3. 对于用户上传的图片，进行转存或者校验。不要直接使用用户填写的图片链接。
4. 当前用户打开其他用户填写的链接时，需告知风险（这也是很多论坛不允许直接在内容中发布外域链接的原因之一，不仅仅是为了用户留存，也有安全考虑）。

### 3. 防护策略

1. CSRF 自动防御策略：**同源检测（Origin 和 Referer 验证）**。
2. CSRF 主动防御措施：**Token 验证 或者 双重 Cookie 验证 以及配合 Samesite Cookie**。
3. 保证页面的幂等性，**后端接口不要在 GET 页面中做用户操作**。

:::tip 参考地址
<https://cloud.tencent.com/developer/article/1406118>
<https://www.ruanyifeng.com/blog/2019/09/cookie-samesite.html>
:::
