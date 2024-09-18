# Eggjs 日志功能

## 1.日志文件介绍

egg 日志的目录在`logs/node_sat` 下面, node_sat 是当前的 package.json 的 name 值。
目录下的文件有:

- node_sat-web.log
- common-error.log
- egg-schedule.log
- egg-web.log
- egg-agent.log

### 1.node_sat-web.log(常用)

开发者使用的日志。
通过 ctx.logger.info，ctx.logger.warn 和 ctx.logger.error 写入。
也可通过 app.logger.info，app.logger.warn 和 app.logger.error 写入。

它们的输出格式区别如下:
ctx.logger

```
2020-04-24 11:31:26,888 INFO 91630 [-/127.0.0.1/-/5ms GET /apps] ctx.logger====info log
2020-04-24 11:31:26,889 WARN 91630 [-/127.0.0.1/-/6ms GET /apps] ctx.logger====warn log
2020-04-24 11:31:26,889 ERROR 91630 [-/127.0.0.1/-/6ms GET /apps] ctx.logger====error log
```

app.logger

```
2020-04-24 11:31:26,889 INFO 91630 app.logger====info log
2020-04-24 11:31:26,889 WARN 91630 app.logger====warn log
2020-04-24 11:31:26,889 ERROR 91630 app.logger====error log
```

日志写入代码:

```javascript
// router
router.get('/apps', controller.home.index);

// controller
async index() {
    const { ctx, app } = this;
    ctx.logger.info('ctx.logger====info log');
    ctx.logger.warn('ctx.logger====warn log');
    ctx.logger.error('ctx.logger====error log');

    app.logger.info('app.logger====info log');
    app.logger.warn('app.logger====warn log');
    app.logger.error('app.logger====error log');
}
```

### 2.common-error.log

所有的错误日志归集, 比如 ctx.coreLogger.error 和 ctx.logger.error 都会走到这里。

### 3.egg-schedule.log

egg 调度日志 log

### 4. egg-web.log

- 框架内核、插件日志的 log
- 也可通过代码写入 `ctx.coreLogger.info, ctx.coreLogger.warn, ctx.coreLogger.error`

### 5.egg-agent.log

agent 进程日志, 可在页面的根目录新建 agent.js

```javascript
"use strict";

// agent.js
module.exports = (agent) => {
  agent.logger.debug("debug info");
  agent.logger.info("启动耗时 %d ms", Date.now());
  agent.logger.warn("warning!");
  agent.logger.error("someErrorObj");
};
```

## 2.日志级别

日志分为 **NONE**，**DEBUG**，**INFO**，**WARN** 和 **ERROR** 5 个级别。
默认只会输出 **INFO** 及以上（**WARN** 和 **ERROR**）的日志到文件中。

配置打印所有级别日志到文件中：

```javascript
// config/config.${env}.js
exports.logger = {
  level: "DEBUG"
};
```

关闭所有日志:

```javascript
// config/config.${env}.js
exports.logger = {
  level: "NONE"
};
```

## 3.日志文件格式

设置输出格式为 JSON, 那么会`logs/node_sat` 里会新建一个文件 `node_sat-web.json.log`

```javascript
// config/config.${env}.js
exports.logger = {
  outputJSON: true
};
```

相同的代码, 对比下 `node_sat-web.log` 和 `node_sat-web.json.log` 的区别:
node_sat-web.json.log

```
{"paddingMessage":"[-/127.0.0.1/-/5ms GET /]","level":"INFO","date":"2020-04-24 16:12:56,825","pid":98385,"hostname":"zhengmingdeMacBook-Pro.local","message":"ctx.logger====info log"}
{"paddingMessage":"[-/127.0.0.1/-/6ms GET /]","level":"WARN","date":"2020-04-24 16:12:56,826","pid":98385,"hostname":"zhengmingdeMacBook-Pro.local","message":"ctx.logger====warn log"}
{"paddingMessage":"[-/127.0.0.1/-/6ms GET /]","level":"ERROR","date":"2020-04-24 16:12:56,826","pid":98385,"hostname":"zhengmingdeMacBook-Pro.local","message":"ctx.logger====error log"}
```

node_sat-web.log

