# 前端错误监控

## 捕获错误

### 1. 捕获通用错误

`window.addEventListener('error')` 可以捕获图片、script、css 加载错误。
`new Image`错误，不能捕获。

另外使用 window.onerror 捕获错误。常规错误和异步错误能捕获。语法错误 和 资源加载错误 不能捕获。

### 2.unhandledrejection 捕获 Promise 加载错误

```js
// 全局统一处理Promise
window.addEventListener("unhandledrejection", function (e) {
  console.log("捕获到异常：", e);
});
fetch("https://tuia.cn/test");
```

### Vue 错误

Vue 里面出现的错误，并不会直接被 window.onerror 捕获，而是会抛给 Vue.config.errorHandler。

```js
/**
 * 全局捕获Vue错误，直接扔出给onerror处理
 */
Vue.config.errorHandler = function (err) {
  setTimeout(() => {
    throw err;
  });
};
```

### React 错误

通过捕获 componentDidCatch

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

class App extends React.Component {
  render() {
    return (
      <ErrorBoundary>
        <MyWidget />
      </ErrorBoundary>
    );
  }
}
```

## 上报接口

为什么使用 1 x 1 的 gif ？

- 没有跨域问题, 不会携带当前域名 cookie
- 不会阻塞页面加载，影响用户体验，只需 new Image 对象
- 相比于 BMP / PNG 体积最小, 可以节约 41% / 35% 网络资源

## 采集聚合端

### 错误标识

### 1. 单个错误条目

生成单个错误的唯一标识，通过 date 和随机值生成一条对应的错误条目 id。

```js
const errorKey = `${+new Date()}@${randomString(8)}`;

function randomString(len) {
  len = len || 32;
  let chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  let maxPos = chars.length;
  let pwd = "";
  for (let i = 0; i < len; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

randomString(8); // 2NwDAJjA
```

### 2. 单个错误事件 errorKey

可以统计这个错误事件的发生的次数。
通过 message、colno 与 lineno 进行相加计算阿斯克码值，可以生成错误的 errorKey。

```js
const eventKey = compressString(String(e.message), String(e.colno) + String(e.lineno));

function compressString(str, key) {
  let chars = "ABCDEFGHJKMNPQRSTWXYZ";
  if (!str || !key) {
    return "null";
  }
  let n = 0,
    m = 0;
  for (let i = 0; i < str.length; i++) {
    n += str[i].charCodeAt();
  }
  for (let j = 0; j < key.length; j++) {
    m += key[j].charCodeAt();
  }
  let num = n + "" + key[key.length - 1].charCodeAt() + m + str[str.length - 1].charCodeAt();
  if (num) {
    num = num + chars[num[num.length - 1]];
  }
  return num;
}
```

## 错误过滤（SDK 配合）

### 域名过滤

只过滤本页面的 script error, 根据 domain 进行过滤

```js
// 伪代码
if (!e.filename || !e.filename.match(/^(http|https):\/\/yun./)) return true;
```

### 重复上报

根据 errorKey 判断重复上报的条数不能超过阀值。

### 错误接收

每秒设置一定的阀值，减少请求量。

### 错误存储

使用阿里云的服务进行存储。

### 可视分析端（可视化平台）

参考地址:
https://juejin.cn/post/6987681953424080926?searchId=20230912110517E980562E7BE25191FF62
