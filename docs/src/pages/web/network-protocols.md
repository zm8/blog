# 学习 HTTP, TCP, UDP, Socket

## 介绍下 7 层网络模型

七层模型，亦称 OSI(Open System Interconnection Model)模型, Interconnection 相互联系的意思, 中文意思是 '开放式系统互联模型'。
常见的几个协议位于第几层:

- 应用层: HTTP, FTP, SMTP(电子邮件客户端)
- 传输层: TCP, UDP
  ![image](https://user-images.githubusercontent.com/32337542/66107727-81dbf380-e5f3-11e9-88a9-3ff54c20081c.png)

## HTTP

超文本传输协议(HyperText Transfer Protocol), 在应用层, 用来封装 HTTP 文本信息，然后使用 TCP/IP 做传输层协议将它发到网络上。
问题来了:

1. 应用数据块如何找到目的地？
2. 服务器回应数据块如何准确无误地返回？
3. 应用数据块在到达目的地之前丢失了，如何处理？
4. 服务器回应数据块旅途中丢失了，如何处理？

问题解决:
1: IP 协议 在应用数据块的外层写上**目的地 IP 地址**, 解决了问题 1;
2: IP 协议 在应用数据块的外层写上**源 IP 地址**, 解决了问题 2;
3: 问题 3 和 4 由 TCP 协议解决

### TCP 的确认机制

TCP 会对发出的数据包（以下简称包裹）进行编号，但为何 TCP 发数据之前需要连接？
双方通过 TCP 连接，**分享彼此的应用数据块第一个字节的原点序号**

分享了原点序列号，即使第二个、第三个数据包先到达目的地，而第一个数据包姗姗来迟的情况，接收方的 TCP 可以耐心等待第一个数据包的到来，然后按序将数据包提交给应用程序。这样应用程序就能明白。

### UDP 协议

有点像街头的邮筒，应用程序的数据包扔进邮筒就好了，就耐心地等待数据包到达目的地。
扔进邮筒前 确认以下的信息:

- 收件人的地址（目的 IP）
- 收件人的姓名（目的端口号）
- 寄件人地址（源 IP）
- 寄件人姓名（源端口号）

#### 应用

实时音视频 可以用 UDP, 我需要实时的看到你的图像跟声音，至于中间丢一帧什么的完全不重要。

如果使用 TCP 导致视频的中间延迟了 0.5 秒，那么后续的视频全都会比发送方延迟 0.5 秒。这种延迟是累加的，随着持续丢帧，延迟会越来越大，达到数秒，甚至分钟级，这会严重影响实时音视频的用户体验。

## TCP 的 3 次握手

### 名字解释

- SYN: synchronous 中文`同步`的意思, 用来建立联机;
- ACK: acknowledgement 中文`确认`的意思
- seq: Sequence Number 序列号
- ack: Acknowledgment Number 确认序列号
- x 和 y 都是一个随机数
- ack 始终等于 seq+1

### 请求过程:

- 第一次握手：建立连接。
  客户端发送标志位 SYN=1, seq=x 给服务端。
- 第二次握手：服务器收到 SYN 报文段。
  服务端收到 SYN 等于 1, 知道是要建立连接, 然后设置标志位 SYN=1, ACK=1, ack=x+1, seq=y, 发送给客户端。
- 第三次握手：客户端收到服务器的 SYN+ACK 报文段。
  客户端检查 ack 是否为 x+1, ACK 是否为 1, 如果正确, 则设置 ack=y+1, 发送给服务端。
  服务端确认 ack 是否为 y+1, ACK 是否为 1, 则表示建立成功。

![image](https://user-images.githubusercontent.com/32337542/66107992-21998180-e5f4-11e9-99f3-fd468f111ef9.png)

## 为什么需要 3 次握手, 而不是 2 次

首先明白为什么至少需要 2 次, 就跟 我们路上碰到一个熟人问候一样。
**连接失败**情况:
例 1:

- 甲: 你吃饭了吗
- 乙: ....(乙带耳机, 没反应)

例 2:

- 甲: 你吃饭了吗
- 乙: 我去上厕所(答非所问, 听不懂)

**连接成功**情况:

- 甲: 你吃饭了吗
- 已: 吃过了
- 甲: 好的

照理说我们听到"已"回答**吃过了**，应该就算双方连接上了，为什么甲还需要回**好的**?
主要为了防止已失效的连接请求报文段突然又传送到了服务端，防止了服务器端的一直等待而浪费资源。

1. A 发送一个请求报文, 由于 在某些网络结点长时间滞留了, 没有发送到 B。
2. A 又发送了一个请求报文, B 收到了, 建立连接。数据传输完毕, 就释放了连接。
3. A 的延误的报文这个时候到达了 B, B 误认为 A 又发出一次新的连接请求, 于是就向 A 发出确认报文段，同意建立连接。
4. 若是 2 次握手, 此时 A 不理睬 B 的确认且不发送数据, B 一直在等待, 浪费了感情。
5. 若是 3 次握手, B 等了一会发现 A 没有理它, 就关闭连接了。

## TCP 的四次挥手

### 名词解释

- FIN: 终结的意思， 用来释放一个连接。当 FIN = 1 时，表明此报文段的发送方的数据已经发送完毕，并要求释放连接。

### 请求过程:

- Client 发送请求告诉 Server, 我没有数据再发给你了。
- Server 收到以后, 回复 你的请求我收到了，我检查下数据都发送完成没有, 请你继续等我的最终消息。
- B 确定数据已经发送完成了, 告诉 Client 端，好了，我这边数据发完了，准备好关闭连接了。
- A 收到 B 的连接释放报文段后，发出确认报文段 并等待 2MSL, 若没有收到回复, 说明 Server 端已经正常关闭了，自己就关闭了。

等待 2MSL 的原因是:

1. 保证 A 发送的最后一个 ACK 报文段能够到达 B。若 B 收不到 A 的最后报文, 则 B 重传 FIN+ACK 报文段, 这时 A 又可以重发 ACK 报文并且 重新启动 2MSL 计时器。
2. 使下一个连接不会出现上一个连接的 "已失效的连接请求报文段"。A 在发送完最后一个 ACK 报文段后，再经过 2MSL，就可以使本连接持续的时间内所产生的所有报文段都从网络中消失。

### 关闭为什么要 4 次挥手

由于 Server 端收到 Client 端关闭请求时, 可能不会立即关闭 SOCKET, 所以先回复一个, "你发的 FIN 报文我收到了"。只有等到我 Server 端所有的报文都发送完了，我才能发送 FIN 报文。

## Socket

TCP/IP 只是一个协议栈，具体实现，需要提供对外的操作接口，这就是 Socket。
Socket 编程接口在设计 不仅使用于 TCP/IP，也适应其他的网络协议。
它的几个最基本的函数接口。比如 create，listen，accept，connect，read 和 write 等等。
下面使用 nodejs 模拟服务端/客户端

### net 模块

模拟服务端 和 客户端

```
> node net_server.js
监听端口
服务端：收到客户端发送数据为: client hello
客户端关闭连接
```

```
> node net_clinet.js
连接到服务器
客户端：收到服务端响应数据为: server hello
断开与服务器的连接
```

net_server.js

```javascript
//tcp服务端
var net = require("net");
var sever = net.createServer(function (connection) {
	//客户端关闭连接执行的事件
	connection.on("end", function () {
		console.log("客户端关闭连接");
	});
	connection.on("data", function (data) {
		console.log("服务端：收到客户端发送数据为:" + data.toString());
	});
	//给客户端响应的数据
	connection.write("server hello");
});

sever.listen(8080, function () {
	console.log("监听端口");
});
```

net_client.js

```javascript
//tcp客户端
var net = require("net");
var client = net.connect({ port: 8080 }, function () {
	console.log("连接到服务器");
});
//客户端收到服务端执行的事件
client.on("data", function (data) {
	console.log("客户端：收到服务端响应数据为:" + data.toString());
	client.end();
});
//给服务端传递的数据
client.write("client hello");
client.on("end", function () {
	console.log("断开与服务器的连接");
});
```
