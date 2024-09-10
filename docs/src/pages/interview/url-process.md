# 在浏览器地址栏输入一个 URL 发生了什么？

## http 过程

1. 浏览器对用户输入的网址做检查，"zhi hu.com" 或 "zhi@hu.com1", 这些网址都是非法无效的。

2. 首先要知道 IP 地址，先查浏览器内存里的 DNS Cache 和本机的 host，若没有，则联系自己的 DNS 服务器 8.8.8.8，DNS 联系 TCP/IP 协议里面的 UDP, UDP 在发送的包裹上标记好地址以后，由 IP 司机销货, IP 司机需要 ARP(是根据 IP 地址获取物理地址的一个 TCP/IP 协议) 导航，最后终于到 DNS 服务器，若 DNS 服务器本地缓存里没有，则会联系 根域名服务器，最后会把 IP 地址返回。
3. 根据 IP 地址，联系 TCP/IP 协议里面的 TCP, 首先进行 3 次握手(需要 IP 司机来回 3 次)，握手成功之后由 IP 司机把包裹送到对方那里。

## https 过程

若是 https, 唯一区别是 安全传输层协议（TLS）会把浏览器仍给自己的包裹加密。
如何加密呢？

1. 首先会通过 TCP 和对方进行握手。
2. 握手成功后，TLS 会和 TLS 服务器沟通算法和当前版本是否支持。
3. 接着 TLS 服务器 提供数字证书，然后 TLS 检验证书有效性。
4. 最后 TLS 得到 zhihu.com 的公钥，根据公钥加密一段随机的字符串，还有之前沟通的算法就可以给包裹加密了。

## 具体各个步骤

1. DNS 域名解析；
2. 建立 TCP 连接, 3 次握手。
3. 握手成功后, 发送 HTTP 请求；
4. 服务器处理请求；
5. 返回响应结果；
6. 关闭 TCP 连接；
7. 浏览器解析 HTML 代码，并请求 html 代码中的资源(如 js, css, 图片等)；
8. 浏览器布局渲染；

## 一、DNS 域名解析

DNS 是个协议,一种专门用来将域名转换为 IP 地址的协议,提供该协议服务的服务器就叫 DNS 服务器。
大致经过以下几个步骤:

- 查询 浏览器内存里的 DNS Cache
- 查询 本机的 host 文件
- 查询 路由器中的 DNS 缓存
- 查询 ISP(互联网服务提供商,例如电信,移动)中的 DNS 服务器
- 查询 根域名服务器
  ![image](https://user-images.githubusercontent.com/32337542/56418206-d51dec00-62c8-11e9-90c1-3782cc28ae9e.png)

## 二、建立 TCP 链接

三次握手:

- 客户端发送一个带有 SYN 标志的数据包给服务端。
- 服务端收到后，回传一个带有 SYN/ACK 标志的数据包以示传达确认信息。
- 最后客户端再回传一个带 ACK 标志的数据包，代表握手结束，连接成功。

可以这么理解：

- 客户端：“你好，在家不，有你快递。”
- 服务端：“在的，送来就行。”
- 客户端：“好嘞。”

![image](https://user-images.githubusercontent.com/32337542/56418234-e830bc00-62c8-11e9-9740-ede90bd002e7.png)

## 三、发送 HTTP 请求

- 生成针对目标 web 服务器的 http 请求报文
- 将 HTTP 请求报文分割成报文段
- 由 IP 协议 发送报文

## 四、服务器处理请求

1. 服务器端根据路由将 url 中的地址进行重定向到服务器程序上的目标文件。
2. 此处涉及到后台的 MVC 架构,大致如下:
   URL 中的文件地址部分经过服务器上的路由程序重定向到对应的控制器(controller)对象, 控制器对象根据 URL 中指定的操作执行相关的逻辑并调用目标数据的模型(Model)对象,模型对象与数据库交互完成目标操作后,控制器将模型中反馈的数据填充到视图中。
3. 视图部分(通常是 HTML 页面)作为 HTTP 响应发送到浏览器端。
   ![image](https://user-images.githubusercontent.com/32337542/56418368-537a8e00-62c9-11e9-99ad-c431c57a6c28.png)

## 五、返回响应结果

在响应结果中都会有个一个 HTTP 状态码如下：

| 请求 | 状态码                         | 描述                         |
| ---- | ------------------------------ | ---------------------------- |
| 1xx  | Informational(信息性状态码)    | 接收的请求正在处理           |
| 2xx  | Success(成功状态码)            | 请求正常处理完毕             |
| 3xx  | Redirection(重定向状态码)      | 需要进行附加的操作以完成请求 |
| 4xx  | Client Error(客户端错误状态码) | 服务器处理请求出错           |

1xx 状态码举例如下：
`101 Switching Protocol`（协议切换）状态码表示服务器应客户端升级协议的请求（**Upgrade 请求头**）正在进行协议切换。

![image](https://user-images.githubusercontent.com/32337542/56419462-e2d57080-62cc-11e9-9b7f-902f1f164c9a.png)

### 六、关闭 TCP 连接

为了避免服务器与客户端双方的资源占用和损耗，当双方没有请求或响应传递时，任意一方都可以发起关闭请求。需要 4 次握手。
![image](https://user-images.githubusercontent.com/32337542/56418472-90468500-62c9-11e9-8de1-49c99bbd921c.png)

上图可以这么理解：
客户端：“兄弟，我这边没数据要传了，咱关闭连接吧。”
服务端：“收到，我看看我这边有木有数据了。”
服务端：“兄弟，我这边也没数据要传你了，咱可以关闭连接了。”
客户端：“好嘞。”

### 七、浏览器解析 HTML

浏览器通过解析 HTML，生成 DOM 树，解析 CSS，生成 CSS 规则树，然后通过 DOM 树和 CSS 规则树生成渲染树。

### 八、浏览器布局渲染

HTML 默认是流式布局的，CSS 和 js 会打破这种布局，改变 DOM 的外观样式以及大小和位置。进行 重绘 repaint 和 回流 reflow。