# Javascript 兼容性问题

### 1. new Date

以下环境 的代码会报错

- IOS 11.1.2 iphoneX safari
- IE11

```javascript
var d = new Date("2018-09-20 19:20:32"); // invalid date
alert(d.getTime());
```

必须改成:

```javascript
var d = new Date("2018/09/20 19:20:32");
alert(d.getTime());
```

chrome 浏览器 或者 用 moment.js

```javascript
moment("2018-09-20 10:58").valueOf();
```
