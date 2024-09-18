# 网络相关

## SSE(Server-Sent Events) 和 websocket 的区别

- WebSocket 更强大和灵活。因为它是全双工通道，可以双向通信；SSE 是单向通道，只能服务器向浏览器发送。
- SSE 使用 HTTP 协议，现有的服务器软件都支持。WebSocket 是一个独立协议。
- SSE 属于轻量级，使用简单；WebSocket 协议相对复杂。
- SSE 默认支持断线重连，WebSocket 需要自己实现。
- SSE 一般只用来传送文本，二进制数据需要编码后传送，WebSocket 默认支持传送二进制数据。
- SSE 支持自定义发送的消息类型。

## fetch 和 pull 区别

git 有 3 个目录:

1. 本地工作目录: 就是正在编辑的工作目录
2. 本地仓库: 就是 `git commit` 之后的仓库
3. 远程仓库: 远程服务器上存储的仓库

`git fetch` 它是把远程提交拉取到**本地仓库**，而不是**本地工作目录**;
`git pull` 则相当于运行`git fetch`，然后立即将你的改动合并到**本地仓库**;

:::tip 参考地址
<https://www.zhihu.com/question/38305012>
:::

## 强缓存 和 协商缓存

### 强缓存

从本地资源获取，不再请求服务端资源。

1. 第 1 次请求服务端资源，服务端返回 `cache-control: max-age=200`(注意单位是秒)
2. 第 2 次请求服务端资源，如果时间还没过期, 则直接从本地缓存里面读取，返回 `200 from disk cache`

### 协商缓存

和服务器协商，服务器根据 Etag 返回 304 或者 200。Etag 是资源的唯一标识。

1. 如果 max-age 的秒已经失效了, 那么浏览器请求服务端会携带 `If-None-Match:W/"10-18b811fd103"`
2. 如果资源没有发生变化，服务端返回 304 和 Etag，否则服务端返回 200 和 新的 Etag。
3. 浏览器从本地缓存里读取资源。

### 示例代码

```js
const express = require("express");
const app = express();

var options = {
  setHeaders: (res) => {
    res.set({
      "Cache-Control": "max-age=10"
    });
  }
};
app.use(express.static(__dirname, options));
app.listen(3000);
```

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>index</title>
  </head>
  <body>
    <script src="1.js"></script>
  </body>