```
2020-04-24 16:12:56,825 INFO 98385 [-/127.0.0.1/-/5ms GET /] ctx.logger====info log
2020-04-24 16:12:56,826 WARN 98385 [-/127.0.0.1/-/6ms GET /] ctx.logger====warn log
2020-04-24 16:12:56,826 ERROR 98385 [-/127.0.0.1/-/6ms GET /] ctx.logger====error log
```

## 4.自定义日志格式

### 1. contextFormatter

1. 访问地址: https://localhost.meetsocial.cn:7001/sat/getUserInfo

2. 加入配置:

```javascript
// config/config.${env}.js
config.customLogger = {
  mylog: {
    file: path.join(appInfo.root, "logs/mylog/mylog.log"),
    contextFormatter(meta) {
      console.log("contextFormatter===\n", meta);
      return `[${meta.date}] [${meta.ctx.method} ${meta.ctx.url}] ${meta.message}`;
    }
  }
};
```

3. 调用打印日志:

```
this.ctx.getLogger('mylog').info(11111);
```

4. 打印日志最终格式:

```
[2020-04-24 16:33:57,878] [GET /sat/getUserInfo] 11111
```

5. 输出的 contextFormatter

```
contextFormatter===
 {
  formatter: [Function: contextFormatter],
  paddingMessage: '[-/127.0.0.1/-/4ms GET /]',
  level: 'INFO',
  date: '2020-04-24 17:14:30,415',
  pid: 2669,
  hostname: 'zhengmingdeMacBook-Pro.local',
  message: '1111'
}
```

### 2. formatter

和 contextFormatter 的区别是没有 meta.ctx 对象

1. 访问地址: https://localhost.meetsocial.cn:7001/sat/getUserInfo

2. 加入配置:

```javascript
// config/config.${env}.js
config.customLogger = {
  mylog: {
    file: path.join(appInfo.root, "logs/mylog/mylog.log"),
    formatter(meta) {
      console.log("formatter====\n", meta);
      return `[${meta.date}] ${meta.message}`;
    }
  }
};
```

3. 调用打印日志:

```
this.app.getLogger('mylog').info(11111);
```

4. 打印日志最终格式:

```
[2020-04-24 17:20:59,565] 1111
```

5. 输出的 formatter

```
formatter====
 {
  level: 'INFO',
  date: '2020-04-24 17:16:09,591',
  pid: 2707,
  hostname: 'zhengmingdeMacBook-Pro.local',
  message: '1111'
}
```

## 5. 实战--每个 http 请求输出自定义的 JSON 文件格式

1. 新建中间件 `app/middleware/mylog.js`:

```javascript
"use strict";
const { v4: uuidv4 } = require("uuid");
module.exports = () => {
  return async function (ctx, next) {
    const startTime = Date.now();
    await next();
    const { code, gcode, msg, message } = ctx.body;
    const obj = {
      traceId: uuidv4(),
      status: code !== undefined ? code : gcode, // 防止 code 为0, 所以判断一下
      msg: msg || message,
      responseTime: Date.now() - startTime
    };
    // JSON.stringfy 会过滤调 undefined 的key
    ctx.getLogger("mylog").info(JSON.stringify(obj));
  };
};
```

2. 配置中间件:

```javascript
// config/config.${env}.js
config.middleware = ["mylog"];
```

3. 自定义日志格式:

```javascript
// config/config.${env}.js
config.customLogger = {
  mylog: {
    file: path.join(appInfo.root, "logs/mylog/mylog.log"),
    contextFormatter(meta) {
      let message;
      try {
        message = JSON.parse(meta.message);
      } catch (e) {}
      return JSON.stringify({
        serviceName: appInfo.name,
        time: meta.date,
        level: meta.level,
        URI: `${meta.ctx.method} ${meta.ctx.url}`,
        ...message
      });
    }
  }
};
```

最终每个 http 请求都写入到了日志目录 `logs/mylog/mylog.log`

```
{"serviceName":"node_sat","time":"2020-04-24 16:56:06,622","level":"INFO","URI":"GET /sat/getUserInfo","traceId":"0d0eeed2-17e9-458a-b159-12c8756d5af7","status":999,"msg":"无效的 token","responseTime":90}
{"serviceName":"node_sat","time":"2020-04-24 16:56:54,144","level":"INFO","URI":"GET /","traceId":"2384e402-fa0d-41fd-8995-a3f4e76a297c","responseTime":1}
```

:::tip 参考地址
https://eggjs.org/zh-cn/core/logger.html
:::
