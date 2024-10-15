# 数据的流式获取

平时写 `fetch` 函数的时候, 有 2 次 await, 它们的作用如下:

1. 第 1 次 `await` 等待的是服务器的**响应头**到达客户端
2. 第 2 次 `await` 等待**所有的响应体**全部到达客户端

目前是等待所有的数据都到达客户端了以后再输出, 那么会耗费比较多时间。

```ts
const url = "http://localhost:3000/";
async function http() {
  // 第一次
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });
  // 第二次
  const data = await resp.text();
  console.log(data);
}
http();
```

所以可以改造成服务端给我一块内容, 我就显示一块内容, 这就是数据的流式获取。

```vue
<script setup lang="ts">
import { ref } from "vue";

const text = ref("");

async function http(url: string, content: string) {
  // 第一次
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content })
  });
  // 第二次
  const reader = resp.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder(); // 定义一个文字解码器
  while (1) {
    const { done, value } = await reader.read(); // value 是一个字节数组
    if (done) {
      break;
    }
    const newValue = decoder.decode(value);
    text.value += newValue;
  }
}

const url = "http://localhost:3000/";
const content = `乌鸦想，把水瓶撞倒，就可以喝到水了。于是，它从高空往下冲，猛烈撞击水瓶。可是水瓶太重了，乌鸦用尽全身的力气，水瓶仍然纹丝不动。`;
http(url, content);
</script>

<template>
  <div>{{ text }}</div>
</template>
```

`nodejs` 代码如下:

```js
const http = require("http");

const port = 3000;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin); // 允许跨域
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
    return;
  }
  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const { content } = JSON.parse(body);

        // 设置响应头
        res.writeHead(200, {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
          "Access-Control-Allow-Origin": "*"
        });

        // 将内容分割成小块
        const chunks = content.split("");

        // 使用 setInterval 模拟流式传输
        let index = 0;
        const intervalId = setInterval(() => {
          if (index < chunks.length) {
            res.write(chunks[index]);
            index++;
          } else {
            clearInterval(intervalId);
            res.end();
          }
        }, 10); // 每10毫秒发送一个字符
      } catch (error) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid JSON");
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}/`);
});
```
