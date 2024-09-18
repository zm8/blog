# 记录手机端

### 1. 获取一些更准确的值办法

`getBoundingClientRect` 比 `offsetHeight` 获取的值更准确

```js
document.querySelector("div").offsetHeight; // 55.1953125
document.querySelector("div").getBoundingClientRect().height; // 55
```

<img width="800" alt="image" src="https://user-images.githubusercontent.com/32337542/154235622-1d7674d4-c7b0-482b-af35-311f67b9f372.png">

### 2. IOS input 的 focus, 不能自动弹起键盘

而 Android 可以

```js
const ref = useRef();
useEffect(() => {
  setTimeout(() => {
    ref.current.focus();
  }, 1000);
}, []);

return <input ref={ref} />;
```

### 3. Promise.prototype.finally() 有的 Android 机不支持

`WebView Android` 支持的版本是 `>=63`
`Safari on iOS` 支持的版本是 `>=11.3`

解决方式:

```
> yarn add promise.prototype.finally
```

```js
const promiseFinally = require("promise.prototype.finally");
promiseFinally.shim();
```

### 4. Proxy

`WebView Android` 支持的版本是 `>=49`
`Safari on iOS` 支持的版本是 `>=10`

### 参考资料

各个 IOS 版本历史:
| 版本 | 时间 | iPhone 机型
| ------ | ------ | ------ |
| 8.0 | 2014 年 9 月 17 日 | iPhone 6/6 Plus
| 9.0 | 2015 年 9 月 16 日 | iPhone 6s/6s Plus
| 10.0 | 2016 年 9 月 13 日 | iPhone 7/7 Plus
| 11.0 | 2017 年 9 月 19 日 | iPhone 8/8 Plus
| 12.0 | 2018 年 9 月 18 日 | iPhone XS、XS Max、XR
| 13.0 | 2019 年 9 月 20 日 | iPhone 11、11 Pro、11 Pro Max、iPhone SE (第二代)
| 14.0 | 2020 年 9 月 17 日 | iPhone 12、12 Pro、12 Pro Max、12 mini
| 15.0 | 2021 年 9 月 21 日 | iPhone 13

:::tip 参考地址
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
:::