</html>
```

注意：如果想看到 `from disk cache`, 不能直接刷新首页，而是必须新打开浏览器窗口。

:::tip 参考地址
<https://juejin.cn/post/6974529351270268958?searchId=2023102715071669095F9EC5E6DDB360B7>
:::

## https 通俗理解

1. 打开 https 网站
2. 浏览器会安装 数字证书
3. 淘宝向 CA 申请一个证书(包含**淘宝的公钥**和数字签名)。数字签名是对证书的内容 hash 以后，再用 CA 的私钥进行加密，防止证书传输过程被篡改。
4. 浏览器根据第 2 步安装的数字证书的"公钥"对淘宝传送的数字签名进行验签。
5. 然后客户端随机生成对称密钥 R, 用数字证书的里的**服务端的公钥**对 R 进行加密，发送给服务端。
6. 服务端用自己的私钥解密，得到对称密钥 R。
7. 随后双方发送的内容，使用对称密钥 R 进行加密和解密通信内容。

:::tip 参考地址
<https://www.zhihu.com/question/52493697>
:::

## 密码登录和存储

用户名是明文传输，密码是加密传输，那怎么加密传输呢?

1.用户向服务端请求，服务端返回**公钥**给客户端。

2.前端使用 RSA(非对称加密) 加密好之后，发送给客户端。

```js
import JSEncrypt from "jsencrypt";
const encrypt = new JSEncrypt();
encrypt.setPublicKey("公钥");
encrypt.encrypt("登录密码");
// 发送 post 用户名和密码 给服务端
```

3.服务端收到了密码，用私钥进行解密，发现可以解密，说明传输过程正常。

4.服务端把 明文密码和一个随机的字符串(加盐) 拼接在一起，用哈希算法加密，存储在数据库。
注意: 每个密码的盐是不一样的，并且盐会和密码一起存储到数据库，为了后续登录的校验。

:::tip 参考地址
<https://zhuanlan.zhihu.com/p/36603247>
<https://juejin.cn/post/6992424410581827592?searchId=20231021220101B06EAE764EFF6D1343D1>
:::

## session 和 cookie

sessionId 是以 cookie 的形式存储在客户端。
session 是存储在服务端，是以键值对的形式存储。键是 sessionId, 值是 用户的各种信息。
![image](https://github.com/zm8/blog_old/assets/32337542/995a23a3-c787-4df2-857e-4d2ba13d968f)

:::tip 参考地址
<https://juejin.cn/post/7246675998758846522>
:::

## 什么是 Websocket

Websocket 是一个持久化的协议, 经过一次 HTTP 握手，升级成 websocket 协议，支持服务端推送。

## IM 即时通讯的原理

消息通讯的时候，先存储后同步。

1. 消息存储库, 在云端全量保存所有会话的消息。
2. 消息同步库, 对于离线的接收方，拉取同步消息。
3. 对于在线的接收方，会直接选择在线推送。

![image](https://github.com/zm8/blog_old/assets/32337542/fea501cb-c3ef-4497-9159-b15db0009b5f)

:::tip 参考地址
<https://zhuanlan.zhihu.com/p/31377253>
:::

## Http 协议与 TCP 协议简单理解

TCP 协议对应于传输层，而 HTTP 协议对应于应用层。Http 协议是建立在 TCP 协议基础之上的。Http 会通过 TCP 建立起一个到服务器的连接通道，当本次请求需要的数据完毕后，Http 会立即将 TCP 连接断开，这个过程是很短的。所以 Http 连接是一种短连接，是一种无状态的连接。

从 HTTP/1.1 起，默认都开启了 Keep-Alive。当一个网页打开完成后，客户端和服务器之间用于传输 HTTP 数据的 TCP 连接不会关闭，如果客户端再次访问这个服务器上的网页，会继续使用这一条已经建立的连接 Keep-Alive 不会永久保持连接，它有一个保持时间，可以在不同的服务器软件（如 Apache）中设定这个时间。

## 为什么要三次握手?

为了确认客户端和服务端发送和接收都是正常的。
第一次握手（客户端发送 SYN 报文给服务器，服务器接收该报文）：客户端什么都不能确认；服务器确认了对方发送正常，自己接收正常

第二次握手（服务器响应 SYN 报文给客户端，客户端接收该报文）：
客户端确认了：自己发送、接收正常，对方发送、接收正常；

服务器确认了：对方发送正常，自己接收正常

第三次握手（客户端发送 ACK 报文给服务器）：
客户端确认了：自己发送、接收正常，对方发送、接收正常；

服务器确认了：自己发送、接收正常，对方发送、接收正常

## 什么是 Token

简单 token 的组成： uid(用户唯一的身份标识)、time(当前时间的时间戳)、sign（签名，token 的前几位以哈希算法压缩成的一定长度的十六进制字符串）

每一次请求都需要携带 token，需要把 token 放到 HTTP 的 Header 里
基于 token 的用户认证是一种服务端无状态的认证方式，服务端不用存放 token 数据。**用解析 token 的计算时间换取 session 的存储空间**，从而减轻服务器的压力，减少频繁的查询数据库
token 完全由应用管理，所以它可以避开同源策略

token 如何防止被盗用使用?
可以将 JWT 令牌与特定的 IP 地址绑定，以限制令牌的使用。

## 什么是 JWT

JSON Web Token（简称 JWT）是目前最流行的跨域认证解决方案。是一种认证授权机制。
它将用户信息加密到 token 里，服务器不保存任何用户信息。服务器通过使用保存的密钥验证 token 的正确性，只要正确即通过验证。

Token 和 JWT 的区别
相同：都是访问资源的令牌，都是使服务端无状态化

不同: Token 需要查库验证 token 是否有效，而 JWT 不用查库或者少查库，直接在服务端进行校验，并且不用查库。因为用户的信息及加密信息在第二部分 payload 和第三部分签证中已经生成，只要在服务端进行校验就行，并且校验也是 JWT 自己实现的。

JWT 包含 3 个部分:

- Header 存放加密的算法
- Payload 用户的信息和一些实体
- signature 签名。对 Header 和 Payload 使用密钥进行加密。比如:
  `HMACSHA256( base64UrlEncode(header) + “.” + base64UrlEncode(payload),secret)`

## http 状态码

### 1. 表示消息

101: websocket 或 http2 升级

### 2. 表示成功

- 200 请求成功
- 206 断点续传

### 3. 表示重定向

301: 永久重定向。新域名换旧域名。
302: 临时重定向。用户访问用户中心重定向到登录页面
304: 资源未修改, 客户可以使用本地的资源。

301 和 302 的区别:

- 301 代表资源被永久的挪到新的 url, 302 代表资源被暂时挪到新的 url
- 301 浏览器会缓存重定向的地址，下次再次请求的时候，不会请求服务器，所以适合域名的替换。

### 4. 表示请求错误

404: 服务器找不到资源

### 5. 表示服务器错误

- 500 服务器内部错误
- 503 服务器停机维护时
- 504 网关超时

## http 1.0, 1.1, 2 区别

HTTP/1.0 —— 无状态无连接的应用层协议
HTTP/1.1 —— 长连接。有 **Keep-alive**，不用每次都断开 TCP 连接。并且可以"并行"发送多个请求。
HTTP/2.0 —— 二进制格式 传输数据，请求和响应数据分割为更小的帧，采用二进制编码。服务器推送。

## 前端安全

XSS 攻击
CSRF 攻击
X-Frame-Options: 防止页面被嵌入到 iframe 中。
设置请求头 CSP, 禁止加载外域的代码。
上传一些文件，注意一些上传文件的格式，特别是服务端。

:::tip 参考地址
<https://segmentfault.com/a/1190000039165592>

<https://juejin.cn/post/6844904034181070861?searchId=20230905142008DDB90C9CBBC9C3CB54BD>

<https://vue3js.cn/interview/http/status.html#%E4%BA%8C%E3%80%81%E5%88%86%E7%B1%BB>
:::
