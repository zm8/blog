# GET 和 POST 的区别

1: 编码类型不同

GET：`application/x-www-form-urlencoded`

POST：`application/x-www-form-urlencoded 或 multipart/form-data`

2：对数据类型的限制

GET: 只允许 ASCII 字符。
POST: 没有限制。也允许二进制数据。

3: GET 和 POST 方法没有实质区别，只是报文格式不同

POST 请求报文第一行: `POST /uri HTTP/1.1`

GET 请求报文第一行: `GET /uri HTTP/1.1`

4: 我们可以在 URL 上写参数，然后方法使用 POST；也可以在 Body 写参数，然后方法使用 GET。当然，这需要服务端支持。

5: GET 方法参数

不一定要写成`http://www.example.com?username=chengqm&age=22`

也可以写成
`http://www.example.com/username/chengqm/age/22`

6: POST 和 GET 方法一样不安全, 因为 HTTP 在网络上是明文传输的

7: GET 方法的长度限制是浏览器的行为，为了性能和安全，防止恶意构造长 URL 来攻击
