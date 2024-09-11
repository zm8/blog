# curl 连接网络的问题

curl 的时候如果出现下面的错误:

```bash
curl: (7) Failed to connect to 127.0.0.1 port 4781 after 0 ms: Couldn't connect to server
```

解决方式:

`curl` 有一个配置文件 `~/.curlrc`, 删除里面的内容 `socks5 = "127.0.0.1:4781"`
